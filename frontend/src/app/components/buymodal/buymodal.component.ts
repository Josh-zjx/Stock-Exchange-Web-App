import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { Order } from '../../models/order';

/** Closes with the confirmed {@link Order}. */
@Component({
  selector: 'app-buymodal',
  templateUrl: './buymodal.component.html',
  styleUrls: ['./buymodal.component.css']
})
export class BuymodalComponent implements OnInit, OnDestroy {
  @Input() name: string;
  @Input() price: number;
  /** Live price updates while the dialog is open. */
  @Input() updateevent: Observable<number>;
  numb = 0;
  private subscription: Subscription;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.subscription = this.updateevent.subscribe(price => this.price = price);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  disablebuy(): boolean {
    return this.numb <= 0;
  }

  buy(): void {
    if (!this.disablebuy()) {
      const order: Order = { name: this.name, price: this.price, amount: Number(this.numb) };
      this.activeModal.close(order);
    }
  }
}
