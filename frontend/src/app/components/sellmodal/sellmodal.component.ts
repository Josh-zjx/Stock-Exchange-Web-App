import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sellmodal',
  templateUrl: './sellmodal.component.html',
  styleUrls: ['./sellmodal.component.css']
})
export class SellmodalComponent implements OnInit {
  @Input() name:string;
  @Input() price:number;
  @Input() share:number;
  @Output() emitter = new EventEmitter();
  numb:number=0;
  
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }
  disablebuy():boolean{
    return this.numb>this.share;
  }
  buy():void{
    if(this.disablebuy())
    {return ;}
    this.activeModal.close('Close click')
  }
}
