import { Component, Inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Platform, NavController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from 'src/models/constants.models';
import { APP_CONFIG, AppConfig } from './app.config';
import { ApiService } from './services/network/api.service';
import { UiElementsService } from './services/common/ui-elements.service';
import { MyEventsService } from './services/events/my-events.service';
import { Helper } from 'src/models/helper.models';
import { Profile } from 'src/models/profile.models';
import { Device } from '@ionic-native/device/ngx';
import * as firebase from 'firebase';
import { VtPopupPage } from './vt-popup/vt-popup.page';
declare var Agora;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(IonRouterOutlet, { static: false }) routerOutlets: IonRouterOutlet;
  rtlSide = "left";
  profileMe: Profile;

  private unReadIndicationRef: firebase.database.Reference;

  constructor(@Inject(APP_CONFIG) public config: AppConfig,
    private platform: Platform, private apiService: ApiService,
    private splashScreen: SplashScreen, private modalController: ModalController,
    private statusBar: StatusBar, private uiElementService: UiElementsService,
    private translate: TranslateService, private device: Device,
    private navCtrl: NavController, private myEvent: MyEventsService) { }

  ngOnDestroy() {
    this.unRegisterUpdates();
  }

  ngOnInit() {
    this.initializeApp();
    this.myEvent.getLanguageObservable().subscribe(value => {
      this.globalize(value);
      this.apiService.setupHeaders();
      this.navCtrl.navigateRoot([this.profileMe ? './tabs' : './sign-in']);
    });
    this.myEvent.getLoginObservable().subscribe(loginRes => {
      if (loginRes && loginRes.token && loginRes.user) {
        this.translate.get(["verifying_profile", "something_wrong"]).subscribe(values => {
          this.uiElementService.presentLoading(values["verifying_profile"]);
          Helper.setLoggedInUserResponse(loginRes);
          this.apiService.setupHeaders(loginRes.token);
          this.apiService.getProfile().subscribe(resProfile => {
            this.uiElementService.dismissLoading();
            if (resProfile && resProfile.user) {
              this.profileMe = resProfile;
              Helper.saveProfile(resProfile);
              this.apiService.setProfileToUse(this.profileMe);
              if (this.platform.is('cordova') && this.profileMe) this.updatePlayerId();
              if (!resProfile.meta || !resProfile.meta.documents) {
                this.navCtrl.navigateRoot(['./document-verification'], { state: { fresh_profile: true } });
              } else if (!resProfile.hospitals || !resProfile.hospitals.length) {
                this.navCtrl.navigateRoot(['./my-profile'], { state: { fresh_profile: true } });
              } else {
                this.navCtrl.navigateRoot(['./tabs']);
              }
            } else {
              this.apiService.setupHeaders(null);
              this.uiElementService.presentToast(values["something_wrong"]);
            }
          }, err => {
            console.log("getProfile", err);
            this.apiService.setupHeaders(null);
            this.uiElementService.dismissLoading();
            this.uiElementService.presentToast(values["something_wrong"]);
          });
        });
      } else {
        this.profileMe = null;
        this.unRegisterUpdates();
        this.apiService.setProfileToUse(null);
        this.navCtrl.navigateRoot(['./sign-in']);

        try {
          (<any>window).FirebasePlugin.signOutUser(function () {
            console.log("User signed out");
          }, function (error) {
            console.error("Failed to sign out user: " + error);
          });
        } catch (e) { console.log("fireSignout", e); }

        try {
          firebase.auth().signOut().then(function () {
            console.log('Signed Out');
          }, function (error) {
            console.error('Sign Out Error', error);
          });
        } catch (e) { console.log("fireSignout", e); }

        if (this.platform.is("cordova")) {
          //logout of Agora SDK
          Agora.logout((res) => {
            console.log("Agora-logout", res);
          }, (err) => {
            console.log("Agora-logout", err);
          });
        }

      }
      this.refreshSettings();
    });
  }

  async presentModal() {
    window.localStorage.setItem(Constants.KEY_IS_DEMO_MODE, "true");
    const modal = await this.modalController.create({
      component: VtPopupPage,
    });
    return await modal.present();
  }

  initializeApp() {
    this.globalize(Helper.getLanguageDefault());
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.show();

      firebase.initializeApp({
        apiKey: this.config.firebaseConfig.apiKey,
        authDomain: this.config.firebaseConfig.authDomain,
        databaseURL: this.config.firebaseConfig.databaseURL,
        projectId: this.config.firebaseConfig.projectId,
        storageBucket: this.config.firebaseConfig.storageBucket,
        messagingSenderId: this.config.firebaseConfig.messagingSenderId
      });
      if (this.platform.is('cordova')) this.initOneSignal();

      this.apiService.setUuidAndPlatform(this.device.uuid, this.device.platform);
      this.refreshSettings();

      setTimeout(() => {
        this.profileMe = Helper.getProfile();
        this.apiService.setProfileToUse(this.profileMe);
        if (this.config.demoMode && this.platform.is('cordova') && !window.localStorage.getItem(Constants.KEY_IS_DEMO_MODE)) {
          window.localStorage.setItem(Constants.KEY_IS_DEMO_MODE, "true");
          this.language();
          setTimeout(() => this.presentModal(), 30000);
        } else {
          if (this.profileMe == null) {
            this.navCtrl.navigateRoot(['./sign-in']);
          } else if (!this.profileMe.meta || !this.profileMe.meta.documents) {
            this.navCtrl.navigateRoot(['./document-verification'], { state: { fresh_profile: true } });
          } else if (!this.profileMe.hospitals || !this.profileMe.hospitals.length) {
            this.navCtrl.navigateRoot(['./my-profile'], { state: { fresh_profile: true } });
          } else {
            this.navCtrl.navigateRoot(['./tabs']);
          }
        }
        if (this.profileMe) this.registerUpdates();
        if (this.platform.is('cordova') && this.profileMe) this.updatePlayerId();
        if (this.profileMe) this.refreshProfile();
        setTimeout(() => this.splashScreen.hide(), 500);
        // let navigationExtras: NavigationExtras = { state: { auth_res: { "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMWE2ZjAyYTA2YzFjYTkxZmU5YWU4NjI3Y2U4YjNiNjViZDgxZTZlY2M4MGI1ZGI2MTQxMzdlNzU0ODIzZjRlY2YyYzFhNjFmYzYzNDMyNDkiLCJpYXQiOjE1OTQ2NTMzODgsIm5iZiI6MTU5NDY1MzM4OCwiZXhwIjoxNjI2MTg5Mzg4LCJzdWIiOiI0Iiwic2NvcGVzIjpbXX0.Nn_H_19DGpZSe_iqZbREeoTwt_NGpzXZ27VcsFO6nnnxV35uU1DysvkRp5Z8L1SjtofYStccryl800L1noo7jtWz8bPOI-OxdkdcWta6AKuJP7t0pcu5_xp8zfNM1pdD5YOVDtyCrxJcXDsf3ixody7_rwXWKIBq2wdAIgaiYULtSO6eB1mVizxjGpZSZbbgLhOCFwKaOI5fZx5M7FXExJG6KKZBD4KGmXQYTIvDj44POugE_e6wNVB2GB_RDUoRKil6S2mMdDbwrVwnvJA9YviohzLm61yYbMrFC4sW_reLKoFWp-ja4zQJ3sb7Sl953AR2MBxHhfGyRVv-33tAhKT3ns7A0ohHtdGFzaH1JoHF26LfQGOUy6xXoPKMHSTYg6TCGrukGencn7UK_thm3Bp32eZmzgDb2fvkKMQaEAkwKfKTHx1YNA-vWIHNE25DUIKOk4TuXdwRYV41iOs0KzKNV7GHiXHvaFHd4jNv7q0zuCD4fPM8wvI9TaBWP4lEJctq66h78gBE-aPgclnWCLdXvlQ3vm0LraoEgFBWYuqB6_xjeH3sMEiXR4-tTX1KqExruWMyCkT5pfRXXbBIGHSUEDB72VPWX5eSyHK1qp3oZHvUFl6r6Ply7M9gbW1jI8zkzmXIF-3WWpjCTlh7JTIRuVd8m4BXvfThMnHW-H8", "user": { "id": 4, "name": "test doctor", "email": "testdoctor@doctoworld.com", "mobile_number": "+918787878787", "mobile_verified": 1, "active": 1, "language": "en", "notification": null, "meta": null, "remember_token": null, "created_at": "2020-07-13 15:10:59", "updated_at": "2020-07-13 15:11:11" } } } };
        // this.navCtrl.navigateRoot(['./my-profile'], navigationExtras);

        this.platform.backButton.subscribe(() => {
          if (this.routerOutlets && this.routerOutlets.canGoBack()) {
            this.routerOutlets.pop();
          } else {
            navigator['app'].exitApp();
          }
        });
      }, 2000);

      this.globalize(Helper.getLanguageDefault());
    });
  }

  private registerUpdates() {
    if (!this.unReadIndicationRef) {
      const component = this;
      this.unReadIndicationRef = firebase.database().ref(Constants.REF_INDICATION);
      this.unReadIndicationRef.child(String(this.profileMe.user.id + Constants.ROLE_DOCTOR)).on("value", (snapshot) => {
        let apIdNotiMap = snapshot.val() as any;
        console.log(apIdNotiMap);
        if (apIdNotiMap) {
          component.myEvent.setUnReadAppointmentIds(Object.keys(apIdNotiMap) as Array<string>);
        }
      });
    }
  }

  private unRegisterUpdates() {
    if (this.unReadIndicationRef) {
      this.unReadIndicationRef.off();
      this.unReadIndicationRef = null;
    }
  }

  globalize(languagePriority) {
    this.translate.setDefaultLang("en");
    let defaultLangCode = this.config.availableLanguages[0].code;
    this.translate.use(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    this.setDirectionAccordingly(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    Helper.setLocale(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar': {
        this.rtlSide = "rtl";
        break;
      }
      default: {
        this.rtlSide = "ltr";
        break;
      }
    }
  }

  initOneSignal() {
    if (this.config.oneSignalAppId && this.config.oneSignalAppId.length) {
      (<any>window).plugins.OneSignal.setAppId(this.config.oneSignalAppId);
      (<any>window).plugins.OneSignal.setNotificationOpenedHandler(function (jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      });
      (<any>window).plugins.OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
        console.log("User accepted notifications: " + accepted);
      });
      // this.oneSignal.startInit(this.config.oneSignalAppId, this.config.oneSignalGPSenderId);
      // this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      // this.oneSignal.handleNotificationReceived().subscribe((data) => {
      //   console.log(data);
      //   Helper.saveNotification((data.payload.additionalData && data.payload.additionalData.title) ? data.payload.additionalData.title : data.payload.title,
      //     (data.payload.additionalData && data.payload.additionalData.body) ? data.payload.additionalData.body : data.payload.body,
      //     String(new Date().getTime()));
      //   let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
      //   if (!noti_ids_processed) noti_ids_processed = new Array<string>();
      //   noti_ids_processed.push(data.payload.notificationID);
      //   window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
      // });
      // this.oneSignal.handleNotificationOpened().subscribe((data) => {
      //   let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
      //   if (!noti_ids_processed) noti_ids_processed = new Array<string>();
      //   let index = noti_ids_processed.indexOf(data.notification.payload.notificationID);
      //   if (index == -1) {
      //     Helper.saveNotification((data.notification.payload.additionalData && data.notification.payload.additionalData.title) ? data.notification.payload.additionalData.title : data.notification.payload.title,
      //       (data.notification.payload.additionalData && data.notification.payload.additionalData.body) ? data.notification.payload.additionalData.body : data.notification.payload.body,
      //       String(new Date().getTime()));
      //   } else {
      //     noti_ids_processed.splice(index, 1);
      //     window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
      //   }
      // });
      // this.oneSignal.endInit();
    }
  }

  updatePlayerId() {
    //initialize Agora SDK with Agora App ID
    if (this.platform.is("cordova")) {
      if (this.config.agoraVideoConfig.enableAgoraVideo) {
        Agora.initAgora(this.config.agoraVideoConfig.agoraAppId, (res) => {
          console.log("Agora-initAgora", res);
          this.apiService.getAgoraRtmToken(`${this.profileMe.user.id}`).subscribe(res => {
            if (res && res.token) {
              //login to Agora sdk.
              Agora.loginUser(res.token, String(this.profileMe.user.id), (res) => {
                console.log("Agora-loginUser", res);
              }, (err) => {
                console.log("Agora-loginUser", err);
              });
            }
          }, err => console.log("getAgoraRtmToken", err));
        }, (err) => {
          console.log("Agora-initAgora", err);
          this.uiElementService.presentToast("Unable to instantiate Agora")
        });
      }

      const component = this;
      (<any>window).plugins.OneSignal.addSubscriptionObserver(function (state) {
        if (state && state.to && state.to.userId) {
          let defaultLang = Helper.getLanguageDefault();
          component.apiService.updateUser({
            notification: "{\"" + Constants.ROLE_DOCTOR + "\":\"" + state.to.userId + "\"}",
            language: (defaultLang && defaultLang.length) ? defaultLang : component.config.availableLanguages[0].code
          }).subscribe(res => console.log('updateUser', res), err => console.log('updateUser', err));
          firebase.database().ref(Constants.REF_USERS_FCM_IDS).child((component.profileMe.user.id + Constants.ROLE_DOCTOR)).set(state.to.userId);
        }
        console.log("Push Subscription state changed: " + JSON.stringify(state));
      });
      // this.oneSignal.getIds().then((id) => {
      //   if (id && id.userId) {
      //     let defaultLang = Helper.getLanguageDefault();

      //     this.apiService.updateUser({
      //       notification: "{\"" + Constants.ROLE_DOCTOR + "\":\"" + id.userId + "\"}",
      //       language: (defaultLang && defaultLang.length) ? defaultLang : this.config.availableLanguages[0].code
      //     }).subscribe(res => console.log('updateUser', res), err => console.log('updateUser', err));

      //     firebase.database().ref(Constants.REF_USERS_FCM_IDS).child((this.profileMe.user.id + Constants.ROLE_DOCTOR)).set(id.userId);
      //   }
      // });
    }
  }

  refreshSettings() {
    this.apiService.getSettings().subscribe(res => { console.log('getSettings', res); Helper.setSettings(res); }, err => console.log('getSettings', err));
  }


  language() {
    this.navCtrl.navigateRoot(['./change-language']);
  }

  refreshProfile() {
    this.profileMe = Helper.getProfile();
    this.apiService.getProfile().subscribe(resProfile => {
      if (resProfile && resProfile.user && resProfile.name && resProfile.name.length) {
        Helper.saveProfile(resProfile);
        this.profileMe = resProfile;
        this.registerUpdates();
        if (this.profileMe.is_verified != 1) this.uiElementService.presentErrorAlert(this.translate.instant("document_verification_alert_text"), this.translate.instant("document_verification_status_pending"), this.translate.instant("okay"))
      }
    }, err => {
      console.log("getProfile", err); Helper.setLoggedInUserResponse(null);
      this.myEvent.setLoginData(null);
    });
  }
}
