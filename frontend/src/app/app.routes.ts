import { Routes } from '@angular/router';

import { authGuard } from './auth.guard';
import { Welcome } from './features/auth/welcome/welcome';

export const routes: Routes = [
  {
    path: '',
    component: Welcome
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.Register)
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./features/upload/upload').then((m) => m.Upload),
    canActivate: [authGuard]
  },
  {
    path: 'download/:token',
    loadComponent: () =>
      import('./features/download/download').then((m) => m.Download)
  },
  {
    path: 'my-files',
    loadComponent: () =>
      import('./features/my-files/my-files').then((m) => m.MyFiles),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
