import { Component, OnInit } from '@angular/core';
import {portfolioitem} from '../../models/portfoliodata';
import {PortfoliodataService} from '../../services/portfoliodata.service';
import {order} from '../../models/portfoliodata'
@Component({
  selector: 'app-portfolio-page',
  templateUrl: './portfolio-page.component.html',
  styleUrls: ['./portfolio-page.component.css']
})
export class PortfolioPageComponent implements OnInit {
   Portfolio:portfolioitem[]=[
    {
      ticker:"AA",
      name: "Aaa",
      Quantity:10,
      averagecost:20,
      totalcost:200,
      change:10,
      currentprice:10,
      marketvalue:100
    }
    ,
    {
      ticker:"BB",
      name: "Bbb",
      Quantity:10,
      averagecost:30,
      totalcost:300,
      change:40,
      currentprice:60,
      marketvalue:600
    }
  ]
  constructor(private dataservice:PortfoliodataService) { }
  isloading:boolean=true;
  ngOnInit(): void {
    this.isloading=true;
    this.getportfolio();
  }
  buy(neworder:order){
    this.dataservice.buy(neworder.name,neworder.amount,neworder.price);
    this.getportfolio();
  }
  sell(neworder:order){
    this.dataservice.sell(neworder.name,neworder.amount,neworder.price);
    this.getportfolio();
  }
  getportfolio(){
    this.isloading=true;
    if(Object.keys(this.dataservice.portfoliodata).length==0)
      {
        this.Portfolio=[]
        this.isloading=false;
        return
      }
    this.dataservice.renderportfolio().subscribe(res=>{
      var parsedstring;
      var portfolioitems:portfolioitem[]=[];
      var tmp={};
      this.Portfolio=[]
      
      console.log(this.Portfolio.length)
      for(var i=0;i!=Object.keys(this.dataservice.portfoliodata).length;i++)
    {
      tmp[Object.keys(this.dataservice.portfoliodata)[i]]={
        ticker:Object.keys(this.dataservice.portfoliodata)[i],
        name:"",
        Quantity:this.dataservice.portfoliodata[Object.keys(this.dataservice.portfoliodata)[i]].share,
        averagecost:this.dataservice.portfoliodata[Object.keys(this.dataservice.portfoliodata)[i]].cost/this.dataservice.portfoliodata[Object.keys(this.dataservice.portfoliodata)[i]].share,
        totalcost:this.dataservice.portfoliodata[Object.keys(this.dataservice.portfoliodata)[i]].cost,
        change:0,
        currentprice:0,
        marketvalue:0,
      }
      //list.push(this.remoteOP.getremote(Object.keys(this.portfoliodata)[i],"iex"));
      //list.push(this.remoteOP.getremote(Object.keys(this.portfoliodata)[i],"daily"));
      
    }
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
      for(var i=0;i!=Object.keys(this.dataservice.portfoliodata).length;i++)
      {
        //console.log(Object.keys(this.portfoliodata))
        portfolioitems.push(tmp[Object.keys(this.dataservice.portfoliodata)[i]]);
      }
      //console.log(portfolioitems)
      this.Portfolio=portfolioitems;
      this.isloading=false;
    })
    //console.log(this.Portfolio)
  }


}
