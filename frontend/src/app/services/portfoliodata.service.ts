import { Injectable } from '@angular/core';
import { LocalStore } from './local-store';

export interface Holding {
  ticker: string;
  share: number;
  /** Total cost basis of the shares held. */
  cost: number;
}

/** Holdings, kept sorted by ticker. */
@Injectable({
  providedIn: 'root'
})
export class PortfoliodataService {
  private readonly store = new LocalStore<Holding>('portfolio');

  holdings(): Holding[] {
    return this.store.load();
  }

  buy(ticker: string, amount: number, price: number): void {
    const holdings = this.holdings();
    const holding = holdings.find(held => held.ticker === ticker);
    if (holding) {
      holding.share += amount;
      holding.cost += amount * price;
    } else {
      holdings.push({ ticker, share: amount, cost: amount * price });
    }
    this.store.save(holdings.sort((a, b) => a.ticker < b.ticker ? -1 : 1));
  }

  sell(ticker: string, amount: number): void {
    const holdings = this.holdings();
    const holding = holdings.find(held => held.ticker === ticker);
    if (!holding) {
      return;
    }
    // The shares kept retain their average cost; the sale price only affects realised gains
    holding.cost -= holding.cost / holding.share * amount;
    holding.share -= amount;
    this.store.save(holdings.filter(held => held.share > 0));
  }
}
