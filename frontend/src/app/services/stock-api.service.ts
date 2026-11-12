import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Candle, CompanyMeta, NewsArticle, PricePoint, Quote, SearchResult } from '../models/stock';

@Injectable({
  providedIn: 'root'
})
export class StockApiService {
  private readonly base = '/api';

  constructor(private http: HttpClient) { }

  meta(ticker: string): Observable<CompanyMeta> {
    return this.http.get<CompanyMeta>(this.stockUrl(ticker));
  }

  /** Emits quotes without waiting for names, then updates names as metadata arrives. */
  overview(tickers: string[]): Observable<{ names: (string | undefined)[], quotes: Map<string, Quote> }> {
    return combineLatest([
      this.names(tickers),
      this.quotes(tickers).pipe(catchError(() => of(new Map<string, Quote>())))
    ]).pipe(map(([names, quotes]) => ({ names, quotes })));
  }

  /** Names in ticker order: undefined while loading, blank when unavailable. */
  names(tickers: string[]): Observable<(string | undefined)[]> {
    if (!tickers.length) {
      return of([]);
    }
    return combineLatest(tickers.map(ticker => this.meta(ticker).pipe(
      map(meta => meta.name || ''),
      catchError(() => of('')),
      startWith(undefined)
    )));
  }

  /** Latest quotes keyed by upper-case ticker, fetched in a single request. */
  quotes(tickers: string[]): Observable<Map<string, Quote>> {
    return this.http.get<Quote[]>(`${this.base}/quotes`, { params: { tickers: tickers.join(',') } }).pipe(
      map(quotes => new Map(quotes.map(quote => [quote.ticker.toUpperCase(), quote])))
    );
  }

  /** The latest quote, or `undefined` for an unknown ticker. */
  quote(ticker: string): Observable<Quote | undefined> {
    return this.quotes([ticker]).pipe(map(quotes => quotes.get(ticker.toUpperCase())));
  }

  /** Close prices of the latest trading session. */
  intraday(ticker: string): Observable<PricePoint[]> {
    return this.http.get<PricePoint[]>(this.stockUrl(ticker, 'intraday'));
  }

  /** Two years of daily candles. */
  history(ticker: string): Observable<Candle[]> {
    return this.http.get<Candle[]>(this.stockUrl(ticker, 'history'));
  }

  news(ticker: string): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(this.stockUrl(ticker, 'news'));
  }

  search(query: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.base}/search`, { params: { q: query } });
  }

  private stockUrl(ticker: string, resource?: string): string {
    const url = `${this.base}/stocks/${encodeURIComponent(ticker)}`;
    return resource ? `${url}/${resource}` : url;
  }
}
