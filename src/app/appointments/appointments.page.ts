import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavController, AlertController, Platform, ViewWillLeave } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Helper } from 'src/models/helper.models';
import { Appointment } from 'src/models/appointment.models';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Chat } from 'src/models/chat.models';
import { Constants } from 'src/models/constants.models';
import { APP_CONFIG, AppConfig } from '../app.config';
import { MyEventsService } from '../services/events/my-events.service';
import * as moment from 'moment';
declare var Agora;

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss']
})
export class AppointmentsPage implements OnInit, OnDestroy {
  private subscriptions = new Array<Subscription>();
  appointments = new Array<Appointment>();
  isLoading = true;
  private pageNo = 1;
  private doneAll = false;
  private infiniteScrollEvent;
  private refresherEvent;
  optionsAppointment = -1;

  unRedAppointmentIds: Array<number> = [];

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private navCtrl: NavController, private translate: TranslateService, private alertCtrl: AlertController, private myEvent: MyEventsService,
    private uiElementService: UiElementsService, private apiService: ApiService, private iab: InAppBrowser, private platform: Platform, private myEventsService: MyEventsService) { }

  ngOnInit() {
    this.subscriptions.push(this.myEvent.getUnReadAppointmentIdsObservable().subscribe(res => {
      if (res && res.length) this.unRedAppointmentIds = res;
      console.log("unRedAppointmentIds: ", this.unRedAppointmentIds);
    }));
    this.subscriptions.push(this.myEventsService.getAppointmentObservable().subscribe(res => {
      console.log("res", res);
      if (res && res.id) {
        this.updateAppointmentInList(res);
      }
    }));

    this.pageNo = 1;
    this.appointments = [];
    this.getAppointments();
  }

  // ionViewWillEnter() {
  //   this.translate.get("loading").subscribe(value => {
  //     //this.uiElementService.presentLoading(value);
  //     if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
  //     if (this.refresherEvent) this.refresherEvent.target.complete();
  //     this.pageNo = 1;
  //     this.appointments = [];
  //     this.getAppointments();
  //   });
  // }

  ngOnDestroy() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  doRefresh(event) {
    this.refresherEvent = event;
    this.pageNo = 1;
    this.appointments = [];
    this.getAppointments();
  }

  showOptions(ap: Appointment) {
    this.optionsAppointment = this.optionsAppointment == ap.id ? -1 : ap.id;
  }

  getAppointments() {
    this.isLoading = true;
    this.apiService.getAppointments(this.apiService.getProfileToUse().id, this.pageNo).subscribe(res => {
      this.appointments = this.appointments.concat(res.data);
      this.reFilter();
      this.doneAll = (!res.links || !res.links.next);
      if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      if (this.refresherEvent) this.refresherEvent.target.complete();
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    }, err => {
      console.log("getAppointments", err);
      if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      if (this.refresherEvent) this.refresherEvent.target.complete();
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    });
  }

  doInfiniteAppointments(event) {
    if (this.doneAll) {
      event.target.complete();
    } else {
      this.infiniteScrollEvent = event;
      this.pageNo = this.pageNo + 1;
      this.getAppointments();
    }
  }

  navAppointmentDetail(ap) {
    window.localStorage.setItem("appointment", JSON.stringify(ap));
    this.navCtrl.navigateForward(['./appointment-detail']);
  }

  dialAppointment(ap: Appointment) {
    if (ap.status != "accepted") {
      this.translate.get(("appointment_status_msg_" + ap.status)).subscribe(value => this.uiElementService.presentToast(value));
    } else if (ap.momentAppointment > moment.now()) {
      this.translate.get("appointment_not_started").subscribe(value => this.uiElementService.presentToast((value + " " + ap.date_toshow + ", " + ap.time_from_toshow)));
    } else {
      const component = this;
      if (this.platform.is("cordova") && this.config.agoraVideoConfig.enableAgoraVideo) {
        component.translate.get("just_moment").subscribe(value => {
          component.uiElementService.presentToast(value);
          component.apiService.getAgoraRtmToken(`${ap.doctor.user.id}`).subscribe(res => {
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
    console.log(ap)
    if (Helper.getLoggedInUser() != null) {
      if (ap.status != "accepted") {
        this.translate.get(("appointment_status_msg_" + ap.status)).subscribe(value => this.uiElementService.presentToast(value));
      } else if (ap.momentAppointment > moment.now()) {
        this.translate.get("appointment_not_started").subscribe(value => this.uiElementService.presentToast((value + " " + ap.date_toshow + ", " + ap.time_from_toshow)));
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

  confirmAccept(ap) {
    this.showOptions(ap.id);
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
    this.showOptions(ap.id);
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
    this.showOptions(ap.id);
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

  private updateAppointmentStatus(apId, statusToUpdate) {
    this.translate.get("just_moment").subscribe(value => {
      this.uiElementService.presentToast(value);
      this.subscriptions.push(this.apiService.updateAppointment(apId, { status: statusToUpdate }).subscribe(res => {
        this.uiElementService.dismissLoading();
        if (res.status) this.translate.get("ap_updated_" + res.status).subscribe(text => this.uiElementService.presentToast(text));
        this.updateAppointmentInList(res);
      }, err => {
        console.log("updateAppointment", err);
        this.uiElementService.dismissLoading();
      }));
    });
  }

  private updateAppointmentInList(ap: Appointment) {
    let index = -1;
    for (let i = 0; i < this.appointments.length; i++) {
      if (this.appointments[i].id == ap.id) {
        index = i;
        break;
      }
    }
    if (index != -1) {
      this.appointments[index] = ap;
      if (ap.status == "cancelled" || ap.status == "rejected" || ap.status == "complete") {
        this.reFilter();
      }
    }
  }

  private reFilter() {
    let appointmentUpcoming = new Appointment();
    appointmentUpcoming.id = -1;
    appointmentUpcoming.type = "upcoming_appointments";
    let appointmentPast = new Appointment();
    appointmentPast.id = -2;
    appointmentPast.type = "past_appointments";

    let statusesPast = "cancelled,rejected,complete";
    let now = moment();

    let allAppointments = new Array<Appointment>();
    let pendingAppointmentIds = new Array<number>();
    allAppointments.push(appointmentUpcoming);
    for (let order of this.appointments) if (order.id && order.id > 0 && !statusesPast.includes(order.status) && !this.appointmentDatePassed(now, order)) { allAppointments.push(order); pendingAppointmentIds.push(order.id); }
    allAppointments.push(appointmentPast);
    for (let order of this.appointments) if (order.id && order.id > 0 && !pendingAppointmentIds.includes(order.id)) allAppointments.push(order);

    if (allAppointments[1].id < 0) allAppointments.splice(0, 1);
    if (allAppointments[allAppointments.length - 1].id < 0) allAppointments.splice(allAppointments.length - 1, 1);
    this.appointments = allAppointments.length ? allAppointments : [];
  }

  private appointmentDatePassed(momentNow, appointment: Appointment): boolean {
    if (!appointment.momentAppointment) appointment.momentAppointment = moment(appointment.date + " " + appointment.time_from);
    return momentNow > appointment.momentAppointment;
  }

  private alertLogin() {
    this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }

}
