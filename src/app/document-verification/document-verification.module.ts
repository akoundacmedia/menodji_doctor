import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { DocumentVerificationPageRoutingModule } from './document-verification-routing.module';

import { DocumentVerificationPage } from './document-verification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    DocumentVerificationPageRoutingModule
  ],
  declarations: [DocumentVerificationPage]
})
export class DocumentVerificationPageModule { }
