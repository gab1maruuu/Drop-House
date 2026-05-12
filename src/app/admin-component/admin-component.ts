import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { supabase } from '../../lib/supabaseClient';
import { Header } from '../header-component/header';

@Component({
  selector: 'app-admin-component',
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.css',
})
export class AdminComponent implements OnInit {
  currentTab = 'productos'; // 'productos' o 'pedidos'
  
  // Formulario de productos
  newProduct = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
    brand: '',
    category_id: '',
    is_active: true
  };
  
  categories: { id: string; name: string }[] = [];
  orders: any[] = [];
  products: any[] = [];

  private readonly defaultCategories = [
    { id: 'basketball', name: 'Basketball' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'running', name: 'Running' },
    { id: 'training', name: 'Training' },
  ];
  
  isSaving = false;

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      this.router.navigate(['/register-login']);
      return;
    }

    // Leer pestaña de la URL
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.currentTab = params['tab'];
        this.cdr.detectChanges();
      }
    });

    await this.fetchCategories();
    await this.fetchOrders();
    await this.fetchProducts();
  }

  async fetchCategories() {
    const { data } = await supabase.from('categories').select('*');
    this.categories = (data && data.length > 0) ? data : this.defaultCategories;
    this.cdr.detectChanges();
  }

  async fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false });
    this.orders = data || [];
    this.cdr.detectChanges();
  }

  async fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    this.products = data || [];
    this.cdr.detectChanges();
  }

  setTab(tab: string) {
    this.currentTab = tab;
    this.cdr.detectChanges();
  }

  generateSlug() {
    this.newProduct.slug = this.newProduct.name
      .toLowerCase()
      .trim()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  async createProduct() {
    this.isSaving = true;

    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session?.user || session.user.user_metadata?.['role'] !== 'admin') {
      alert('No estás autorizado para crear productos. Inicia sesión como administrador.');
      this.isSaving = false;
      return;
    }

    // Si no hay categoría seleccionada, la ponemos como null o vacía
    const productToInsert = { ...this.newProduct };
    if (!productToInsert.category_id) {
      delete (productToInsert as any).category_id;
    }

    const { error } = await supabase
      .from('products')
      .insert([productToInsert]);

    if (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear producto: ' + error.message + '\nSi la sesión es correcta, revisa la política RLS de Supabase para la tabla products.');
    } else {
      alert('Producto creado con éxito');
      this.newProduct = {
        name: '',
        slug: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: '',
        brand: '',
        category_id: '',
        is_active: true
      };
      await this.fetchProducts();
    }

    this.isSaving = false;
    this.cdr.detectChanges();
  }

  async updateOrderStatus(orderId: string, newStatus: string) {
    console.log('Updating order status', orderId, newStatus);

    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select('id, status')
      .maybeSingle();

    console.log('updateOrderStatus response', { data, error });

    if (error) {
      console.error('Error al actualizar pedido:', error);
      alert('Error al actualizar pedido: ' + error.message + '\nRevisa las políticas RLS de la tabla orders.');
      return;
    }

    if (!data) {
      alert('No se pudo actualizar el pedido. No se encontró fila o no hay permisos de UPDATE.');
      return;
    }

    this.orders = this.orders.map(order =>
      order.id === orderId ? { ...order, status: data.status } : order
    );

    alert('Pedido actualizado');
    await this.fetchOrders();
    this.cdr.detectChanges();
  }
}

