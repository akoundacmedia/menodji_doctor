import { Component, OnInit, Inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { APP_CONFIG, AppConfig } from '../app.config';
import { Helper } from 'src/models/helper.models';
import { MyEventsService } from '../services/events/my-events.service';
import { TranslateService } from '@ngx-translate/core';
import { Profile } from 'src/models/profile.models';
import { ApiService } from '../services/network/api.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss']
})
export class AccountPage implements OnInit {
  profileMe: Profile;

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private navCtrl: NavController, private myEvent: MyEventsService,
    private myEventService: MyEventsService, private translate: TranslateService, private alertCtrl: AlertController, private apiService: ApiService,
    private uiElementService: UiElementsService, private inAppBrowser: InAppBrowser) { }

  ngOnInit() {
    //this.myEventService.getProfileObservable().subscribe(value => this.profileMe = value);
  }
  ionViewDidEnter() {
    this.profileMe = this.apiService.getProfileToUse();
  }
  my_profile() {
    this.navCtrl.navigateForward(['./my-profile']);
  }
  my_documents() {
    this.navCtrl.navigateForward(['./document-verification']);
  }
  my_wallet() {
    this.navCtrl.navigateForward(['./wallet']);
  }
  contact_us() {
    this.navCtrl.navigateForward(['./contact-us']);
  }

  change_language() {
    this.navCtrl.navigateForward(['./change-language']);
  }

  navTncs() {
    this.navCtrl.navigateForward(['./tnc']);
  }
  faqs() {
    this.navCtrl.navigateForward(['./faq']);
  }
  logout() {
    this.translate.get(["logout_title", "logout_message", "no", "yes"]).subscribe(values => {
      this.alertCtrl.create({
        header: values["logout_title"],
        message: values["logout_message"],
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
  buyAppAction() {
    this.translate.get("just_moment").subscribe(value => {
      this.uiElementService.presentLoading(value);
      this.apiService.getContactLink().subscribe(res => {
        this.uiElementService.dismissLoading();
        this.inAppBrowser.create((res.link ? res.link : "https://bit.ly/cc_DoctoWorld"), "_system");
      }, err => {
        console.log("getContactLink", err);
        this.uiElementService.dismissLoading();
        this.inAppBrowser.create("https://bit.ly/cc_DoctoWorld", "_system");
      });
    });
  }

  developed_by() {
    this.inAppBrowser.create("https://verbosetechlabs.com/", "_system");
  }
}
