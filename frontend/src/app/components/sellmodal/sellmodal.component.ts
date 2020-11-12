import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { order } from '../../models/portfoliodata'

@Component({
  selector: 'app-sellmodal',
  templateUrl: './sellmodal.component.html',
  styleUrls: ['./sellmodal.component.css']
})
export class SellmodalComponent implements OnInit {
  @Input() name:string;
  @Input() price:number;
  @Input() share:number;
  neworder:order={name:"",price:0,amount:0};
  @Output() sellemitter = new EventEmitter();
  numb:number=0;
  
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }
  disablebuy():boolean{
    return this.numb<=0||this.numb>this.share;
  }
  buy():void{
    if(this.disablebuy())
    {return ;}
    this.neworder.name=this.name;
    this.neworder.price=this.price;
    this.neworder.amount=Number(this.numb);
    //console.log(typeof(this.numb))
    this.sellemitter.emit(this.neworder);
    
    this.activeModal.close('Close click')
  }
}
