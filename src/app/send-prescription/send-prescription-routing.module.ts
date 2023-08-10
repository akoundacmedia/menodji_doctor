import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SendPrescriptionPage } from './send-prescription.page';

const routes: Routes = [
  {
    path: '',
    component: SendPrescriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SendPrescriptionPageRoutingModule {}
