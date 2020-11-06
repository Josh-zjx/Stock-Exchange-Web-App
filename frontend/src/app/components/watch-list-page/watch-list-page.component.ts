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
  isloading:boolean=true;
  ngOnInit(): void {
    this.isloading=true;
    this.getWatchList();
  }
  getWatchList():void{
    this.isloading=true;
    var namelist = this.dataservice.getwatchlist();
    this.watchlistitems=[]
    console.log(namelist)
    var watchlist={};
    var watchlistitems:watchlistitem[]=[];
    if(namelist.length==0)
    {
      this.isloading=false;
      return
    }
    for(var i=0;i!=namelist.length;i++)
    {
      watchlist[namelist[i].ticker]={ticker:namelist[i].ticker,name:"",change:0,currentprice:0,changepercent:0};
      //list.push(this.remoteOP.getremote(namelist[i].ticker,"daily"));
      //list.push(this.remoteOP.getremote(namelist[i].ticker,"iex"));
    }
    this.dataservice.renderwatchlist().subscribe(res=>{
      var parsedstring;
      for(var i=0;i!=res.length;i++)
      {
        parsedstring = res[i];
        if(parsedstring.hasOwnProperty("name"))
        {
          watchlist[parsedstring["ticker"]].name=parsedstring["name"];
        }
        else
        {
          //console.log(parsedstring[0]["ticker"])
          watchlist[parsedstring[0]["ticker"]].currentprice=parsedstring[0]["last"];
          watchlist[parsedstring[0]["ticker"]].change=parsedstring[0]["last"]-parsedstring[0]["prevClose"];
          watchlist[parsedstring[0]["ticker"]].changepercent=(parsedstring[0]["last"]-parsedstring[0]["prevClose"])/parsedstring[0]["prevClose"];
        }        
      }
      for(var i=0;i!=namelist.length;i++)
      {
        watchlistitems.push(watchlist[namelist[i].ticker]);
      }
      this.watchlistitems = watchlistitems;
      this.isloading=false;
    });
    
  }
  deleteitem(name:string):void{
    //window.alert("Should delete")
    //console.log(`lease delete ${name}`)
    console.log(`delete ${name}`)
    this.dataservice.deletewatchlist(name);
    this.getWatchList();
    console.log(this.watchlistitems)
  }

}
