import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
  
import { IonicModule } from '@ionic/angular';

import { AddDegrePageRoutingModule } from './add-degre-routing.module';

import { AddDegrePage } from './add-degre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
	TranslateModule,   
    AddDegrePageRoutingModule
  ],
  declarations: [AddDegrePage]
})
export class AddDegrePageModule {}
