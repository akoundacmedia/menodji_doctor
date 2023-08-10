import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
  
import { IonicModule } from '@ionic/angular';

import { AddMedicinePageRoutingModule } from './add-medicine-routing.module';

import { AddMedicinePage } from './add-medicine.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,  
    AddMedicinePageRoutingModule
  ],
  declarations: [AddMedicinePage]
})
export class AddMedicinePageModule {}
