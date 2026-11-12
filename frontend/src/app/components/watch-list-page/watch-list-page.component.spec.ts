import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { WatchlistdataService } from '../../services/watchlistdata.service';
import { WatchListItemComponent } from '../watch-list-item/watch-list-item.component';
import { WatchListPageComponent } from './watch-list-page.component';

describe('WatchListPageComponent', () => {
  let component: WatchListPageComponent;
  let fixture: ComponentFixture<WatchListPageComponent>;
  let http: HttpTestingController;
  let watchlist: jasmine.SpyObj<WatchlistdataService>;
  const quotes = [{ ticker: 'FAST', last: 110, prevClose: 100 }, { ticker: 'SLOW', last: 50, prevClose: 55 }];

  beforeEach(async () => {
    watchlist = jasmine.createSpyObj('WatchlistdataService', ['tickers', 'remove']);
    watchlist.tickers.and.returnValue(['FAST', 'SLOW']);
    await TestBed.configureTestingModule({
      imports: [CommonModule, HttpClientTestingModule, MatProgressSpinnerModule],
      declarations: [WatchListPageComponent, WatchListItemComponent],
      providers: [
        { provide: WatchlistdataService, useValue: watchlist },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchListPageComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows quotes with placeholders and replaces names without recreating rows', () => {
    expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    fixture.detectChanges();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('app-watch-list-item'));
    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Loading company name…');
    expect(component.watchlistitems.map(item => item.currentprice)).toEqual([110, 50]);
    const items = component.watchlistitems;

    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Fast Company');
    expect(fixture.nativeElement.textContent).toContain('Loading company name…');
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    fixture.detectChanges();
    expect(component.watchlistitems).toBe(items);
    expect(Array.from(fixture.nativeElement.querySelectorAll('app-watch-list-item'))).toEqual(rows);
    expect(component.watchlistitems.map(item => item.name)).toEqual(['Fast Company', 'Slow Company']);
    expect(fixture.nativeElement.textContent).not.toContain('Loading company name…');
    expect(component.watchlistitems.map(item => item.change)).toEqual([10, -5]);
  });

  it('removes the placeholder when a name cannot be fetched', () => {
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    http.expectOne('/api/stocks/FAST').flush({}, { status: 502, statusText: 'Bad Gateway' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    fixture.detectChanges();
    expect(component.watchlistitems[0].name).toBe('');
    expect(fixture.nativeElement.textContent).not.toContain('Loading company name…');
    expect(component.watchlistitems[0].currentprice).toBe(110);
  });

  it('renders identical final markup whether names arrive before or after quotes', () => {
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    fixture.detectChanges();
    const finalMarkup = fixture.nativeElement.innerHTML.replace(/<!--[\s\S]*?-->/g, '');

    component.getWatchList();
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    fixture.detectChanges();
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    http.expectOne('/api/stocks/SLOW').flush({ name: 'Slow Company' });
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML.replace(/<!--[\s\S]*?-->/g, '')).toBe(finalMarkup);
  });

  it('does not restore a deleted entry when its old metadata arrives', () => {
    http.expectOne(request => request.url === '/api/quotes').flush(quotes);
    http.expectOne('/api/stocks/FAST').flush({ name: 'Fast Company' });
    const oldSlow = http.expectOne('/api/stocks/SLOW');
    fixture.detectChanges();
    const retainedRow = fixture.nativeElement.querySelector('app-watch-list-item');
    watchlist.tickers.and.returnValue(['FAST']);
    component.deleteitem('SLOW');
    http.expectNone(request => request.url.startsWith('/api/'));
    const currentItems = component.watchlistitems;
    oldSlow.flush({ name: 'Slow Company' });
    fixture.detectChanges();
    expect(watchlist.remove).toHaveBeenCalledWith('SLOW');
    expect(component.watchlistitems).toBe(currentItems);
    expect(component.watchlistitems.map(item => item.ticker)).toEqual(['FAST']);
    expect(fixture.nativeElement.querySelector('app-watch-list-item')).toBe(retainedRow);
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
    component.deleteitem('FAST');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-watch-list-item').length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain("Currently you don't have any stock in your watchlist.");
    http.expectNone(request => request.url.startsWith('/api/'));
  });
});
