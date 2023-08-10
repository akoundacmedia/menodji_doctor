import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { SendPrescriptionPageRoutingModule } from './send-prescription-routing.module';

import { SendPrescriptionPage } from './send-prescription.page';
import { AddMedicinePageModule } from '../add-medicine/add-medicine.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,  
    SendPrescriptionPageRoutingModule,
    AddMedicinePageModule
  ],
  declarations: [SendPrescriptionPage]
})
export class SendPrescriptionPageModule {}
