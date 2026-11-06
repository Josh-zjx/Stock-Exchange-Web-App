import { Component, OnInit } from '@angular/core';
import { Order } from '../../models/order';
import { PortfoliodataService } from '../../services/portfoliodata.service';
import { StockApiService } from '../../services/stock-api.service';
import { PortfolioItem } from '../portfolio-page-item/portfolio-page-item.component';

@Component({
  selector: 'app-portfolio-page',
  templateUrl: './portfolio-page.component.html',
  styleUrls: ['./portfolio-page.component.css']
})
export class PortfolioPageComponent implements OnInit {
  Portfolio: PortfolioItem[] = [];
  isloading = true;

  constructor(private portfolio: PortfoliodataService, private api: StockApiService) { }

  ngOnInit(): void {
    this.getportfolio();
  }

  buy(order: Order): void {
    this.portfolio.buy(order.name, order.amount, order.price);
    this.getportfolio();
  }

  sell(order: Order): void {
    this.portfolio.sell(order.name, order.amount);
    this.getportfolio();
  }

  getportfolio(): void {
    const holdings = this.portfolio.holdings();
    if (!holdings.length) {
      this.Portfolio = [];
      this.isloading = false;
      return;
    }
    this.isloading = true;
    this.api.overview(holdings.map(holding => holding.ticker)).subscribe(({ names, quotes }) => {
      this.Portfolio = holdings.map((holding, i) => {
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
      this.isloading = false;
    });
  }
}
