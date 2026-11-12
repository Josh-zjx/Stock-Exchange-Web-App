import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { CompanyMeta, PricePoint } from '../../models/stock';
import { PortfoliodataService } from '../../services/portfoliodata.service';
import { StockApiService } from '../../services/stock-api.service';
import { WatchlistdataService } from '../../services/watchlistdata.service';
import { DetailNewsComponent } from '../detail-news/detail-news.component';
import { NewsItemComponent } from '../news-item/news-item.component';
import { DetailsPageComponent } from './details-page.component';

const points: PricePoint[] = [[1000, 100], [2000, 110]];
const meta: CompanyMeta = { ticker: 'AAPL', name: 'Apple', exchangeCode: 'NASDAQ', description: 'Company description', startDate: '2000-01-01' };

function createApi(): jasmine.SpyObj<StockApiService> {
  const api = jasmine.createSpyObj('StockApiService', ['meta', 'quote', 'intraday', 'news']);
  api.meta.and.returnValue(of(meta));
  api.quote.and.callFake(() => of({
    ticker: 'AAPL', timestamp: new Date().toISOString(), last: 110, prevClose: 100,
    open: 101, high: 112, low: 99, volume: 1000, mid: 110, askPrice: 111,
    askSize: 10, bidPrice: 109, bidSize: 10
  }));
  api.intraday.and.returnValue(of(points));
  api.news.and.returnValue(of(Array.from({ length: 4 }, (_, i) => ({
    url: `https://example.com/${i}`, title: `News ${i}`, description: 'Description',
    source: 'Source', urlToImage: '', publishedAt: '2026-11-10T00:00:00Z'
  }))));
  return api;
}

describe('DetailsPageComponent refreshes', () => {
  let api: jasmine.SpyObj<StockApiService>;
  let component: DetailsPageComponent;
  let params: BehaviorSubject<any>;

  beforeEach(() => {
    api = createApi();
    params = new BehaviorSubject(convertToParamMap({ ticker: 'AAPL' }));
    component = new DetailsPageComponent(
      { paramMap: params } as unknown as ActivatedRoute, {} as NgbModal, api,
      {} as PortfoliodataService, { has: () => false } as unknown as WatchlistdataService
    );
  });

  it('loads intraday data without waiting for metadata and applies the correct color when quotes arrive', fakeAsync(() => {
    const delayedMeta = new Subject<CompanyMeta>();
    api.meta.and.returnValue(delayedMeta);
    component.ngOnInit();
    expect(api.intraday).toHaveBeenCalledTimes(1);
    expect(component.chartOptions.series[0].data).toEqual(points);
    expect(component.isloading).toBe(true);
    delayedMeta.next(meta);
    delayedMeta.complete();
    expect(component.isloading).toBe(false);
    expect(component.chartOptions.series[0].color).toBe('green');
    component.ngOnDestroy();
  }));

  it('keeps 15-second quote polls but fetches intraday once per minute and skips unchanged redraws', fakeAsync(() => {
    component.ngOnInit();
    component.updatechart = false;
    tick(45000);
    expect(api.quote).toHaveBeenCalledTimes(4);
    expect(api.intraday).toHaveBeenCalledTimes(1);
    expect(component.updatechart).toBe(false);
    api.intraday.and.returnValue(of(points.map(([time, close]) => [time, close] as PricePoint)));
    tick(15000);
    expect(api.quote).toHaveBeenCalledTimes(5);
    expect(api.intraday).toHaveBeenCalledTimes(2);
    expect(component.updatechart).toBe(false);
    const changed: PricePoint[] = [[1000, 100], [2000, 111]];
    api.intraday.and.returnValue(of(changed));
    tick(60000);
    expect(api.quote).toHaveBeenCalledTimes(9);
    expect(api.intraday).toHaveBeenCalledTimes(3);
    expect(component.updatechart).toBe(true);
    expect(component.chartOptions.series[0].data).toEqual(changed);
    component.ngOnDestroy();
    tick(60000);
    expect(api.quote).toHaveBeenCalledTimes(9);
    expect(api.intraday).toHaveBeenCalledTimes(3);
  }));

  it('redraws unchanged points when a quote changes the chart color', fakeAsync(() => {
    component.ngOnInit();
    component.updatechart = false;
    api.quote.and.returnValue(of({ ticker: 'AAPL', timestamp: new Date().toISOString(), last: 90, prevClose: 100 } as any));
    tick(15000);
    expect(api.intraday).toHaveBeenCalledTimes(1);
    expect(component.chartOptions.series[0].color).toBe('red');
    expect(component.updatechart).toBe(true);
    component.ngOnDestroy();
  }));

  it('does not overlap slow intraday requests and cancels them on navigation', fakeAsync(() => {
    component.ngOnInit();
    const delayed = new Subject<PricePoint[]>();
    api.intraday.and.returnValue(delayed);
    tick(60000);
    expect(api.intraday).toHaveBeenCalledTimes(2);
    tick(60000);
    expect(api.intraday).toHaveBeenCalledTimes(2);
    expect(delayed.observers.length).toBe(1);
    api.intraday.and.returnValue(of(points));
    params.next(convertToParamMap({ ticker: 'MSFT' }));
    expect(delayed.observers.length).toBe(0);
    expect(api.intraday).toHaveBeenCalledTimes(3);
    expect(component.ticker).toBe('MSFT');
    component.ngOnDestroy();
  }));

  it('keeps quotes running after a chart failure and retries the chart at its own cadence', fakeAsync(() => {
    api.intraday.and.returnValue(throwError(new Error('Chart unavailable')));
    component.ngOnInit();
    expect(component.isvalid).toBe(true);
    api.intraday.and.returnValue(of(points));
    tick(60000);
    expect(api.quote).toHaveBeenCalledTimes(5);
    expect(api.intraday).toHaveBeenCalledTimes(2);
    expect(component.chartOptions.series[0].data).toEqual(points);
    component.ngOnDestroy();
  }));

  it('preserves closed-market behavior without continuing chart or quote requests', fakeAsync(() => {
    api.quote.and.returnValue(of({ timestamp: new Date(Date.now() - 120000).toISOString(), last: 110, prevClose: 100 } as any));
    component.ngOnInit();
    expect(component.marketopen).toBe(false);
    tick(120000);
    expect(api.quote).toHaveBeenCalledTimes(1);
    expect(api.intraday).toHaveBeenCalledTimes(1);
    component.ngOnDestroy();
  }));
});

describe('DetailsPageComponent deferred news', () => {
  let fixture: ComponentFixture<DetailsPageComponent>;
  let api: jasmine.SpyObj<StockApiService>;
  let params: BehaviorSubject<any>;

  beforeEach(async () => {
    api = createApi();
    params = new BehaviorSubject(convertToParamMap({ ticker: 'AAPL' }));
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatTabsModule, MatProgressSpinnerModule, NoopAnimationsModule],
      declarations: [DetailsPageComponent, DetailNewsComponent, NewsItemComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: StockApiService, useValue: api },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) },
        { provide: PortfoliodataService, useValue: {} },
        { provide: WatchlistdataService, useValue: { has: () => false } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DetailsPageComponent);
  });

  function selectTab(index: number): void {
    fixture.nativeElement.querySelectorAll('[role="tab"]')[index].click();
    fixture.detectChanges();
    flushMicrotasks();
    tick(0);
    fixture.detectChanges();
  }

  it('fetches news only on first selection and retains it across tab switches', fakeAsync(() => {
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();
    expect(api.news).not.toHaveBeenCalled();
    selectTab(1);
    expect(api.news).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelectorAll('app-news-item').length).toBe(4);
    const images: HTMLImageElement[] = Array.from(fixture.nativeElement.querySelectorAll('app-news-item img'));
    expect(images.map(image => image.getAttribute('loading'))).toEqual(['eager', 'lazy', 'eager', 'lazy']);
    selectTab(0);
    selectTab(1);
    expect(api.news).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelectorAll('app-news-item').length).toBe(4);
    fixture.destroy();
  }));

  it('cancels pending news on navigation and defers news again for the next ticker', fakeAsync(() => {
    const pendingNews = new Subject<any[]>();
    api.news.and.returnValue(pendingNews);
    fixture.detectChanges();
    flushMicrotasks();
    selectTab(1);
    expect(pendingNews.observers.length).toBe(1);
    const delayedMeta = new Subject<CompanyMeta>();
    api.meta.and.returnValue(delayedMeta);
    params.next(convertToParamMap({ ticker: 'MSFT' }));
    fixture.detectChanges();
    expect(pendingNews.observers.length).toBe(0);
    delayedMeta.next({ ...meta, ticker: 'MSFT' });
    delayedMeta.complete();
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();
    expect(api.news).toHaveBeenCalledTimes(1);
    selectTab(1);
    expect(api.news).toHaveBeenCalledTimes(2);
    expect(api.news).toHaveBeenCalledWith('MSFT');
    fixture.destroy();
  }));
});
