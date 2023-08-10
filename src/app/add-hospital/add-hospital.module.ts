import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { AddHospitalPageRoutingModule } from './add-hospital-routing.module';

import { AddHospitalPage } from './add-hospital.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
	TranslateModule,   
    AddHospitalPageRoutingModule
  ],
  declarations: [AddHospitalPage]
})
export class AddHospitalPageModule {}
