import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

export interface WatchlistItem {
  ticker: string;
  name: string;
  change: number;
  currentprice: number;
  changepercent: number;
}

@Component({
  selector: 'app-watch-list-item',
  templateUrl: './watch-list-item.component.html',
  styleUrls: ['./watch-list-item.component.css']
})
export class WatchListItemComponent {
  @Input() item: WatchlistItem;
  @Output() deleteitem = new EventEmitter<string>();

  constructor(private router: Router) { }

  delete(item: WatchlistItem): void {
    this.deleteitem.emit(item.ticker);
  }

  navidetail(item: WatchlistItem): void {
    this.router.navigate(['/details', item.ticker]);
  }
}
