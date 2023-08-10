import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/models/user.models';
import { SupportRequest } from 'src/models/support-request.models';
import { APP_CONFIG, AppConfig } from '../app.config';
import { ApiService } from '../services/network/api.service';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { Helper } from 'src/models/helper.models';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss']
})
export class ContactUsPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  userMe: User;
  supportRequest: SupportRequest;

  constructor(@Inject(APP_CONFIG) private config: AppConfig,
    private apiService: ApiService, private navCtrl: NavController,
    private translate: TranslateService, private uiElementService: UiElementsService) { }

  ngOnInit() {
    this.userMe = Helper.getLoggedInUser();
    this.supportRequest = new SupportRequest();
    this.supportRequest.name = this.userMe.name;
    this.supportRequest.email = this.userMe.email;
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  // dialSupport() {
  //   this.callNumber.callNumber(Helper.getSetting("support_phone"), false).then(res => console.log('Launched dialer!', res)).catch(err => console.log('Error launching dialer', err));
  // }

  // mailSupport() {
  //   this.emailComposer.isAvailable().then((available: boolean) => {
  //     if (available) {
  //       this.emailComposer.open({
  //         to: Helper.getSetting("support_email"),
  //         subject: this.config.appName
  //       });
  //     }
  //   });
  // }

  submitSupport() {
    this.supportRequest.message = this.supportRequest.message.trim();
    if (!this.supportRequest.message || !this.supportRequest.message.length) {
      this.translate.get("err_valid_support_msg").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      this.translate.get(["supporting", "something_wrong"]).subscribe(values => {
        this.uiElementService.presentLoading(values["supporting"]);

        this.subscriptions.push(this.apiService.submitSupport(this.supportRequest).subscribe(res => {
          this.uiElementService.dismissLoading();
          this.translate.get("supporting_success").subscribe(value => this.uiElementService.presentToast(value));
          this.navCtrl.navigateRoot(['./tabs']);

        }, err => {
          this.uiElementService.dismissLoading();
          this.uiElementService.presentToast(values["something_wrong"]);
          console.log('support', err);
        }));
      });
    }
  }

}
