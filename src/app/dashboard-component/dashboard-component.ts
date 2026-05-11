import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { supabase } from '../../lib/supabaseClient';
import { RouterLink } from '@angular/router';

import { Header } from '../header-component/header';
import { Footer } from '../footer-component/footer';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {
  products: any = {};
  sneakers: any[] = [];
  addedMap: { [id: number]: boolean } = {};

  constructor(private cdr: ChangeDetectorRef, private cartService: CartService) { }

  async ngOnInit() {
    await this.fetchData();
  }

  async fetchData() {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error al obtener datos de Supabase:', error);
      return;
    }

    if (data && data.length > 0) {
      const mappedData = data.map(item => ({
        ...item,
        image: item.image_url,
        status: item.is_active ? 'Disponible' : 'Proximamente',
      }));

      this.products = mappedData[0];
      this.sneakers = mappedData.slice(1);

      this.cdr.detectChanges();
    }
  }

  addToCart(sneaker: any) {
    this.cartService.addItem();
    this.addedMap[sneaker.id] = true;
    setTimeout(() => {
      this.addedMap[sneaker.id] = false;
      this.cdr.detectChanges();
    }, 1500);
    this.cdr.detectChanges();
  }
}
