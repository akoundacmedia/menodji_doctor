import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentVerificationPage } from './document-verification.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentVerificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentVerificationPageRoutingModule {}
