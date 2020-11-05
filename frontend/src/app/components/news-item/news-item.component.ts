import { Component, OnInit,Input } from '@angular/core';
import { detailnewsitem } from '../../models/remotedata';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsmodalComponent } from '../newsmodal/newsmodal.component';


@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.css']
})
export class NewsItemComponent implements OnInit {
  @Input() news:detailnewsitem;
  constructor(private modalService:NgbModal) { }

  ngOnInit(): void {
  }
  opennews(inputnews:detailnewsitem)
  {
      console.log("open modal news")
      const modalRef = this.modalService.open(NewsmodalComponent);
      modalRef.componentInstance.news = inputnews;
      
  }

}
