import { Injectable } from '@angular/core';
import { Observable, of,forkJoin} from 'rxjs';
import { LocaldataService } from './localdata.service'
import { RemotedataService } from './remotedata.service'
import {localportfolio,portfolioitem} from '../models/portfoliodata';

@Injectable({
  providedIn: 'root'
})
export class PortfoliodataService {
  private portfoliodata:object;
  constructor(private localOP:LocaldataService,private remoteOP:RemotedataService) {
    this.localOP.setlocal("portfolio","{}");
    this.portfoliodata={};
    this.buy("AAPL",10,500);

  }
  buy(name:string,amount:number,price:number):void{
    if(this.inportfolio(name))
    {
      this.portfoliodata[name].share+=amount;
      this.portfoliodata[name].cost+=price;
    }
    else{
      this.portfoliodata[name]={};
      this.portfoliodata[name].ticker=name;
      this.portfoliodata[name].share=amount;
      this.portfoliodata[name].cost=price;
    }
    this.localOP.setlocal("portfolio",JSON.stringify(this.portfoliodata));
  }
  sell(name:string,amount:number,price:number):void{
    this.portfoliodata[name].share-=amount;
    this.portfoliodata[name].cost-=price;
    if(this.portfoliodata[name].share==0)
    {
      delete this.portfoliodata[name];
    }
    this.localOP.setlocal("portfolio",JSON.stringify(this.portfoliodata))
  }
  inportfolio(name:string):boolean{
    return this.portfoliodata.hasOwnProperty(name);
  }
  getportfolio():void{
    var rawstring:string= this.localOP.getlocal("portfolio");
    if(rawstring==null)
    {
      this.localOP.initializelocal("portfolio");
      rawstring = this.localOP.getlocal("portfolio");
    }
    this.portfoliodata=JSON.parse(rawstring);
  }
  renderportfolio():portfolioitem[]{
    var portfolioitems:portfolioitem[]=[];
    var tmp={};
    var list:Observable<object>[]=[];
    for(var i=0;i!=Object.keys(this.portfoliodata).length;i++)
    {
      tmp[Object.keys(this.portfoliodata)[i]]={
        ticker:Object.keys(this.portfoliodata)[i],
        name:"",
        Quantity:this.portfoliodata[Object.keys(this.portfoliodata)[i]].share,
        averagecost:this.portfoliodata[Object.keys(this.portfoliodata)[i]].cost/this.portfoliodata[Object.keys(this.portfoliodata)[i]].share,
        totalcost:this.portfoliodata[Object.keys(this.portfoliodata)[i]].cost,
        change:0,
        currentprice:0,
        marketvalue:0,
      }
      list.push(this.remoteOP.getremote(Object.keys(this.portfoliodata)[i],"iex"));
      list.push(this.remoteOP.getremote(Object.keys(this.portfoliodata)[i],"daily"));
      
    }
    //console.log(tmp)
    var allob:Observable<object[]>=forkJoin(list);
    allob.subscribe(res=>{
      var parsedstring;
      for(var i=0;i!=res.length;i++)
      {
        parsedstring = res[i];
        //console.log(parsedstring)
        if(parsedstring.hasOwnProperty("name"))
        {
          tmp[parsedstring["ticker"]].name=parsedstring["name"];
        }
        else
        {

          tmp[parsedstring[0]["ticker"]].currentprice=parsedstring[0]["last"];
          tmp[parsedstring[0]["ticker"]].change=parsedstring[0]["last"]-tmp[parsedstring[0]["ticker"]].averagecost;
          tmp[parsedstring[0]["ticker"]].marketvalue=tmp[parsedstring[0]["ticker"]].currentprice*tmp[parsedstring[0]["ticker"]].Quantity;
          //console.log(tmp[parsedstring[0]["ticker"]].share)
        }
        
        
      }
      for(var i=0;i!=Object.keys(this.portfoliodata).length;i++)
      {
        //console.log(Object.keys(this.portfoliodata))
        portfolioitems.push(tmp[Object.keys(this.portfoliodata)[i]]);
      }
      //console.log(portfolioitems)
      return portfolioitems;
    })
    return portfolioitems;
  }
}
