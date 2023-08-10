import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'appointments',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../appointments/appointments.module').then(m => m.AppointmentsPageModule)
          }
        ]
      },
      {
        path: 'feedback',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../feedback/feedback.module').then(m => m.FeedbackPageModule)
          }
        ]
      },
      {
        path: 'account',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../account/account.module').then(m => m.AccountPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/appointments',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/appointments',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
