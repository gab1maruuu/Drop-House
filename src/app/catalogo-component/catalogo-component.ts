import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../header-component/header';
import { Footer } from '../footer-component/footer';
import { supabase } from '../../lib/supabaseClient';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-catalogo-component',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './catalogo-component.html',
  styleUrl: './catalogo-component.css',
})
export class CatalogoComponent implements OnInit {
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  categories: string[] = [];
  loading = true;

  searchQuery = '';
  selectedCategory = 'Todos';
  sortBy = 'default';

  addedMap: { [id: number]: boolean } = {};

  constructor(private cdr: ChangeDetectorRef, private cartService: CartService) {}

  async ngOnInit() {
    await this.fetchProducts();
  }

  async fetchProducts() {
    this.loading = true;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar productos:', error);
    } else {
      this.allProducts = (data || []).map(p => ({
        ...p,
        image: p.image_url,
        status: p.is_active ? 'Disponible' : 'Proximamente',
      }));

      // Extraer categorías únicas
      const cats = [...new Set(this.allProducts.map(p => p.category).filter(Boolean))] as string[];
      this.categories = ['Todos', ...cats];
    }

    this.loading = false;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  applyFilters() {
    let result = [...this.allProducts];

    // Filtrar por categoría
    if (this.selectedCategory !== 'Todos') {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    // Filtrar por búsqueda
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Ordenar
    if (this.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'name') {
      result.sort((a, b) => a.name?.localeCompare(b.name));
    }

    this.filteredProducts = result;
    this.cdr.detectChanges();
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  addToCart(product: any) {
    this.cartService.addItem(product);
    this.addedMap[product.id] = true;
    setTimeout(() => {
      this.addedMap[product.id] = false;
      this.cdr.detectChanges();
    }, 1500);
    this.cdr.detectChanges();
  }
}
