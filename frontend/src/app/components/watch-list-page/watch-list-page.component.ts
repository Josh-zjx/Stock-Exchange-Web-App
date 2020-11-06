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
    this.getWatchList();
  }
  getWatchList():void{
    this.watchlistitems=this.dataservice.renderwatchlist();
  }
  deleteitem(name:string):void{
    //window.alert("Should delete")
    //console.log(`lease delete ${name}`)
    this.dataservice.deletewatchlist(name);
    this.getWatchList();
  }

}
