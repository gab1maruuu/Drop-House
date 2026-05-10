import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { login, register, logout, getCurrentUser } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Header } from '../header-component/header';
import { Footer } from '../footer-component/footer';

@Component({
  selector: 'app-register-login',
  imports: [RouterOutlet, FormsModule, CommonModule, Header, Footer],
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
  successMessage = signal('');

  constructor(private router: Router) {}

  async ngOnInit() {
    this.checkSession();
  }

  async checkSession() {
    const user = await getCurrentUser();
    this.user.set(user);
    if (user) {
      this.router.navigate(['/']);
    }
  }

  toggleMode() {
    this.isLoginMode.update(val => !val);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  async handleSubmit() {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor ingresa tu email y contraseña.');
      return;
    }

    if (!this.isLoginMode() && !this.fullName()) {
      this.errorMessage.set('Por favor ingresa tu nombre completo.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    try {
      if (this.isLoginMode()) {
        const { user } = await login(this.email(), this.password());
        this.user.set(user);
        this.router.navigate(['/']);
      } else {
        await register(this.email(), this.password(), this.fullName());
        this.isLoginMode.set(true);
        this.successMessage.set('Registro exitoso. Por favor, inicia sesión.');
        this.password.set('');
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
