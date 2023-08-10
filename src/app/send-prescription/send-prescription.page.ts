import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Chat } from 'src/models/chat.models';
import { AddMedicines, Prescription } from 'src/models/prescription.models';
import { AddMedicinePage } from '../add-medicine/add-medicine.page';
import { UiElementsService } from '../services/common/ui-elements.service';

@Component({
  selector: 'app-send-prescription',
  templateUrl: './send-prescription.page.html',
  styleUrls: ['./send-prescription.page.scss'],
})
export class SendPrescriptionPage implements OnInit {
  @Input() chat: Chat;
  @Input() data: Prescription;
  toShow = new Prescription();

  constructor(private modalController: ModalController, private translate: TranslateService,
    private uiElementService: UiElementsService, private alertCtrl: AlertController) { }

  ngOnInit() {
    console.log("got", this.data);
    if (this.data) this.toShow = this.data;
  }

  actionPrescriReport() {
    if (this.data && this.data.is_view) {
      this.modalController.dismiss();
    } else {
      if (!this.toShow.medicines || !this.toShow.medicines.length) {
        this.translate.get("add_medicine").subscribe(value => this.uiElementService.presentToast(value));
        this.modalController.dismiss();
      } else {
        this.translate.get(["prescription_confirm_title", "prescription_confirm_message", "cancel", "yes"]).subscribe(values => {
          this.alertCtrl.create({
            header: values["prescription_confirm_title"],
            message: values["prescription_confirm_message"],
            buttons: [{
              text: values["cancel"],
              handler: () => this.modalController.dismiss()
            }, {
              text: values["yes"],
              handler: () => { this.toShow.is_view = true; this.modalController.dismiss(this.toShow); }
            }]
          }).then(alert => alert.present());
        });
      }
    }
  }

  close() {
    this.modalController.dismiss();
  }

  add_medicine(medicine?: AddMedicines) {
    this.modalController.create({ component: AddMedicinePage, componentProps: { data: medicine ? medicine : "" } }).then((modalElement) => {
      modalElement.onDidDismiss().then(medicineData => {
        if (medicineData && medicineData.data) {
          this.toShow.medicines.push(medicineData.data);
        }
      });
      modalElement.present();
    });
  }
}
