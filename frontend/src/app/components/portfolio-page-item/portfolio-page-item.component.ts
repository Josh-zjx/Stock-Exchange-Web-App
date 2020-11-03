import { Component, OnInit,Input, NgModuleRef, Output,EventEmitter } from '@angular/core';
import {portfolioitem} from '../../models/portfoliodata';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuymodalComponent } from '../buymodal/buymodal.component';
import { SellmodalComponent } from '../sellmodal/sellmodal.component';
import { order } from '../../models/portfoliodata'

@Component({
  selector: 'app-portfolio-page-item',
  templateUrl: './portfolio-page-item.component.html',
  styleUrls: ['./portfolio-page-item.component.css']
})
export class PortfolioPageItemComponent implements OnInit {
  @Input() item:portfolioitem;
  @Output() buyemitter= new EventEmitter();
  @Output() sellemitter = new EventEmitter();
  constructor(private modalService:NgbModal) { }

  ngOnInit(): void {
  }
  openbuy() {
    const modalRef = this.modalService.open(BuymodalComponent);
    modalRef.componentInstance.name = this.item.ticker;
    modalRef.componentInstance.price = this.item.currentprice;
    modalRef.componentInstance.buyemitter.subscribe((neworder)=>{
      this.buy(neworder);
    })
  }
  opensell() {
    const modalRef = this.modalService.open(SellmodalComponent);
    modalRef.componentInstance.name = this.item.ticker;
    modalRef.componentInstance.price = this.item.currentprice;
    modalRef.componentInstance.share = this.item.Quantity;
    modalRef.componentInstance.sellemitter.subscribe((neworder)=>{
      this.sell(neworder);
    })
  }
  buy(neworder:order){
    this.buyemitter.emit(neworder);
  }
  sell(neworder:order){
    this.sellemitter.emit(neworder);
  }
}
