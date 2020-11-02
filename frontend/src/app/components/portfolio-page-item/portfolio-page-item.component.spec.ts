import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioPageItemComponent } from './portfolio-page-item.component';

describe('PortfolioPageItemComponent', () => {
  let component: PortfolioPageItemComponent;
  let fixture: ComponentFixture<PortfolioPageItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortfolioPageItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioPageItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
