import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Header } from '../header-component/header';
import { Footer } from '../footer-component/footer';
import { supabase } from '../../lib/supabaseClient';

@Component({
  selector: 'app-carrito-component',
  imports: [CommonModule, Header, Footer, RouterLink],
  templateUrl: './carrito-component.html',
  styleUrl: './carrito-component.css',
})
export class CarritoComponent implements OnInit {
  cartItems: any[] = [];
  total = 0;
  isProcessing = false;

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
      this.cdr.detectChanges();
    });
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  }

  updateQuantity(productId: number, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId);
  }

  async processOrder() {
    if (this.cartItems.length === 0) return;

    this.isProcessing = true;
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert('Debes iniciar sesión para procesar el pedido');
      this.router.navigate(['/register-login']);
      this.isProcessing = false;
      return;
    }

    const userId = session.user.id;

    // 1. Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'shipped',
        total_amount: this.total,
        shipping_address: 'Dirección por defecto',
        notes: 'Pedido realizado desde la web'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error al crear pedido:', orderError);
      alert('Error al procesar el pedido: ' + orderError.message + ' (' + orderError.details + ')');
      this.isProcessing = false;
      return;
    }

    // 2. Crear los items del pedido
    const orderItems = this.cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: Number(item.price)
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error al crear items del pedido:', itemsError);
      alert('Error al guardar los detalles del pedido: ' + itemsError.message);
      this.isProcessing = false;
      return;
    }

    // 3. Limpiar carrito
    this.cartService.clear();

    // 4. Redirigir al perfil
    alert('Pedido realizado con éxito!');
    this.router.navigate(['/user-profile']);
    this.isProcessing = false;
  }
}

