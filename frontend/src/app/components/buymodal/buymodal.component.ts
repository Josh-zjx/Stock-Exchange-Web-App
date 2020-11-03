import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { order } from '../../models/portfoliodata'

@Component({
  selector: 'app-buymodal',
  templateUrl: './buymodal.component.html',
  styleUrls: ['./buymodal.component.css']
})
export class BuymodalComponent implements OnInit {
  @Input() name:string;
  @Input() price:number;
  @Output() buyemitter = new EventEmitter();
  neworder:order={name:"",price:0,amount:0};
  numb:number=0;
  
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }
  disablebuy():boolean{
    return this.numb<=0;
  }
  buy():void{
    if(this.disablebuy())
    {return ;}
    this.neworder.name=this.name;
    this.neworder.price=this.price;
    this.neworder.amount=Number(this.numb);
    //console.log(typeof(this.numb))
    this.buyemitter.emit(this.neworder);
    this.activeModal.close('Close click')
  }
}
