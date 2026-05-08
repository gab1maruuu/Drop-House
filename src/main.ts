import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/register-login-component/register-login.config';
import { DashboardComponent } from './app/dashboard-component/dashboard-component';

bootstrapApplication(DashboardComponent, appConfig)
  .catch((err) => console.error(err));
