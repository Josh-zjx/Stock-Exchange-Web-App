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
  rendernews(){

  }
  rendercharts(){
    
  }
  rendersummary(){

  }
  renderdailycharts(ticker:string):void{
    this.remoteOP.getremote(ticker,"dac").subscribe(
      (res)=>{
        console.log(res)


    })

  }
}
