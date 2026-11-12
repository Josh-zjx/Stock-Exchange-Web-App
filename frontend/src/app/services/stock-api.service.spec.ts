import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StockApiService } from './stock-api.service';

describe('StockApiService overview metadata', () => {
  let api: StockApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    api = TestBed.inject(StockApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('emits quotes before metadata, then updates each name in ticker order', () => {
    const values = [];
    let complete = false;
    api.overview(['FAST', 'SLOW']).subscribe(value => values.push(value), fail, () => complete = true);
    const fast = http.expectOne('/api/stocks/FAST');
    const slow = http.expectOne('/api/stocks/SLOW');
    const quotes = http.expectOne(request => request.url === '/api/quotes');
    expect(quotes.request.params.get('tickers')).toBe('FAST,SLOW');
    expect(values.length).toBe(0);

    quotes.flush([{ ticker: 'FAST', last: 110 }, { ticker: 'SLOW', last: 50 }]);
    expect(values.length).toBe(1);
    expect(values[0].names).toEqual([undefined, undefined]);
    expect(values[0].quotes.get('FAST').last).toBe(110);

    slow.flush({ name: 'Slow Company' });
    expect(values[1].names).toEqual([undefined, 'Slow Company']);
    expect(complete).toBe(false);
    fast.flush({ name: 'Fast Company' });
    expect(values[2].names).toEqual(['Fast Company', 'Slow Company']);
    expect(values[2].quotes).toBe(values[0].quotes);
    expect(complete).toBe(true);
    http.expectNone(request => request.url === '/api/quotes');
  });

  it('waits for quotes when metadata arrives first', () => {
    const values = [];
    api.overview(['FAST']).subscribe(value => values.push(value));
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    expect(values.length).toBe(0);

    http.expectOne(request => request.url === '/api/quotes').flush([{ ticker: 'FAST', last: 110 }]);
    expect(values.length).toBe(1);
    expect(values[0].names).toEqual(['Fast Company']);
    expect(values[0].quotes.get('FAST').last).toBe(110);
  });

  it('keeps the existing blank-name and empty-quote fallbacks on failures', () => {
    const values = [];
    api.overview(['FAST', 'SLOW']).subscribe(value => values.push(value));
    http.expectOne(request => request.url === '/api/quotes').flush({}, { status: 502, statusText: 'Bad Gateway' });
    expect(values[0].quotes.size).toBe(0);
    expect(values[0].names).toEqual([undefined, undefined]);

    http.expectOne('/api/stocks/FAST').flush({}, { status: 502, statusText: 'Bad Gateway' });
    expect(values[1].names).toEqual(['', undefined]);
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    expect(values[2].names).toEqual(['', 'Slow Company']);
    expect(values[2].quotes.size).toBe(0);
  });

  it('emits an empty names array for no tickers without requesting metadata', () => {
    const values = [];
    api.names([]).subscribe(value => values.push(value));
    expect(values).toEqual([[]]);
    http.expectNone(request => request.url.startsWith('/api/stocks/'));
  });
});
