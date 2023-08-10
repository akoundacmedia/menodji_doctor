import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/models/user.models';
import { Chat } from 'src/models/chat.models';
import { Router } from '@angular/router';
import { UiElementsService } from '../services/common/ui-elements.service';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from 'src/models/helper.models';
import { Constants } from 'src/models/constants.models';
import { Message } from 'src/models/message.models';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ApiService } from '../services/network/api.service';
import { Profile } from 'src/models/profile.models';
import * as firebase from 'firebase';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit {
  @ViewChild("content", { static: true }) content: any;
  userMe: User;
  chatChild: string;
  userPlayerId: string;
  newMessageText: string;
  chatRef: firebase.database.Reference;
  inboxRef: firebase.database.Reference;
  unReadIndicationRef: firebase.database.Reference;
  messages = new Array<Message>();
  chat = new Chat();
  private ap_user: User;
  private ap_id: number;
  private profileMe: Profile;

  constructor(private router: Router, private uiElementService: UiElementsService,
    private translate: TranslateService, private iab: InAppBrowser, private apiService: ApiService) { }

  ngOnInit() {
    if (this.router.getCurrentNavigation().extras.state) {
      this.chat = this.router.getCurrentNavigation().extras.state.chat;
      this.ap_user = this.router.getCurrentNavigation().extras.state.ap_user;
      this.ap_id = this.router.getCurrentNavigation().extras.state.ap_id;

      this.profileMe = Helper.getProfile();
      this.userMe = Helper.getLoggedInUser();
      this.chatChild = Helper.getChatChild(this.chat.myId, this.chat.chatId);

      const component = this;
      this.unReadIndicationRef = firebase.database().ref(Constants.REF_INDICATION);
      this.inboxRef = firebase.database().ref(Constants.REF_INBOX);
      this.chatRef = firebase.database().ref(Constants.REF_CHAT);

      //MARK READ FOR THIS CONVERSATION
      this.unReadIndicationRef.child(this.chat.myId).child(String(this.ap_id)).remove();
      //LOAD MESSAGES
      this.chatRef.child(this.chatChild).limitToLast(20).on("child_added", function (snapshot, prevChildKey) {
        var newMessage = snapshot.val() as Message;
        if (newMessage) {
          newMessage.timeDiff = Helper.formatMillisDateTimeWOYear(Number(newMessage.dateTimeStamp), Helper.getLocale());
          component.addMessage(newMessage);
          component.markDelivered();
          component.scrollList();
        }
      }, function (error) {
        console.error("child_added", error);
      });

      firebase.database().ref(Constants.REF_USERS_FCM_IDS).child(this.chat.chatId).once("value", function (snap) {
        component.userPlayerId = snap.val();
      });

      this.translate.get("just_moment").subscribe(value => this.uiElementService.presentToast(value));

    }
  }

  ionViewWillLeave() {
    //MARK READ FOR THIS CONVERSATION
    this.unReadIndicationRef.child(this.chat.myId).child(String(this.ap_id)).remove();
  }

  scrollList() {
    this.content.scrollToBottom(300);
  }

  markDelivered() {
    if (this.messages && this.messages.length) {
      if (this.messages[this.messages.length - 1].senderId != this.chat.myId) {
        this.messages[this.messages.length - 1].delivered = true;
        this.chatRef.child(this.chatChild).child(this.messages[this.messages.length - 1].id).child("delivered").set(true);
      }
      // else {
      //   let toNotify;
      //   if (!this.messages[this.messages.length - 1].delivered) {
      //     toNotify = this.messages[this.messages.length - 1];
      //     this.messages[this.messages.length - 1].delivered = true;
      //   }
      //   if (toNotify) {
      //     this.notifyMessages(toNotify);
      //   }
      // }
    }
  }

  addMessage(msg: Message) {
    this.messages = this.messages.concat(msg);
    //this.storage.set(Constants.KEY_MESSAGES + this.chatChild, this.messages);

    // UPDATE CHAT USER INFO from NEW MESSAGE
    // if (this.chat && msg) {
    //   let isMeSender = msg.senderId == this.chat.myId;
    //   this.chat.chatImage = isMeSender ? msg.recipientImage : msg.senderImage;
    //   this.chat.chatName = isMeSender ? msg.recipientName : msg.senderName;
    //   //this.chat.chatStatus = isMeSender ? msg.recipientStatus : msg.senderStatus;
    // }
  }

  send() {
    if (this.newMessageText && this.newMessageText.trim().length) {
      let toSend = new Message();
      toSend.chatId = this.chatChild;
      toSend.body = this.newMessageText;
      toSend.dateTimeStamp = String(new Date().getTime());
      toSend.delivered = false;
      toSend.sent = true;
      toSend.recipientId = this.chat.chatId;
      toSend.recipientImage = this.chat.chatImage;
      toSend.recipientName = this.chat.chatName;
      toSend.recipientStatus = this.chat.chatStatus;
      toSend.senderId = this.chat.myId;
      toSend.senderName = this.userMe.name;
      toSend.senderImage = (this.userMe.image_url && this.userMe.image_url.length) ? this.userMe.image_url : "assets/images/empty_dp.png";
      toSend.senderStatus = this.userMe.email;
      toSend.id = this.chatRef.child(this.chatChild).push().key;

      this.chatRef.child(this.chatChild).child(toSend.id).set(toSend).then(res => {
        this.unReadIndicationRef.child(toSend.recipientId).child(String(this.ap_id)).set({ "indication_id": String(this.ap_id), "indication_msg_id": toSend.id, "indication_sender_id": String(toSend.senderId) });
        this.inboxRef.child(toSend.recipientId).child(toSend.senderId).set(toSend);
        this.inboxRef.child(toSend.senderId).child(toSend.recipientId).set(toSend);
        this.newMessageText = '';
        this.notifyMessages();
      });
    } else {
      this.translate.get("type_message").subscribe(value => this.uiElementService.presentToast(value));
    }
  }

  dialUser() {
    this.iab.create((("https://api.whatsapp.com/send?phone=" + this.ap_user.mobile_number)), "_system");
  }

  private notifyMessages() {
    this.translate.get(["msg_new", "msg_detail"]).subscribe(values => this.apiService.postNotificationContent(Constants.ROLE_USER, Number(this.chat.chatId) ? this.chat.chatId : this.chat.chatId.substring(0, this.chat.chatId.indexOf(Constants.ROLE_USER)), values["msg_new"], (values["msg_detail"] + " " + (this.profileMe ? this.profileMe.name : this.userMe.name))).subscribe(res => console.log("notiS", res), err => console.log("notiF", err)));
  }

}
