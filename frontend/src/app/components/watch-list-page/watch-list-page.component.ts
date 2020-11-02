import { Component, OnInit } from '@angular/core';
import {watchlistitem} from '../../models/watchlistdata';
import {WatchlistdataService} from '../../services/watchlistdata.service';

@Component({
  selector: 'app-watch-list-page',
  templateUrl: './watch-list-page.component.html',
  styleUrls: ['./watch-list-page.component.css']
})
export class WatchListPageComponent implements OnInit {

  watchlistitems:watchlistitem[] = [
    {ticker:"AA",
    name: "Aaa",
    change:10,
    currentprice:10,
    changepercent:1},
    {ticker:"BB",
    name: "Bbb",
    change:20,
    currentprice:10,
    changepercent:2}
  ]
  constructor(private dataservice:WatchlistdataService) { 
    
  }
  
  ngOnInit(): void {
  }
  getWatchList():void{
    this.dataservice.getwatchlist().subscribe(watchlist=>this.wachlistitems=watchlist)
  }


}
