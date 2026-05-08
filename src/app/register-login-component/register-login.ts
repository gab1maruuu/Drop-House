import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { login, register, logout, getCurrentUser } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-login',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './register-login.html',
  styleUrl: './register-login.css'
})
export class RegisterLoginComponent implements OnInit {
  protected readonly title = signal('Drop House');

  // Auth state
  user = signal<any>(null);
  email = signal('');
  password = signal('');
  fullName = signal('');
  isLoginMode = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  async ngOnInit() {
    this.checkSession();
  }

  async checkSession() {
    const user = await getCurrentUser();
    this.user.set(user);
  }

  toggleMode() {
    this.isLoginMode.update(val => !val);
    this.errorMessage.set('');
  }

  async handleSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      if (this.isLoginMode()) {
        const { user } = await login(this.email(), this.password());
        this.user.set(user);
      } else {
        const { user } = await register(this.email(), this.password(), this.fullName());
        this.user.set(user);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error occurred');
    } finally {
      this.loading.set(false);
    }
  }

  async handleLogout() {
    try {
      await logout();
      this.user.set(null);
    } catch (error: any) {
      console.error('Logout error', error);
    }
  }
}
