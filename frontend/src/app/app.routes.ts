import { Routes } from '@angular/router';

import { Welcome } from './features/auth/welcome/welcome';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Upload } from './features/upload/upload';
import { Download } from './features/download/download';
import { MyFiles } from './features/my-files/my-files';

export const routes: Routes = [
  {
    path: '',
    component: Welcome
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'upload',
    component: Upload
  },
  {
    path: 'download/:token',
    component: Download
  },
  {
    path: 'my-files',
    component: MyFiles
  },
  {
    path: '**',
    redirectTo: ''
  }
];
