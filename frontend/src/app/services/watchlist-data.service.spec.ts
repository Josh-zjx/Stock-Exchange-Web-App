import { TestBed } from '@angular/core/testing';

import { WatchlistDataService } from './watchlist-data.service';

describe('WatchlistDataService', () => {
  let service: WatchlistDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
