import { Component, OnInit,Input, NgModuleRef, Output,EventEmitter } from '@angular/core';
import {portfolioitem} from '../../models/portfoliodata';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuymodalComponent } from '../buymodal/buymodal.component';
import { SellmodalComponent } from '../sellmodal/sellmodal.component';

@Component({
  selector: 'app-portfolio-page-item',
  templateUrl: './portfolio-page-item.component.html',
  styleUrls: ['./portfolio-page-item.component.css']
})
export class PortfolioPageItemComponent implements OnInit {
  @Input() item:portfolioitem;
  @Output() emitter= new EventEmitter();
  constructor(private modalService:NgbModal) { }

  ngOnInit(): void {
  }
  openbuy() {
    const modalRef = this.modalService.open(BuymodalComponent);
    modalRef.componentInstance.name = this.item.ticker;
    modalRef.componentInstance.price = this.item.currentprice;
  }
  opensell() {
    const modalRef = this.modalService.open(SellmodalComponent);
    modalRef.componentInstance.name = this.item.ticker;
    modalRef.componentInstance.price = this.item.currentprice;
    modalRef.componentInstance.share = this.item.Quantity;
  }
  buy(){}
  sell(){}
}
