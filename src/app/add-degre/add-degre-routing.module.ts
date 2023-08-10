import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddDegrePage } from './add-degre.page';

const routes: Routes = [
  {
    path: '',
    component: AddDegrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddDegrePageRoutingModule {}
