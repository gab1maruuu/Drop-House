import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard-component/dashboard-component';
import { RegisterLoginComponent } from './register-login-component/register-login';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'register-login', component: RegisterLoginComponent }
];
