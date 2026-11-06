import { Component, Input, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NewsArticle } from '../../models/stock';
import { StockApiService } from '../../services/stock-api.service';
import { NewsItem } from '../news-item/news-item.component';

@Component({
  selector: 'app-detail-news',
  templateUrl: './detail-news.component.html',
  styleUrls: ['./detail-news.component.css']
})
export class DetailNewsComponent implements OnInit {
  @Input() ticker: string;
  newslist1: NewsItem[] = [];
  newslist2: NewsItem[] = [];

  constructor(private api: StockApiService) { }

  ngOnInit(): void {
    this.api.news(this.ticker).pipe(catchError(() => of([]))).subscribe((articles: NewsArticle[]) => {
      const items = articles.map(toNewsItem);
      // Deal the articles alternately into the two columns
      this.newslist1 = items.filter((_, i) => i % 2 === 0);
      this.newslist2 = items.filter((_, i) => i % 2 === 1);
    });
  }
}

function toNewsItem(article: NewsArticle): NewsItem {
  return {
    url: article.url,
    title: article.title,
    description: article.description,
    source: article.source,
    image: article.urlToImage,
    published: article.publishedAt
  };
}
