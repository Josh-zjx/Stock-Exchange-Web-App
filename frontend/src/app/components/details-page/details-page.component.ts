import { Component, OnInit } from '@angular/core';
import {detaildesc,detailclose,detailopen} from '../../models/remotedata';
import {DetaildataService} from '../../services/detaildata.service';
import {WatchlistdataService} from '../../services/watchlistdata.service';
import {PortfoliodataService} from '../../services/portfoliodata.service';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css']
})
export class DetailsPageComponent implements OnInit {
  ticker:string="NVDA";
  name:string="NVIDIA";
  price:number=123;
  change:number=1;
  exchange:string="NASDAQ";
  date:string="2020-02-02";
  isopen:boolean;
  dailydata: number[][];
  detaildesc:detaildesc={ticker:"NVDA",name:"NVIDIA",exchangecode:"NASDAQ",description:"Good Company",startdate:"lastweek"};
  detailclose:detailclose={last:15,
    change:2,
    changepercent:0.3,
    lasttimestamp:"2020-02-02",
    high:15,
    low:13,
    open:14,
    prevclose:14,
    volume:255};
  detailopen:detailopen={
    mid:0,
    askprice:1,
    asksize:2,
    bidprice:3,
    bidsize:4
  };

  constructor(private detaildata:DetaildataService,private portfoliodata:PortfoliodataService,private watchlistdata:WatchlistdataService) { }

  ngOnInit(): void {
    this.dailydata=this.detaildata.renderdailycharts("AAPL")
  }
  iswatchlist(){}
  addwatchlist(){}
  deletewatchlist(){}
  buy(){}
  openbuy(){}
  getdetail(){}
  
}
