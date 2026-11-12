import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { Order } from '../../models/order';
import { PortfoliodataService } from '../../services/portfoliodata.service';
import { StockApiService } from '../../services/stock-api.service';
import { PortfolioItem } from '../portfolio-page-item/portfolio-page-item.component';

@Component({
  selector: 'app-portfolio-page',
  templateUrl: './portfolio-page.component.html',
  styleUrls: ['./portfolio-page.component.css']
})
export class PortfolioPageComponent implements OnInit, OnDestroy {
  Portfolio: PortfolioItem[] = [];
  isloading = true;
  private readonly destroy$ = new Subject<void>();
  private readonly quoteRefreshes = new Map<string, Subscription>();

  constructor(private portfolio: PortfoliodataService, private api: StockApiService) { }

  ngOnInit(): void {
    this.getportfolio();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.quoteRefreshes.forEach(subscription => subscription.unsubscribe());
    this.quoteRefreshes.clear();
  }

  buy(order: Order): void {
    this.portfolio.buy(order.name, order.amount, order.price);
    this.refreshHolding(order.name);
  }

  sell(order: Order): void {
    this.portfolio.sell(order.name, order.amount);
    this.refreshHolding(order.name);
  }

  getportfolio(): void {
    const holdings = this.portfolio.holdings();
    if (!holdings.length) {
      this.Portfolio = [];
      this.isloading = false;
      return;
    }
    this.isloading = true;
    let items: PortfolioItem[];
    this.api.overview(holdings.map(holding => holding.ticker)).pipe(takeUntil(this.destroy$)).subscribe(({ names, quotes }) => {
      if (items) {
        items.forEach((item, i) => item.name = names[i]);
        return;
      }
      items = holdings.map((holding, i) => {
        const quote = quotes.get(holding.ticker.toUpperCase());
        const averagecost = holding.cost / holding.share;
        const currentprice = quote ? quote.last : 0;
        return {
          ticker: holding.ticker,
          name: names[i],
          Quantity: holding.share,
          averagecost,
          totalcost: holding.cost,
          currentprice,
          change: quote ? currentprice - averagecost : 0,
          marketvalue: currentprice * holding.share
        };
      });
      this.Portfolio = items;
      this.isloading = false;
    });
  }

  trackTicker(index: number, item: PortfolioItem): string {
    return item.ticker;
  }

  private refreshHolding(ticker: string): void {
    this.quoteRefreshes.get(ticker)?.unsubscribe();
    this.quoteRefreshes.delete(ticker);
    const holding = this.portfolio.holdings().find(held => held.ticker === ticker);
    if (!holding) {
      this.Portfolio = this.Portfolio.filter(item => item.ticker !== ticker);
      return;
    }
    let item = this.Portfolio.find(held => held.ticker === ticker);
    if (!item) {
      item = { ticker, name: undefined, Quantity: 0, averagecost: 0, totalcost: 0, currentprice: 0, change: 0, marketvalue: 0 };
      this.Portfolio = [...this.Portfolio, item].sort((a, b) => a.ticker < b.ticker ? -1 : 1);
      this.api.meta(ticker).pipe(
        catchError(() => of(undefined)), takeUntil(this.destroy$)
      ).subscribe(meta => item.name = meta ? meta.name : '');
    }
    item.Quantity = holding.share;
    item.totalcost = holding.cost;
    item.averagecost = holding.cost / holding.share;
    item.change = item.currentprice ? item.currentprice - item.averagecost : 0;
    item.marketvalue = item.currentprice * holding.share;
    this.quoteRefreshes.set(ticker, this.api.quote(ticker).pipe(
      catchError(() => of(undefined)), takeUntil(this.destroy$)
    ).subscribe(quote => {
      item.currentprice = quote ? quote.last : 0;
      item.change = quote ? item.currentprice - item.averagecost : 0;
      item.marketvalue = item.currentprice * item.Quantity;
    }));
  }
}
