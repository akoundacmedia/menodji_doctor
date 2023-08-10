import { Component, Inject, OnInit } from '@angular/core';
import { Appointment } from 'src/models/appointment.models';
import { Helper } from 'src/models/helper.models';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Subscription } from 'rxjs';
import { Chat } from 'src/models/chat.models';
import { Constants } from 'src/models/constants.models';
import { NavigationExtras } from '@angular/router';
import { AppConfig, APP_CONFIG } from '../app.config';
import * as moment from 'moment';
import { MyEventsService } from '../services/events/my-events.service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
declare var Agora;

@Component({
  selector: 'app-appointment-detail',
  templateUrl: './appointment-detail.page.html',
  styleUrls: ['./appointment-detail.page.scss']
})
export class AppointmentDetailPage implements OnInit {
  public ap: Appointment;
  ap_date_formatted: string;
  private subscriptions = new Array<Subscription>();
  // updateAppointment: boolean = false;

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private navCtrl: NavController, private translate: TranslateService, private alertCtrl: AlertController,
    private uiElementService: UiElementsService, private apiService: ApiService, private iab: InAppBrowser, private platform: Platform, private myEventService: MyEventsService,
    private photoViewer: PhotoViewer) { }

  ngOnInit() {
    if (this.ap == null) this.ap = JSON.parse(window.localStorage.getItem("appointment"));
    if (this.ap && this.ap.momentAppointment) this.ap.momentAppointment = moment(this.ap.date + " " + this.ap.time_from);
    window.localStorage.removeItem("appointment");
    this.ap_date_formatted = Helper.formatTimestampDateTime((this.ap.date + " " + this.ap.time_from), Helper.getLocale());
    console.log("this", this.ap)
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  dialAppointment(ap: Appointment) {
    if (this.ap.status != "accepted") {
      this.translate.get(("appointment_status_msg_" + this.ap.status)).subscribe(value => this.uiElementService.presentToast(value));
    } else if (this.ap.momentAppointment > moment.now()) {
      this.translate.get("appointment_not_started").subscribe(value => this.uiElementService.presentToast((value + " " + this.ap.date_toshow + ", " + this.ap.time_from_toshow)));
    } else {
      const component = this;
      if (this.platform.is("cordova") && this.config.agoraVideoConfig.enableAgoraVideo) {
        component.translate.get("just_moment").subscribe(value => {
          component.uiElementService.presentToast(value);
          component.apiService.getAgoraRtmToken(`${component.ap.doctor.user.id}`).subscribe(res => {
            if (res && res.token) {
              Agora.loginUser(res.token, String(ap.doctor.user.id), (res) => {
                console.log("Agora-loginUser", res);
                //component.uiElementService.dismissLoading();
                component.callAgoraUser(ap);
              }, (err) => {
                console.log("Agora-loginUser", err);
                //component.uiElementService.dismissLoading();
                if (err == "LOGIN_ERR_ALREADY_LOGGED_IN") { component.callAgoraUser(ap); }
              });
            } else {
              component.translate.get("live_token_error").subscribe(value => component.uiElementService.presentToast(value));
            }
          }, err => {
            console.log("getAgoraRtmToken", err);
            component.translate.get("live_token_error").subscribe(value => component.uiElementService.presentToast(value));
          });
        });
      } else {
        this.iab.create((("https://api.whatsapp.com/send?phone=" + ap.user.mobile_number)), "_system");
      }
    }
  }

  callAgoraUser(ap: Appointment) {
    const component = this;
    let myId = String(ap.doctor.user.id);
    let peerId = String(ap.user.id);
    let channelId = Helper.getAgoraChannelId(myId, peerId);
    component.apiService.getAgoraRtcToken(channelId).subscribe(res => {
      if (res && res.token) {
        Agora.callUser(peerId, channelId, JSON.stringify({
          image_callee: ap.user.image_url,
          image_caller: ap.doctor.user.image_url,
          name_callee: ap.user.name,
          name_caller: ap.doctor.name,
          channel_token: res.token,
        }), (res) => {
          console.log("Agora-callUser", res);
        }, (err) => {
          console.log("Agora-callUser", err);
          if (err == "peer_offline") {
            component.translate.get(["user_offline_title", "user_offline_message", "yes", "cancel", "user_video_request_noti_message"]).subscribe(values => {
              component.alertCtrl.create({
                header: values["user_offline_title"],
                message: values["user_offline_message"],
                buttons: [{
                  text: values["cancel"],
                  handler: () => { }
                }, {
                  text: values["yes"],
                  handler: () => {
                    component.apiService.postNotificationContent(Constants.ROLE_USER, ap.user.id, ap.doctor.user.name, values['user_video_request_noti_message']).subscribe(res => console.log("notiS", res), err => console.log("notiF", err));
                  }
                }]
              }).then(alert => alert.present());
            });
          } else if (err != "no_permission") {
            component.translate.get("something_wrong").subscribe(value => component.uiElementService.presentToast(value));
          }
        });
      } else {
        component.translate.get("live_token_error").subscribe(value => component.uiElementService.presentToast(value));
      }
    }, err => {
      console.log("getAgoraRtcToken", err);
      component.translate.get("live_token_error").subscribe(value => component.uiElementService.presentToast(value));
    });
  }

  chatAppointment(ap: Appointment) {
    if (Helper.getLoggedInUser() != null) {
      if (this.ap.status != "accepted") {
        this.translate.get(("appointment_status_msg_" + this.ap.status)).subscribe(value => this.uiElementService.presentToast(value));
      } else if (this.ap.momentAppointment > moment.now()) {
        this.translate.get("appointment_not_started").subscribe(value => this.uiElementService.presentToast((value + " " + this.ap.date_toshow + ", " + this.ap.time_from_toshow)));
      } else {
        let chat = new Chat();
        chat.chatId = ap.user.id + Constants.ROLE_USER;
        chat.chatImage = ap.user.image_url;
        chat.chatName = ap.user.name;
        chat.chatStatus = Helper.formatTimestampDateTime((ap.date + " " + ap.time_from), Helper.getLocale()) + ((ap.meta && ap.meta.reason) ? (" | " + ap.meta.reason) : "");
        chat.myId = ap.doctor.user_id + Constants.ROLE_DOCTOR;
        let navigationExtras: NavigationExtras = { state: { chat: chat, ap_user: ap.user, ap_id: ap.id } };
        this.navCtrl.navigateForward(['./chat'], navigationExtras);
      }
    } else {
      this.alertLogin();
    }
  }

  private alertLogin() {
    this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }

  // navAppointment() {
  //   this.iab.create((("http://maps.google.com/maps?daddr=" + this.ap.latitude + "," + this.ap.longitude)), "_system");
  // }

  viewRecord(recordLink) {
    // this.iab.create(recordLink, "_system");
    this.photoViewer.show(recordLink);
  }

  confirmAccept(ap) {
    this.translate.get(["accept_ap_title", "accept_ap_message", "no", "yes"]).subscribe(values => {
      this.alertCtrl.create({
        header: values["accept_ap_title"],
        message: values["accept_ap_message"],
        buttons: [{
          text: values["no"],
          handler: () => { }
        }, {
          text: values["yes"],
          handler: () => {
            this.updateAppointmentStatus(ap.id, 'accepted');
          }
        }]
      }).then(alert => alert.present());
    });
  }

  confirmReject(ap) {
    this.translate.get(["reject_ap_title", "reject_ap_message", "no", "yes"]).subscribe(values => {
      this.alertCtrl.create({
        header: values["reject_ap_title"],
        message: values["reject_ap_message"],
        buttons: [{
          text: values["no"],
          handler: () => { }
        }, {
          text: values["yes"],
          handler: () => {
            this.updateAppointmentStatus(ap.id, 'rejected');
          }
        }]
      }).then(alert => alert.present());
    });
  }

  confirmComplete(ap) {
    if (moment() > ap.momentAppointment) {
      this.translate.get(["complete_ap_title", "complete_ap_message", "no", "yes"]).subscribe(values => {
        this.alertCtrl.create({
          header: values["complete_ap_title"],
          message: values["complete_ap_message"],
          buttons: [{
            text: values["no"],
            handler: () => { }
          }, {
            text: values["yes"],
            handler: () => {
              this.updateAppointmentStatus(ap.id, 'complete');
            }
          }]
        }).then(alert => alert.present());
      });
    } else {
      this.translate.get("appointment_not_started").subscribe(value => this.uiElementService.presentToast(value));
    }
  }

  updateAppointmentStatus(apId, statusToUpdate) {
    // this.ap.status = statusToUpdate;
    this.translate.get("just_moment").subscribe(value => {
      this.uiElementService.presentLoading(value);
      this.subscriptions.push(this.apiService.updateAppointment(apId, { status: statusToUpdate }).subscribe(res => {
        // this.ap = res;
        // console.log(this.ap)
        this.uiElementService.dismissLoading();
        if (res.status) this.translate.get("ap_updated_" + res.status).subscribe(text => this.uiElementService.presentToast(text));
        // this.updateAppointment = true;
        this.navCtrl.pop();
        this.myEventService.setAppointmentData(res);
        // window.localStorage.setItem("appointment", JSON.stringify(res));
        // this.ap = JSON.parse(window.localStorage.getItem("appointment"));
        // window.localStorage.removeItem("appointment");
      }, err => {
        console.log("updateAppointment", err);
        // this.updateAppointment = false;
        this.uiElementService.dismissLoading();
        this.navCtrl.pop();
      }));
    });
  }

}
