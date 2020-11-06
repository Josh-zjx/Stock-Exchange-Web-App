import { Injectable } from '@angular/core';
import { Observable, of,forkJoin} from 'rxjs';
import { LocaldataService } from './localdata.service'
import { RemotedataService } from './remotedata.service'
//import { localwatchlist } from '../models/localdata';
import { watchlistitem,localwatchlist } from '../models/watchlistdata';
import { WatchListItemComponent } from '../components/watch-list-item/watch-list-item.component';

@Injectable({
  providedIn: 'root'
})
export class WatchlistdataService {
  constructor(private localOP:LocaldataService,private remoteOP:RemotedataService) {
    localOP.initializelocal("watchlist");
    this.addwatchlist("AAPL");
    this.addwatchlist("IBM");
    this.addwatchlist("NVDA");
  }

  addwatchlist(ticker:string):void{
    var original = this.getwatchlist();
    //console.log(original)
    original.push({ticker:ticker});
    this.localOP.setlocal("watchlist",JSON.stringify(original))
  };
  deletewatchlist(ticker:string):void{
    var original = this.getwatchlist();
    //var index = original.indexOf({ticker:ticker});
    for(var i=0;i!=original.length;i++)
    {
      if(original[i].ticker==ticker)
      {
        //console.log(`deleting${ticker}`)
        original.splice(i,1);
        break;
      }
    }    
    //console.log(original)
    this.localOP.setlocal("watchlist",JSON.stringify(original));
  };
  inwatchlist(ticker:string):boolean{
    var original = this.getwatchlist();
    //console.log(original)
    for(var i=0;i!=original.length;i++)
    {
      if(original[i].ticker==ticker)
      {
        return true
      }

    }
    return false;
  };
  getwatchlist():localwatchlist[]{
    var rawstring = this.localOP.getlocal("watchlist");
    if(rawstring==null)
    {
      this.localOP.initializelocal("watchlist");
      rawstring = this.localOP.getlocal("watchlist");
    }
    return JSON.parse(rawstring);
    //return [{ticker:"AAPL"},{ticker:"MSFN"},{ticker:"IBM"}]
  };
  renderwatchlist():watchlistitem[]{
    var list:Observable<object>[] = []; 
    var namelist = this.getwatchlist();
    //console.log(namelist);
    var watchlist={};
    var watchlistitems:watchlistitem[]=[];
    for(var i=0;i!=namelist.length;i++)
    {
      watchlist[namelist[i].ticker]={ticker:namelist[i].ticker,name:"",change:0,currentprice:0,changepercent:0};
      list.push(this.remoteOP.getremote(namelist[i].ticker,"daily"));
      list.push(this.remoteOP.getremote(namelist[i].ticker,"iex"));
    }
    //console.log(watchlist)
    var allob:Observable<object[]>=forkJoin(list);
    allob.subscribe(res=>{
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
      return watchlistitems;
    })
    return watchlistitems;
  };
  
}
