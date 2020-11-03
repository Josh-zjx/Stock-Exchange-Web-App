import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuymodalComponent } from './buymodal.component';

describe('BuymodalComponent', () => {
  let component: BuymodalComponent;
  let fixture: ComponentFixture<BuymodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuymodalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuymodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
