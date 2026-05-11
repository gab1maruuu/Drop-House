import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  userName = '';
  userInitials = '';
  memberSince = '';
  orders: any[] = [];
  loadingOrders = true;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.userEmail = session.user.email || '';

      // Nombre: usar metadata o derivar del email
      const meta = session.user.user_metadata;
      this.userName = meta?.['full_name'] || meta?.['name'] || this.emailToName(this.userEmail);
      this.userInitials = this.getInitials(this.userName);

      // Fecha de registro
      const created = new Date(session.user.created_at);
      this.memberSince = created.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });

      // Cargar pedidos del usuario desde Supabase
      await this.fetchOrders(session.user.id);
    } else {
      this.router.navigate(['/register-login']);
    }
  }

  async fetchOrders(userId: string) {
    this.loadingOrders = true;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        shipping_address,
        notes,
        created_at,
        order_items ( id )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener pedidos:', error);
    } else {
      this.orders = (data || []).map((o: any) => ({
        displayId: `#ORD-${String(o.id).substring(0, 8).toUpperCase()}`,
        date: new Date(o.created_at).toLocaleDateString('es-ES'),
        status: o.status || 'pending',
        total: o.total_amount ?? 0,
        items: Array.isArray(o.order_items) ? o.order_items.length : 0,
        shipping_address: o.shipping_address,
        notes: o.notes,
      }));
    }

    this.loadingOrders = false;
    this.cdr.detectChanges();
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'entregado' || s === 'delivered' || s === 'completed') return 'status-delivered';
    if (s === 'en camino' || s === 'shipped' || s === 'processing') return 'status-pending';
    if (s === 'cancelado' || s === 'cancelled') return 'status-cancelled';
    return 'status-default';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      delivered: 'Entregado',
      completed: 'Entregado',
      shipped: 'En camino',
      processing: 'Procesando',
      cancelled: 'Cancelado',
      pending: 'Pendiente',
    };
    return map[status?.toLowerCase()] || status;
  }

  private emailToName(email: string): string {
    const local = email.split('@')[0];
    return local
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }

  async logout() {
    await supabase.auth.signOut();
    this.router.navigate(['/']);
  }
}
