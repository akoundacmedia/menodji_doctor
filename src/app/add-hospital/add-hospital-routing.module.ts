import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddHospitalPage } from './add-hospital.page';

const routes: Routes = [
  {
    path: '',
    component: AddHospitalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddHospitalPageRoutingModule {}
