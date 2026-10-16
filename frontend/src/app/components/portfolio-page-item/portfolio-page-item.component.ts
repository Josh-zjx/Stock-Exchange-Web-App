import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { noop, of } from 'rxjs';
import { Order } from '../../models/order';
import { BuymodalComponent } from '../buymodal/buymodal.component';
import { SellmodalComponent } from '../sellmodal/sellmodal.component';

export interface PortfolioItem {
  ticker: string;
  name: string;
  Quantity: number;
  averagecost: number;
  totalcost: number;
  change: number;
  currentprice: number;
  marketvalue: number;
}

@Component({
  selector: 'app-portfolio-page-item',
  templateUrl: './portfolio-page-item.component.html',
  styleUrls: ['./portfolio-page-item.component.css']
})
export class PortfolioPageItemComponent {
  @Input() item: PortfolioItem;
  @Output() buyemitter = new EventEmitter<Order>();
  @Output() sellemitter = new EventEmitter<Order>();

  constructor(private modalService: NgbModal, private router: Router) { }

  openbuy(): void {
    const modal = this.modalService.open(BuymodalComponent);
    Object.assign(modal.componentInstance, {
      name: this.item.ticker,
      price: this.item.currentprice,
      updateevent: of(this.item.currentprice)
    });
    modal.result.then((order: Order) => this.buyemitter.emit(order), noop);
  }

  opensell(): void {
    const modal = this.modalService.open(SellmodalComponent);
    Object.assign(modal.componentInstance, {
      name: this.item.ticker,
      price: this.item.currentprice,
      share: this.item.Quantity
    });
    modal.result.then((order: Order) => this.sellemitter.emit(order), noop);
  }

  navidetail(item: PortfolioItem): void {
    this.router.navigate(['/details', item.ticker]);
  }
}
