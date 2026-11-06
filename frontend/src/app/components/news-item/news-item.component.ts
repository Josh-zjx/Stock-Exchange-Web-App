import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsmodalComponent } from '../newsmodal/newsmodal.component';

export interface NewsItem {
  url: string;
  title: string;
  description: string;
  source: string;
  image: string;
  published: string;
}

@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.css']
})
export class NewsItemComponent {
  @Input() news: NewsItem;

  constructor(private modalService: NgbModal) { }

  opennews(news: NewsItem): void {
    this.modalService.open(NewsmodalComponent).componentInstance.news = news;
  }
}
