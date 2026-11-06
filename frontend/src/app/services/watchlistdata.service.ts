import { Injectable } from '@angular/core';
import { LocalStore } from './local-store';

interface WatchlistEntry {
  ticker: string;
}

/** Watched tickers, kept upper-case and sorted. */
@Injectable({
  providedIn: 'root'
})
export class WatchlistdataService {
  private readonly store = new LocalStore<WatchlistEntry>('watchlist');

  tickers(): string[] {
    return this.store.load().map(entry => entry.ticker.toUpperCase());
  }

  has(ticker: string): boolean {
    return this.tickers().includes(ticker.toUpperCase());
  }

  add(ticker: string): void {
    if (!this.has(ticker)) {
      this.save([...this.tickers(), ticker.toUpperCase()]);
    }
  }

  remove(ticker: string): void {
    this.save(this.tickers().filter(watched => watched !== ticker.toUpperCase()));
  }

  private save(tickers: string[]): void {
    this.store.save(tickers.sort().map(ticker => ({ ticker })));
  }
}
