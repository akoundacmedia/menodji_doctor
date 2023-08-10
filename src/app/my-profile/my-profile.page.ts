import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/network/api.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { NavController, AlertController, ViewWillLeave } from '@ionic/angular';
import { Profile } from 'src/models/profile.models';
import { NavigationExtras, Router } from '@angular/router';
import { Helper } from 'src/models/helper.models';
import { Subscription } from 'rxjs';
import { FirebaseUploaderService } from '../services/network/firebase-uploader.service';
import { MyEventsService } from '../services/events/my-events.service';
import { ImageSource, PickerService } from '../services/common/picker.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss']
})
export class MyProfilePage implements OnInit, ViewWillLeave {
  profile: Profile;
  hospitals_text: string;

  private subscriptions = new Array<Subscription>();
  private uploadType = 1;
  private alertedSetup = false;
  fresh_profile: boolean;

  constructor(private navCtrl: NavController, private translate: TranslateService, private router: Router, private alertCtrl: AlertController,
    private apiService: ApiService, private uiElementService: UiElementsService, private fireUpService: FirebaseUploaderService,
    private myEvent: MyEventsService, private pickerService: PickerService) {
    // setTimeout(() => {
    //   let res = "https://i.picsum.photos/id/676/200/200.jpg?hmac=hgeMQEIK4Mn27Q2oLRWjXo1rgxwTbk1CnJE954h_HyM";
    //   this.profile.user.image_url = String(res);
    //   this.saveMe({ image_url: String(res) });
    // }, 5000);
  }

  ngOnInit() {
    if (this.router.getCurrentNavigation().extras.state) this.fresh_profile = this.router.getCurrentNavigation().extras.state.fresh_profile;

    this.profile = Profile.getDefault();
    this.translate.get(["just_moment", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["just_moment"]);
      this.subscriptions.push(this.apiService.getProfile().subscribe(resProfile => {
        console.log("profile", resProfile);
        setTimeout(() => {
          this.profile = resProfile;
          this.setupProfile();
          this.uiElementService.dismissLoading();
        }, 500);
      }, err => {
        console.log("getProfile", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentToast(values["something_wrong"]);
        this.navCtrl.pop();
      }));
    });
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    let selection_temp: { key: string; value: any } = JSON.parse(window.localStorage.getItem("selection_temp"));
    if (selection_temp && selection_temp.key && selection_temp.value) {
      switch (selection_temp.key) {
        case "hospitals":
          this.profile.hospitals = selection_temp.value;
          break;
        case "scope_degree":
          this.profile.degrees = selection_temp.value;
          break;
        case "scope_services":
          this.profile.services = selection_temp.value;
          break;
        case "scope_specializations":
          this.profile.specializations = selection_temp.value;
          break;
        case "scope_type":
          this.profile.types = selection_temp.value;
          break;
      }
      this.setupProfile();
    }
    window.localStorage.removeItem("selection_temp");
  }

  setupProfile() {
    this.hospitals_text = "";
    if (this.profile.hospitals && this.profile.hospitals.length) {
      let hospitals_text_new = "";
      for (let hos of this.profile.hospitals) hospitals_text_new += (hos.name + ", ");
      if (hospitals_text_new.length) {
        hospitals_text_new = hospitals_text_new.substring(0, hospitals_text_new.length - 2);
        this.hospitals_text = hospitals_text_new;
      }
    } else if (!this.alertedSetup) {
      this.alertedSetup = true;
      this.translate.get("setup_profile").subscribe(value => this.uiElementService.presentToast(value));
    }

    if (this.profile && this.profile.experience_years == 0) {
      this.profile.experience_years = null;
    }
    if (this.profile && this.profile.fee == 0) {
      this.profile.fee = null;
    }
  }

  navHospitals() {
    var selectedHospitals = [];
    if (this.profile.hospitals && this.profile.hospitals.length) selectedHospitals = this.profile.hospitals.map((obj) => { return obj.id; });
    let navigationExtras: NavigationExtras = { queryParams: { selectedHospitals: selectedHospitals } };
    this.navCtrl.navigateForward(['./add-hospital'], navigationExtras);
  }

  navCatSelection(scope: string) {
    var selectedScope = [];
    if (this.profile.degrees && this.profile.degrees.length && this.profile.degrees[0].meta.scope.includes(scope)) selectedScope = this.profile.degrees.map((obj) => { return obj.id; });
    if (this.profile.services && this.profile.services.length && this.profile.services[0].meta.scope.includes(scope)) for (let i in this.profile.services) selectedScope.push(this.profile.services[i].id);
    if (this.profile.specializations && this.profile.specializations.length && this.profile.specializations[0].meta.scope.includes(scope)) for (let i in this.profile.specializations) selectedScope.push(this.profile.specializations[i].id);
    if (this.profile.types && this.profile.types.length && this.profile.types[0].meta.scope.includes(scope)) for (let i in this.profile.types) selectedScope.push(this.profile.types[i].id);
    let navigationExtras: NavigationExtras = { queryParams: { scope: scope, selectedScope: selectedScope } };
    this.navCtrl.navigateForward(['./add-degre'], navigationExtras);
  }

  pickImage(upType) {
    this.uploadType = upType;
    this.pickerService.pickImage(ImageSource.ASK).then(imageUri => this.uploadImage(imageUri)).catch(err => this.translate.get(err).subscribe(value => this.uiElementService.presentToast(value)));
  }

  uploadImage(imageUri) {
    this.translate.get(["uploading_image", "uploading_fail"]).subscribe(values => {
      this.uiElementService.presentLoading(values["uploading_image"]);
      this.fireUpService.resolveUriAndUpload(imageUri).then(res => {
        console.log("resolveUriAndUpload", res);
        let imageUrl = String((res as any).url);
        if (this.uploadType == 1) {
          this.profile.image_urls = [imageUrl];
        } else if (this.uploadType == 2) {
          this.profile.user.image_url = imageUrl;
          this.saveMe({ image_url: imageUrl });
        }
        this.uiElementService.dismissLoading();
      }, err => {
        console.log("resolveUriAndUpload", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentErrorAlert(values["uploading_fail"]);
      });
    });
  }

  saveMe(updateRequestIn) {
    this.translate.get(["saving", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["saving"]);
      this.apiService.updateUser(updateRequestIn).subscribe(res => {
        if (this.apiService.getProfileToUse() != null) {
          Helper.setLoggedInUser(res);
          this.apiService.getProfileToUse().user = res;
          Helper.saveProfile(this.apiService.getProfileToUse());
          //this.myEvent.setProfileData(profileMe);
        }
        this.uiElementService.dismissLoading();
      }, err => {
        console.log("updateUser", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentErrorAlert(values["something_wrong"]);
      });
    });
  }

  saveProfile() {
    if (!this.profile.name || !this.profile.name.length) {
      this.translate.get("err_field_profile_name").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.profile.hospitals || !this.profile.hospitals.length) {
      this.translate.get("err_field_profile_hospitals").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.profile.experience_years) {
      this.translate.get("err_field_profile_experience_years").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.profile.fee) {
      this.translate.get("err_field_profile_consultancy_fee").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.profile.meta.fee_online) {
      this.translate.get("err_field_profile_consultancy_fee").subscribe(value => this.uiElementService.presentToast(value));
    }
    // else if (!this.profile.meta.fee_online) {
    //   this.translate.get("err_field_profile_consultancy_fee").subscribe(value => this.uiElementService.presentToast(value));
    // }
    else if (!this.profile.details || this.profile.details.length < 20) {
      this.translate.get("err_field_profile_details").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.profile.degrees || !this.profile.degrees.length) {
      this.translate.get("err_field_profile_degrees").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.profile.services || !this.profile.services.length) {
      this.translate.get("err_field_profile_services").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.profile.specializations || !this.profile.specializations.length) {
      this.translate.get("err_field_profile_specializations").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.profile.types || !this.profile.types.length) {
      this.translate.get("err_field_profile_types").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      let pur = Profile.getUpdateRequest(this.profile);
      if (!pur.availability || !pur.availability.length) {
        this.translate.get("err_field_profile_availability").subscribe(value => this.uiElementService.presentToast(value));
      } else {
        this.translate.get(["updating", "updated", "something_wrong"]).subscribe(values => {
          this.uiElementService.presentLoading(values["updating"]);
          this.subscriptions.push(this.apiService.updateProfile(pur).subscribe(res => {
            this.uiElementService.dismissLoading();
            Helper.saveProfile(res);
            this.apiService.setProfileToUse(res);
            this.uiElementService.presentToast(values["updated"]);

            if (this.fresh_profile) {
              this.navCtrl.navigateRoot([res.hospitals && res.hospitals.length ? './tabs' : './my-profile'], { state: { fresh_profile: true } });
            } else {
              this.navCtrl.pop();
            }

          }, err => {
            console.log("updateProfile", err);
            this.uiElementService.dismissLoading();
            this.uiElementService.presentToast(values["something_wrong"]);
          }));
        });
      }
    }
  }

  exitApp() {
    this.translate.get(["exit_title", "exit_message", "no", "yes"]).subscribe(values => {
      this.alertCtrl.create({
        header: values["exit_title"],
        message: values["exit_message"],
        buttons: [{
          text: values["no"],
          handler: () => { }
        }, {
          text: values["yes"],
          handler: () => {
            Helper.setLoggedInUserResponse(null);
            this.myEvent.setLoginData(null);
          }
        }]
      }).then(alert => alert.present());
    });
  }

}
