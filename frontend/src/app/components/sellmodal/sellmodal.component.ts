import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../models/order';

/** Closes with the confirmed {@link Order}. */
@Component({
  selector: 'app-sellmodal',
  templateUrl: './sellmodal.component.html',
  styleUrls: ['./sellmodal.component.css']
})
export class SellmodalComponent {
  @Input() name: string;
  @Input() price: number;
  @Input() share: number;
  numb = 0;

  constructor(public activeModal: NgbActiveModal) { }

  disablebuy(): boolean {
    return this.numb <= 0 || this.numb > this.share;
  }

  buy(): void {
    if (!this.disablebuy()) {
      const order: Order = { name: this.name, price: this.price, amount: Number(this.numb) };
      this.activeModal.close(order);
    }
  }
}
