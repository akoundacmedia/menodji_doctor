import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: 'sign-in', pathMatch: 'full'
  }, {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  }, {
    path: 'sign-in',
    loadChildren: () => import('./sign-in/sign-in.module').then(m => m.SignInPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'verification',
    loadChildren: () => import('./verification/verification.module').then(m => m.VerificationPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatPageModule)
  },
  {
    path: 'feedback',
    loadChildren: () => import('./feedback/feedback.module').then(m => m.FeedbackPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule)
  },
  {
    path: 'my-profile',
    loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfilePageModule)
  },
  {
    path: 'add-hospital',
    loadChildren: () => import('./add-hospital/add-hospital.module').then(m => m.AddHospitalPageModule)
  },
  {
    path: 'add-degre',
    loadChildren: () => import('./add-degre/add-degre.module').then(m => m.AddDegrePageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then(m => m.ContactUsPageModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./faq/faq.module').then(m => m.FaqPageModule)
  },
  {
    path: 'tnc',
    loadChildren: () => import('./tnc/tnc.module').then(m => m.TncPageModule)
  },
  {
    path: 'appointments',
    loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsPageModule)
  },
  {
    path: 'change-language',
    loadChildren: () => import('./change-language/change-language.module').then(m => m.ChangeLanguagePageModule)
  },
  {
    path: 'appointment-detail',
    loadChildren: () => import('./appointment-detail/appointment-detail.module').then(m => m.AppointmentDetailPageModule)
  },
  {
    path: 'document-verification',
    loadChildren: () => import('./document-verification/document-verification.module').then(m => m.DocumentVerificationPageModule)
  },
  {
    path: 'wallet',
    loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletPageModule)
  }, {
    path: 'send-to-bank',
    loadChildren: () => import('./send-to-bank/send-to-bank.module').then(m => m.SendToBankPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
