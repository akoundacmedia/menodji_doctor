import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';

import { ChatPage } from './chat.page';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SendPrescriptionPageModule } from '../send-prescription/send-prescription.module';
import { HealthReportPageModule } from '../health-report/health-report.module';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ChatPageRoutingModule,
    SendPrescriptionPageModule,
    HealthReportPageModule
  ],
  providers: [InAppBrowser, PhotoViewer],
  declarations: [ChatPage]
})
export class ChatPageModule { }
