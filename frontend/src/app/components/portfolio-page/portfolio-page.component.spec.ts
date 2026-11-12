import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfoliodataService } from '../../services/portfoliodata.service';
import { PortfolioPageItemComponent } from '../portfolio-page-item/portfolio-page-item.component';
import { PortfolioPageComponent } from './portfolio-page.component';

describe('PortfolioPageComponent', () => {
  let component: PortfolioPageComponent;
  let fixture: ComponentFixture<PortfolioPageComponent>;
  let http: HttpTestingController;
  let portfolio: jasmine.SpyObj<PortfoliodataService>;
  const quotes = [{ ticker: 'FAST', last: 110 }, { ticker: 'SLOW', last: 50 }];

  beforeEach(async () => {
    portfolio = jasmine.createSpyObj('PortfoliodataService', ['holdings', 'buy', 'sell']);
    portfolio.holdings.and.returnValue([
      { ticker: 'FAST', share: 2, cost: 200 }, { ticker: 'SLOW', share: 1, cost: 50 }
    ]);
    await TestBed.configureTestingModule({
      imports: [CommonModule, HttpClientTestingModule, MatProgressSpinnerModule],
      declarations: [PortfolioPageComponent, PortfolioPageItemComponent],
      providers: [
        { provide: PortfoliodataService, useValue: portfolio },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioPageComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows quotes and enabled transactions while names load, preserving the rows', () => {
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    fixture.detectChanges();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('app-portfolio-page-item'));
    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Loading company name…');
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    expect(buttons.every(button => !button.disabled)).toBe(true);
    const items = component.Portfolio;
    expect(items[0].marketvalue).toBe(220);
    expect(items[0].change).toBe(10);

    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Fast Company');
    expect(fixture.nativeElement.textContent).toContain('Loading company name…');
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    fixture.detectChanges();
    expect(component.Portfolio).toBe(items);
    expect(Array.from(fixture.nativeElement.querySelectorAll('app-portfolio-page-item'))).toEqual(rows);
    expect(fixture.nativeElement.textContent).not.toContain('Loading company name…');
    expect(items[0].marketvalue).toBe(220);
    expect(items[0].totalcost).toBe(200);
  });

  it('keeps transactions disabled after a quote failure even when names arrive', () => {
    http.expectOne(request => request.url === '/api/quotes').flush({}, { status: 502, statusText: 'Bad Gateway' });
    http.expectOne('/api/stocks/FAST').flush({}, { status: 502, statusText: 'Bad Gateway' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    expect(buttons.length).toBe(4);
    expect(buttons.every(button => button.disabled)).toBe(true);
    expect(component.Portfolio[0].name).toBe('');
    expect(fixture.nativeElement.textContent).not.toContain('Loading company name…');
  });

  it('renders identical final markup whether names arrive before or after quotes', () => {
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    fixture.detectChanges();
    const finalMarkup = fixture.nativeElement.innerHTML.replace(/<!--[\s\S]*?-->/g, '');

    component.getportfolio();
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    fixture.detectChanges();
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML.replace(/<!--[\s\S]*?-->/g, '')).toBe(finalMarkup);
  });

  it('does not overwrite a completed trade when old metadata arrives', () => {
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    const oldSlow = http.expectOne('/api/stocks/SLOW');
    portfolio.holdings.and.returnValue([
      { ticker: 'FAST', share: 3, cost: 310 }, { ticker: 'SLOW', share: 1, cost: 50 }
    ]);
    component.buy({ name: 'FAST', amount: 1, price: 110 });
    http.expectOne(request => request.url === '/api/quotes' && request.params.get('tickers') === 'FAST').flush([quotes[0]]);
    http.expectNone(request => request.url.startsWith('/api/'));
    const currentItems = component.Portfolio;
    oldSlow.flush({ name: 'Slow Company' });
    expect(portfolio.buy).toHaveBeenCalledWith('FAST', 1, 110);
    expect(component.Portfolio).toBe(currentItems);
    expect(component.Portfolio[0].Quantity).toBe(3);
    expect(component.Portfolio[0].totalcost).toBe(310);
    expect(component.Portfolio[1].name).toBe('Slow Company');
  });

  it('updates a bought holding immediately and refreshes only its quote without recreating rows', () => {
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    fixture.detectChanges();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('app-portfolio-page-item'));
    const otherHolding = { ...component.Portfolio[1] };
    portfolio.holdings.and.returnValue([
      { ticker: 'FAST', share: 3, cost: 310 }, { ticker: 'SLOW', share: 1, cost: 50 }
    ]);
    component.buy({ name: 'FAST', amount: 1, price: 110 });
    fixture.detectChanges();
    expect(component.Portfolio[0].Quantity).toBe(3);
    expect(component.Portfolio[0].totalcost).toBe(310);
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
    expect(Array.from(fixture.nativeElement.querySelectorAll('app-portfolio-page-item'))).toEqual(rows);
    http.expectOne(request => request.url === '/api/quotes' && request.params.get('tickers') === 'FAST')
      .flush([{ ticker: 'FAST', last: 120 }]);
    expect(component.Portfolio[0].marketvalue).toBe(360);
    expect(component.Portfolio[1]).toEqual(otherHolding);
    http.expectNone(request => request.url.startsWith('/api/'));
  });

  it('updates a partial sale and removes fully sold holdings without reloading the list', () => {
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    fixture.detectChanges();
    const remainingRow = fixture.nativeElement.querySelectorAll('app-portfolio-page-item')[1];
    portfolio.holdings.and.returnValue([
      { ticker: 'FAST', share: 1, cost: 100 }, { ticker: 'SLOW', share: 1, cost: 50 }
    ]);
    component.sell({ name: 'FAST', amount: 1, price: 110 });
    http.expectOne(request => request.url === '/api/quotes' && request.params.get('tickers') === 'FAST')
      .flush([{ ticker: 'FAST', last: 120 }]);
    expect(component.Portfolio[0].averagecost).toBe(100);
    expect(component.Portfolio[0].marketvalue).toBe(120);
    portfolio.holdings.and.returnValue([{ ticker: 'SLOW', share: 1, cost: 50 }]);
    component.sell({ name: 'FAST', amount: 1, price: 120 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-portfolio-page-item')).toBe(remainingRow);
    expect(component.Portfolio.map(item => item.ticker)).toEqual(['SLOW']);
    portfolio.holdings.and.returnValue([]);
    component.sell({ name: 'SLOW', amount: 1, price: 50 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Currently you don't have any stock.");
    http.expectNone(request => request.url.startsWith('/api/'));
  });

  it('disables the affected transactions when their quote refresh fails', () => {
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    portfolio.holdings.and.returnValue([
      { ticker: 'FAST', share: 3, cost: 310 }, { ticker: 'SLOW', share: 1, cost: 50 }
    ]);
    component.buy({ name: 'FAST', amount: 1, price: 110 });
    http.expectOne(request => request.url === '/api/quotes')
      .flush({}, { status: 502, statusText: 'Bad Gateway' });
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('app-portfolio-page-item');
    expect(rows[0].querySelector('button').disabled).toBe(true);
    expect(rows[1].querySelector('button').disabled).toBe(false);
  });

  it('cancels an older quote refresh when the same holding is traded again', () => {
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    portfolio.holdings.and.returnValue([{ ticker: 'FAST', share: 3, cost: 310 }]);
    component.buy({ name: 'FAST', amount: 1, price: 110 });
    const olderQuote = http.expectOne(request => request.url === '/api/quotes');
    portfolio.holdings.and.returnValue([{ ticker: 'FAST', share: 4, cost: 420 }]);
    component.buy({ name: 'FAST', amount: 1, price: 110 });
    expect(olderQuote.cancelled).toBe(true);
    http.expectOne(request => request.url === '/api/quotes').flush([{ ticker: 'FAST', last: 130 }]);
    expect(component.Portfolio[0].Quantity).toBe(4);
    expect(component.Portfolio[0].marketvalue).toBe(520);
  });

  it('loads only the new holding when a completed buy adds it to the page', () => {
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    const existingItems = component.Portfolio.slice();
    portfolio.holdings.and.returnValue([
      { ticker: 'FAST', share: 2, cost: 200 }, { ticker: 'SLOW', share: 1, cost: 50 },
      { ticker: 'NEW', share: 1, cost: 75 }
    ]);
    component.buy({ name: 'NEW', amount: 1, price: 75 });
    http.expectOne('/api/stocks/NEW').flush({ name: 'New Company' });
    http.expectOne(request => request.url === '/api/quotes' && request.params.get('tickers') === 'NEW')
      .flush([{ ticker: 'NEW', last: 80 }]);
    expect(component.Portfolio.map(item => item.ticker)).toEqual(['FAST', 'NEW', 'SLOW']);
    expect(component.Portfolio[0]).toBe(existingItems[0]);
    expect(component.Portfolio[2]).toBe(existingItems[1]);
    expect(component.Portfolio[1].name).toBe('New Company');
    expect(component.Portfolio[1].marketvalue).toBe(80);
    http.expectNone(request => request.url.startsWith('/api/'));
  });

  it('cancels a pending quote refresh when the page is destroyed', () => {
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    component.buy({ name: 'FAST', amount: 1, price: 110 });
    const refresh = http.expectOne(request => request.url === '/api/quotes');
    fixture.destroy();
    expect(refresh.cancelled).toBe(true);
  });
});
