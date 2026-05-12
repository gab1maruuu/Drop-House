import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { supabase } from '../../lib/supabaseClient';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-admin',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-admin.html',
  styleUrl: './header-admin.css',
})
export class HeaderAdminComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  cartCount = 0;
  private cartSub!: Subscription;

  constructor(private cartService: CartService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    this.isLoggedIn = !!session;
    if (session?.user) {
      this.isAdmin = session.user.user_metadata?.['role'] === 'admin';
    }
    this.cdr.detectChanges();

    supabase.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session;
      this.isAdmin = !!session?.user && session.user.user_metadata?.['role'] === 'admin';
      this.cdr.detectChanges();
    });

    this.cartSub = this.cartService.itemCount$.subscribe(count => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
  }

  async logout() {
    await supabase.auth.signOut();
    this.isLoggedIn = false;
    this.cdr.detectChanges();
  }
}
