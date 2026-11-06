import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SearchResult } from '../../models/stock';
import { StockApiService } from '../../services/stock-api.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit, OnDestroy {
  options: SearchResult[] = [];
  ticker = '';
  isloading = false;
  myControl = new FormControl();
  private readonly destroy$ = new Subject<void>();

  constructor(private router: Router, private api: StockApiService) { }

  ngOnInit(): void {
    // switchMap drops replies to stale queries, so suggestions always match the latest input
    this.myControl.valueChanges.pipe(
      debounceTime(300),
      tap(() => { this.isloading = true; }),
      switchMap((query: string) => this.suggest(query)),
      takeUntil(this.destroy$)
    ).subscribe(options => {
      this.options = options;
      this.isloading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navi(): void {
    if (this.ticker) {
      this.router.navigate(['/details', this.ticker]);
    }
  }

  private suggest(query: string): Observable<SearchResult[]> {
    return query ? this.api.search(query).pipe(catchError(() => of([]))) : of([]);
  }
}
