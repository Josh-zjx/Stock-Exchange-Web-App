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

  }
  buy(name:string,amount:number,price:number):void{
    if(this.inportfolio(name))
    {
      this.portfoliodata[name].share+=amount;
      this.portfoliodata[name].cost+=price;
    }
    else{
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
  renderportfolio(){

  }
}
