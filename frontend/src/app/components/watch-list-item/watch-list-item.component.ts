import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';
import {watchlistitem} from '../../models/watchlistdata';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watch-list-item',
  templateUrl: './watch-list-item.component.html',
  styleUrls: ['./watch-list-item.component.css']
})
export class WatchListItemComponent implements OnInit {
  @Input() item:watchlistitem;
  @Output() deleteitem=new EventEmitter();
  constructor(private router:Router) { }

  ngOnInit(): void {
  }
  delete(item:watchlistitem){
    //console.log(`please delete ${item.ticker}`)
    this.deleteitem.emit(item.ticker);
  }
  navidetail(item:watchlistitem):void{
    this.router.navigateByUrl("/details/"+item.ticker)
  }
}
