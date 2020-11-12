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
    //console.log(`buying ${name} in ${amount} for ${price} each`)
    var data = this.getportfolio()
    var index=-1;
    for(var i=0;i!=data.length;i++)
    {
      if(data[i].ticker==name)
      {
        index = i;
        break;
      }
    }
    if(index==-1)
    {
      var newrecord:record={ticker:name,share:amount,cost:price*amount};
      data.push(newrecord)
    }
    else
    {
      data[i].share +=amount;
      data[i].cost +=amount*price;
    }
    
    this.localOP.setlocal("portfolio",JSON.stringify(data));
    this.comb()
    //this.getportfolio()
  }
  sell(name:string,amount:number,price:number):void{
    var data = this.getportfolio()
    var index=-1;
    for(var i=0;i!=data.length;i++)
    {
      if(data[i].ticker==name)
      {
        index = i;
        break;
      }
    }
    data[i].share-=amount;
    data[i].cost-=price*amount;
    if(data[i].share==0)
    {
      data.splice(i,1)
    }
    //console.log(this.portfoliodata)
    this.localOP.setlocal("portfolio",JSON.stringify(data))
    //this.getportfolio()
  }
  comb(){
    var data = this.getportfolio()
    data.sort((a,b)=>{
      return a.ticker <b.ticker?-1:1;
    })
    console.log(data)
    this.localOP.setlocal("portfolio",JSON.stringify(data))
  }
  getportfolio():record[]{
    var rawstring:string= this.localOP.getlocal("portfolio");
    if(rawstring==null)
    {
      this.localOP.initializelocal("portfolio");
      rawstring = this.localOP.getlocal("portfolio");
      
    }
    console.log(rawstring)

    return JSON.parse(rawstring);
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
