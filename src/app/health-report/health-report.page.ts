import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HealthReport } from 'src/models/health-report.models';
import { UiElementsService } from '../services/common/ui-elements.service';

@Component({
  selector: 'app-health-report',
  templateUrl: './health-report.page.html',
  styleUrls: ['./health-report.page.scss']
})
export class HealthReportPage implements OnInit {
  @Input() data: HealthReport;
  toShow = new HealthReport();

  constructor(private modalController: ModalController, private translate: TranslateService,
    private uiElementService: UiElementsService, private alertCtrl: AlertController) { }

  ngOnInit() {
    console.log("got", this.data);
    if (this.data) this.toShow = this.data;
  }

  actionReport() {
    if (this.data) {
      this.modalController.dismiss();
    } else {
      if (HealthReport.isEmpty(this.toShow)) {
        this.translate.get("empty_health_report").subscribe(value => this.uiElementService.presentToast(value));
        this.modalController.dismiss();
      } else {
        this.translate.get(["health_report_confirm_title", "health_report_confirm_message", "cancel", "yes"]).subscribe(values => {
          this.alertCtrl.create({
            header: values["health_report_confirm_title"],
            message: values["health_report_confirm_message"],
            buttons: [{
              text: values["cancel"],
              handler: () => this.modalController.dismiss()
            }, {
              text: values["yes"],
              handler: () => this.modalController.dismiss(this.toShow)
            }]
          }).then(alert => alert.present());
        });
      }
    }
  }

}
