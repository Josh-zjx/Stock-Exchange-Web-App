import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';

import { PortfoliodataService } from '../../services/portfoliodata.service';
import { StockApiService } from '../../services/stock-api.service';
import { BuymodalComponent } from '../buymodal/buymodal.component';
import { PortfolioPageComponent } from '../portfolio-page/portfolio-page.component';
import { SellmodalComponent } from '../sellmodal/sellmodal.component';
import { PortfolioPageItemComponent } from './portfolio-page-item.component';

describe('PortfolioPageItemComponent', () => {
  let component: PortfolioPageItemComponent;
  let fixture: ComponentFixture<PortfolioPageItemComponent>;
  let modal: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    modal = jasmine.createSpyObj('NgbModal', ['open']);
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PortfolioPageItemComponent],
      providers: [
        { provide: NgbModal, useValue: modal },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioPageItemComponent);
    component = fixture.componentInstance;
    component.item = {
      ticker: 'AAPL', name: 'Apple', Quantity: 2, averagecost: 100,
      totalcost: 200, change: 10, currentprice: 110, marketvalue: 220
    };
    fixture.detectChanges();
  });

  it('blocks both transactions when the quote request fails', () => {
    const http = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
    http.get.and.callFake((url: string): any => url === '/api/quotes'
      ? throwError(new Error('Quote unavailable'))
      : of({ name: 'Apple' }));
    const portfolio = {
      holdings: () => [{ ticker: 'AAPL', share: 2, cost: 200 }]
    } as PortfoliodataService;
    const page = new PortfolioPageComponent(portfolio, new StockApiService(http));
    page.ngOnInit();
    component.item = page.Portfolio[0];
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    expect(buttons.length).toBe(2);
    buttons.forEach(button => {
      expect(button.disabled).toBe(true);
      expect(button.classList.contains('btn-secondary')).toBe(true);
      expect(button.parentElement.title).toBe('Current price is not available.');
      button.click();
    });
    component.openbuy();
    component.opensell();
    expect(modal.open).not.toHaveBeenCalled();
  });

  [0, -1, NaN, Infinity, null, undefined].forEach(price => {
    it(`blocks transactions for an invalid price (${price})`, () => {
      component.item.currentprice = price;
      fixture.detectChanges();

      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
      expect(buttons.every(button => button.disabled)).toBe(true);
      component.openbuy();
      component.opensell();
      expect(modal.open).not.toHaveBeenCalled();
    });
  });

  it('restores the normal buttons when an available price replaces an unavailable price', () => {
    component.item.currentprice = 0;
    fixture.detectChanges();
    component.item.currentprice = 110;
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    expect(buttons.every(button => !button.disabled)).toBe(true);
    expect(buttons[0].classList.contains('btn-primary')).toBe(true);
    expect(buttons[1].classList.contains('btn-danger')).toBe(true);
    buttons.forEach(button => {
      expect(button.classList.contains('btn-secondary')).toBe(false);
      expect(button.parentElement.hasAttribute('title')).toBe(false);
    });
  });

  it('opens both transaction dialogs with the available price', () => {
    const dialog = { componentInstance: {}, result: { then: jasmine.createSpy('then') } };
    modal.open.and.returnValue(dialog as any);

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    buttons[0].click();
    expect(modal.open).toHaveBeenCalledWith(BuymodalComponent);
    expect(dialog.componentInstance).toEqual(jasmine.objectContaining({ name: 'AAPL', price: 110 }));
    buttons[1].click();
    expect(modal.open).toHaveBeenCalledWith(SellmodalComponent);
    expect(dialog.componentInstance).toEqual(jasmine.objectContaining({ name: 'AAPL', price: 110, share: 2 }));
  });
});
