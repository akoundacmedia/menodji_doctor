import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AddMedicines } from 'src/models/prescription.models';
import { UiElementsService } from '../services/common/ui-elements.service';

@Component({
  selector: 'app-add-medicine',
  templateUrl: './add-medicine.page.html',
  styleUrls: ['./add-medicine.page.scss'],
})
export class AddMedicinePage implements OnInit {
  @Input() data: AddMedicines;
  isShow = new AddMedicines();

  constructor(private modalController: ModalController, private translate: TranslateService, private uiElementService: UiElementsService) { }

  ngOnInit() {
    console.log('data', this.data);
    if (this.data) this.isShow = this.data; else this.isShow.times = [{ value: moment().format().toString() }];
  }
  close() {
    this.modalController.dismiss();
  }
  addTime() {
    this.isShow.times.push({ value: moment().format().toString() });
  }
  addMedicine() {
    if (this.data) {
      this.modalController.dismiss();
    } else {
      if (!this.isShow.pill_name || !this.isShow.days.length) {
        this.translate.get("empty_medicine_report").subscribe(value => this.uiElementService.presentToast(value));
        this.modalController.dismiss();
      } else {
        let sendMedi = {
          pill_name: this.isShow.pill_name,
          days: this.isShow.days,
          times: this.isShow.times
        }
        this.modalController.dismiss(sendMedi);
      }
    }
  }
}
