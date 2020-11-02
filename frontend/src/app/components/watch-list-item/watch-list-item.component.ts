import { Component, OnInit,Input,Output} from '@angular/core';
import {watchlistitem} from '../../models/watchlistdata';

@Component({
  selector: 'app-watch-list-item',
  templateUrl: './watch-list-item.component.html',
  styleUrls: ['./watch-list-item.component.css']
})
export class WatchListItemComponent implements OnInit {
  @Input() item:watchlistitem;
  constructor() { }

  ngOnInit(): void {
  }
  delete(item:watchlistitem){

  }
}
