import { TestBed } from '@angular/core/testing';

import { PortofolioDataService } from './portofolio-data.service';

describe('PortofolioDataService', () => {
  let service: PortofolioDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortofolioDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
