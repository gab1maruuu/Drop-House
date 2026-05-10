import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { supabase } from '../../lib/supabaseClient';
import { RouterLink } from '@angular/router';
import { Header } from '../header-component/header';
import { Footer } from '../footer-component/footer';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {
  products: any = {};
  sneakers: any[] = [];

  constructor(private cdr: ChangeDetectorRef) { }

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

      // Forzar la actualización de la vista en Angular
      this.cdr.detectChanges();
    }
  }
}
