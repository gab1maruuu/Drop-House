import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemCount = new BehaviorSubject<number>(0);
  itemCount$ = this.itemCount.asObservable();

  addItem() {
    this.itemCount.next(this.itemCount.value + 1);
  }

  getCount(): number {
    return this.itemCount.value;
  }

  clear() {
    this.itemCount.next(0);
  }
}
