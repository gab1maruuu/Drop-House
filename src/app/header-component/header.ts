import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { supabase } from '../../lib/supabaseClient';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isLoggedIn = false;

  async ngOnInit() {
    const { data: { session } } = await supabase.auth.getSession();
    this.isLoggedIn = !!session;

    supabase.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session;
    });
  }

  async logout() {
    await supabase.auth.signOut();
    this.isLoggedIn = false;
  }
}
