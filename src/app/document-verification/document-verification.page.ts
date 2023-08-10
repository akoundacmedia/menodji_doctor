import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from 'src/models/helper.models';
import { ImageSource, PickerService } from '../services/common/picker.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { MyEventsService } from '../services/events/my-events.service';
import { ApiService } from '../services/network/api.service';
import { FirebaseUploaderService } from '../services/network/firebase-uploader.service';

@Component({
  selector: 'app-document-verification',
  templateUrl: './document-verification.page.html',
  styleUrls: ['./document-verification.page.scss'],
})
export class DocumentVerificationPage implements OnInit {
  fresh_profile: boolean;
  uploadType: string;
  documents: { national_id: string; doctor_licence: string; medical_council_reg: string; };
  uploadingDoc: boolean = true;

  constructor(private navCtrl: NavController, private fireUpService: FirebaseUploaderService, private alertCtrl: AlertController,
    private uiElementService: UiElementsService, private router: Router, private translate: TranslateService,
    private pickerService: PickerService, private myEvent: MyEventsService, private apiService: ApiService) { }

  ngOnInit() {
    if (this.router.getCurrentNavigation().extras.state) this.fresh_profile = this.router.getCurrentNavigation().extras.state.fresh_profile;
    this.uploadingDoc = true;
    let profile = this.apiService.getProfileToUse();
    if (profile && profile.meta && profile.meta.documents) this.documents = profile.meta.documents;
    if (!this.documents) this.documents = { national_id: "", doctor_licence: "", medical_council_reg: "" };
    // console.log("documents",this.documents);

    // setTimeout(() => {
    //   this.documents.national_id = "https://i.picsum.photos/id/242/200/300.jpg?hmac=_v7qaiV_fwDB3NP9lpirq7rMvS10u8lHjqMYNmmXya4";
    // }, 1000);

    // setTimeout(() => {
    //   this.documents.doctor_licence = "https://i.picsum.photos/id/242/200/300.jpg?hmac=_v7qaiV_fwDB3NP9lpirq7rMvS10u8lHjqMYNmmXya4";
    // }, 2000);

    // setTimeout(() => {
    //   this.documents.medical_council_reg = "https://i.picsum.photos/id/242/200/300.jpg?hmac=_v7qaiV_fwDB3NP9lpirq7rMvS10u8lHjqMYNmmXya4";
    // }, 3000);
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

  pickImage(type) {
    this.uploadType = type;
    this.pickerService.pickImage(ImageSource.ASK).then(imageUri => this.uploadFile(imageUri)).catch(err => this.translate.get(err).subscribe(value => this.uiElementService.presentToast(value)));
  }

  private uploadFile(fileUri) {
    this.translate.get(["uploading", "uploading_fail"]).subscribe(values => {
      this.uiElementService.presentLoading(this.translate.instant(this.uploadType) + " " + values["uploading"]);
      this.fireUpService.resolveUriAndUpload(fileUri).then(res => {
        let imageUrl = String((res as any).url);
        this.fillDocuments(imageUrl);
      }, err => {
        console.log("resolveUriAndUpload", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentErrorAlert(values["uploading_fail"]);
      });
    });
  }

  private fillDocuments(imageUrl: string) {
    this.uploadingDoc = false;
    setTimeout(() => {
      if (this.uploadType == 'national_id_passport') this.documents.national_id = imageUrl;
      if (this.uploadType == 'doctor_licence') this.documents.doctor_licence = imageUrl;
      if (this.uploadType == 'medical_council_registration') this.documents.medical_council_reg = imageUrl;
      this.uploadingDoc = true;
      this.uiElementService.presentToast(this.translate.instant(this.uploadType) + " " + this.translate.instant("updated"));
      this.uiElementService.dismissLoading();
    }, 100);
  }

  onSubmit() {
    if (!this.documents.national_id || !this.documents.national_id.length) {
      this.translate.get("err_national_id_passport").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.documents.doctor_licence || !this.documents.doctor_licence.length) {
      this.translate.get("err_doctor_licence").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.documents.medical_council_reg || !this.documents.medical_council_reg.length) {
      this.translate.get("err_medical_council_reg").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      this.translate.get(["saving", "saved", "something_wrong"]).subscribe(values => {
        this.uiElementService.presentLoading(values["saving"]);
        let profile = this.apiService.getProfileToUse();
        profile.meta.documents = this.documents;
        let pur = { name: profile.name && profile.name.length ? profile.name : profile.user.name, meta: JSON.stringify(profile.meta) };
        this.apiService.updateProfile(pur).subscribe(res => {
          this.uiElementService.dismissLoading();
          Helper.saveProfile(res);
          this.apiService.setProfileToUse(res);
          this.uiElementService.presentToast(values["saved"]);

          if (this.fresh_profile) {
            this.navCtrl.navigateRoot([res.hospitals && res.hospitals.length ? './tabs' : './my-profile'], { state: { fresh_profile: true } });
          } else {
            this.navCtrl.pop();
          }
        }, err => {
          // let profile = this.apiService.getProfileToUse();
          // this.navCtrl.navigateRoot([profile.hospitals && profile.hospitals.length ? './tabs' : './my-profile'], { state: { fresh_profile: true } });
          console.log("updateProfile", err);
          this.uiElementService.dismissLoading();
          this.uiElementService.presentToast(values["something_wrong"]);
        });
      });
    }
  }
}
