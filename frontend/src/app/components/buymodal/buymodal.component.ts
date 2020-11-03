import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-buymodal',
  templateUrl: './buymodal.component.html',
  styleUrls: ['./buymodal.component.css']
})
export class BuymodalComponent implements OnInit {
  @Input() name:string;
  @Input() price:number;
  @Output() emitter = new EventEmitter();
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
    this.activeModal.close('Close click')
  }
}
