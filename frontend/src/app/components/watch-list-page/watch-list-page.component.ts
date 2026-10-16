import { Component, OnInit } from '@angular/core';
import { dayChange } from '../../models/stock';
import { StockApiService } from '../../services/stock-api.service';
import { WatchlistdataService } from '../../services/watchlistdata.service';
import { WatchlistItem } from '../watch-list-item/watch-list-item.component';

@Component({
  selector: 'app-watch-list-page',
  templateUrl: './watch-list-page.component.html',
  styleUrls: ['./watch-list-page.component.css']
})
export class WatchListPageComponent implements OnInit {
  watchlistitems: WatchlistItem[] = [];
  isloading = true;

  constructor(private watchlist: WatchlistdataService, private api: StockApiService) { }

  ngOnInit(): void {
    this.getWatchList();
  }

  getWatchList(): void {
    const tickers = this.watchlist.tickers();
    this.watchlistitems = [];
    if (!tickers.length) {
      this.isloading = false;
      return;
    }
    this.isloading = true;
    this.api.overview(tickers).subscribe(({ names, quotes }) => {
      this.watchlistitems = tickers.map((ticker, i) => {
        const quote = quotes.get(ticker);
        const change = quote ? dayChange(quote) : 0;
        return {
          ticker,
          name: names[i],
          currentprice: quote ? quote.last : 0,
          change,
          changepercent: quote ? change / quote.prevClose : 0
        };
      });
      this.isloading = false;
    });
  }

  deleteitem(ticker: string): void {
    this.watchlist.remove(ticker);
    this.getWatchList();
  }
}
