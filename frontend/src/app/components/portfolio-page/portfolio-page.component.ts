import { Component, OnInit } from '@angular/core';
import {portfolioitem} from '../../models/portfoliodata';
import {PortfoliodataService} from '../../services/portfoliodata.service';
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

  ngOnInit(): void {
  }
  buy(){}
  sell(){}


}
