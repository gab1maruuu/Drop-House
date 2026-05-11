import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { supabase } from '../../lib/supabaseClient';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  isLoggedIn = false;
  cartCount = 0;
  private cartSub!: Subscription;

  constructor(private cartService: CartService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    const { data: { session } } = await supabase.auth.getSession();
    this.isLoggedIn = !!session;
    this.cdr.detectChanges(); // forzar actualización tras el await

    supabase.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session;
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
