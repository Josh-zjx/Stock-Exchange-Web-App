import { Injectable } from '@angular/core';
import { Observable, of,forkJoin} from 'rxjs';
import { LocaldataService } from './localdata.service'
import { RemotedataService } from './remotedata.service'
import {localportfolio,portfolioitem} from '../models/portfoliodata';
import { order } from '../models/portfoliodata';


interface record{
  ticker:string;
  share:number;
  cost:number;
}
@Injectable({
  providedIn: 'root'
})

export class PortfoliodataService {
  constructor(private localOP:LocaldataService,private remoteOP:RemotedataService) {
  }
  buy(name:string, amount:number,price:number):void{
    const data = this.getportfolio()
    const index = data.findIndex(item => item.ticker === name);
    
    if(index === -1) {
      const newrecord:record={ticker:name,share:amount,cost:price*amount};
      data.push(newrecord)
    } else {
      data[index].share +=amount;
      data[index].cost +=amount*price;
    }
    
    this.localOP.setlocal("portfolio",JSON.stringify(data));
    this.comb()
  }
  sell(name:string,amount:number,price:number):void{
    const data = this.getportfolio()
    const index = data.findIndex(item => item.ticker === name);
    
    if(index !== -1) {
      data[index].share-=amount;
      data[index].cost-=price*amount;
      if(data[index].share==0) {
        data.splice(index,1)
      }
    }
    this.localOP.setlocal("portfolio",JSON.stringify(data))
  }
  comb(){
    const data = this.getportfolio()
    data.sort((a,b)=>{
      return a.ticker <b.ticker?-1:1;
    })
    this.localOP.setlocal("portfolio",JSON.stringify(data))
  }
  getportfolio():record[]{
    let rawstring:string= this.localOP.getlocal("portfolio");
    if(rawstring==null) {
      this.localOP.initializelocal("portfolio");
      rawstring = this.localOP.getlocal("portfolio");
    }
    try {
      return JSON.parse(rawstring);
    } catch (e) {
      this.localOP.initializelocal("portfolio");
      return [];
    }
  }
  renderportfolio():Observable<object[]>{
    console.log("rendering portfolio")
    var data = this.getportfolio()
    console.log(data)
    var list:Observable<object>[]=[];
    for(var i=0;i!=data.length;i++)
    {
      list.push(this.remoteOP.getremote(data[i].ticker,"iex"));
      list.push(this.remoteOP.getremote(data[i].ticker,"daily"));
      
    }
    //console.log(tmp)
    var allob:Observable<object[]>=forkJoin(list);
    
    return allob;
  }
}
