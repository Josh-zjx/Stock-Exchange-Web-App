import { Component, OnInit,Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { detailnewsitem } from '../../models/remotedata';

@Component({
  selector: 'app-newsmodal',
  templateUrl: './newsmodal.component.html',
  styleUrls: ['./newsmodal.component.css']
})
export class NewsmodalComponent implements OnInit {
  @Input() news:detailnewsitem;
  constructor(activeModal:NgbActiveModal) { }
    
  ngOnInit(): void {
  }

}
