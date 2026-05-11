import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard-component/dashboard-component';
import { RegisterLoginComponent } from './register-login-component/register-login';
import { UserProfileComponent } from './user-profile/user-profile';
import { CatalogoComponent } from './catalogo-component/catalogo-component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'register-login', component: RegisterLoginComponent },
  { path: 'dashboard-component', component: DashboardComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'catalogo', component: CatalogoComponent },
];
