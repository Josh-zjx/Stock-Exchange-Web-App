/** Company profile, as served by `GET /api/stocks/:ticker`. */
export interface CompanyMeta {
  ticker: string;
  name: string;
  exchangeCode: string;
  description: string;
  startDate: string;
}

/** Latest IEX quote, as served by `GET /api/quotes`. */
export interface Quote {
  ticker: string;
  timestamp: string;
  last: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  mid: number;
  askPrice: number;
  askSize: number;
  bidPrice: number;
  bidSize: number;
}

export type PricePoint = [time: number, close: number];

export type Candle = [time: number, open: number, high: number, low: number, close: number, volume: number];

export interface NewsArticle {
  url: string;
  title: string;
  description: string;
  source: string;
  urlToImage: string;
  publishedAt: string;
}

export interface SearchResult {
  ticker: string;
  name: string;
}

/** Price movement since the previous close. */
export function dayChange(quote: Quote): number {
  return quote.last - quote.prevClose;
}
