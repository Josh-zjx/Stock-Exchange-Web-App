import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocaldataService } from './localdata.service'
import { RemotedataService } from './remotedata.service'
import { localwatchlist } from '../models/localdata';
import { watchlistitem } from '../models/watchlistdata';
import { WatchListItemComponent } from '../components/watch-list-item/watch-list-item.component';

@Injectable({
  providedIn: 'root'
})
export class WatchlistdataService {

  constructor(private localOP:LocaldataService,private remoteOP:RemotedataService) {}

  setwatchlist(){};
  getwatchlist():Observable<watchlistitem[]>{
    var list = []; 
    this.localOP.getwatchlist().subscribe((res)=>{
      
      for(var i=0;i!=res.length;i++)
      {
        this.remoteOP.getdaily(res[i]).subscribe(result=>{
          
          var data:watchlistitem;
          data.name=result.name;
          data.ticker=result.ticker;
          data.change=result.change;
          data.currentprice=result.currentprice;
          list.push(data);
        })
      }
      
    })
    return of(list);
  };
  
}
