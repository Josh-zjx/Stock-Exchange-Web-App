import { Injectable } from '@angular/core';
import { Observable, of,forkJoin} from 'rxjs';
import {detaildesc,detailclose,detailopen} from '../models/remotedata';
import { LocaldataService } from './localdata.service'
import { RemotedataService } from './remotedata.service'
@Injectable({
  providedIn: 'root'
})
export class DetaildataService {

  constructor(private localOP:LocaldataService,private remoteOP:RemotedataService) { 

  }
  rendernews(ticker:string):Observable<object>{
    return this.remoteOP.getremote(ticker,"news")
  }
  rendercharts(ticker:string):Observable<object>{
    return this.remoteOP.getremote(ticker,"hist")
    
  }
  rendersummary(ticker:string):Observable<object[]>{
    var ob = [this.remoteOP.getremote(ticker,"daily"),this.remoteOP.getremote(ticker,"iex")]
    return forkJoin(ob)


  }
  renderdailycharts(ticker:string,offset:number=0):Observable<object>{
    
    return this.remoteOP.getremote(ticker,`dac&offset=${offset}`)

  }
  

}
