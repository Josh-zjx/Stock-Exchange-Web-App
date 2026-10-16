import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsItem } from '../news-item/news-item.component';

@Component({
  selector: 'app-newsmodal',
  templateUrl: './newsmodal.component.html',
  styleUrls: ['./newsmodal.component.css']
})
export class NewsmodalComponent {
  @Input() news: NewsItem;

  constructor(public activeModal: NgbActiveModal) { }
}
