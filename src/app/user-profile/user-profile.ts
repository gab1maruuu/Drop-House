import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../header-component/header';
import { Footer } from '../footer-component/footer';
import { supabase } from '../../lib/supabaseClient';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, Header, Footer],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent implements OnInit {
  userEmail = '';
  orders = [
    { id: '#ORD-2026-001', date: '2026-05-01', status: 'Entregado', total: 129.99 },
    { id: '#ORD-2026-002', date: '2026-05-05', status: 'En camino', total: 149.99 }
  ];

  constructor(private router: Router) {}

  async ngOnInit() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.userEmail = session.user.email || '';
    } else {
      this.router.navigate(['/register-login']);
    }
  }

  async logout() {
    await supabase.auth.signOut();
    this.router.navigate(['/']);
  }
}
