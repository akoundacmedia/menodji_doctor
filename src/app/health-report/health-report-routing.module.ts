import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HealthReportPage } from './health-report.page';

const routes: Routes = [
  {
    path: '',
    component: HealthReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HealthReportPageRoutingModule {}
