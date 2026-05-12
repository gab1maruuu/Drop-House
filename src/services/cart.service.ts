import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items = new BehaviorSubject<any[]>([]);
  items$ = this.items.asObservable();

  private itemCount = new BehaviorSubject<number>(0);
  itemCount$ = this.itemCount.asObservable();

  addItem(product: any) {
    const currentItems = this.items.value;
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.items.next([...currentItems]);
    } else {
      this.items.next([...currentItems, { ...product, quantity: 1 }]);
    }
    
    this.itemCount.next(this.itemCount.value + 1);
  }

  getItems() {
    return this.items.value;
  }

  getCount(): number {
    return this.itemCount.value;
  }

  clear() {
    this.items.next([]);
    this.itemCount.next(0);
  }

  removeItem(productId: number) {
    const currentItems = this.items.value;
    const item = currentItems.find(i => i.id === productId);
    if (item) {
      this.itemCount.next(this.itemCount.value - item.quantity);
      this.items.next(currentItems.filter(i => i.id !== productId));
    }
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const currentItems = this.items.value;
    const item = currentItems.find(i => i.id === productId);
    if (item) {
      const diff = quantity - item.quantity;
      item.quantity = quantity;
      this.items.next([...currentItems]);
      this.itemCount.next(this.itemCount.value + diff);
    }
  }
}

