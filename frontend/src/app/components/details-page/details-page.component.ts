import { Component, OnInit } from '@angular/core';
import {detaildesc,detailclose,detailopen} from '../../models/remotedata';
import {DetaildataService} from '../../services/detaildata.service';
import {WatchlistdataService} from '../../services/watchlistdata.service';
import {PortfoliodataService} from '../../services/portfoliodata.service';
import * as Highcharts from 'highcharts/highstock'

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css']
})
export class DetailsPageComponent implements OnInit {
  ticker:string="NVDA";
  updatechart:boolean=false;
  stockChart:string="stockChart";
  date:string="2020-02-02";
  marketopen:boolean;
  dailydata:number[][]=[];
  detaildesc:detaildesc={};
  detailclose:detailclose={};
  detailopen:detailopen={};

  constructor(private detaildata:DetaildataService,private portfoliodata:PortfoliodataService,private watchlistdata:WatchlistdataService) { }

  ngOnInit(): void {
    //console.log(this.detaildata.renderdailycharts("AAPL"))
    //this.dailydata=this.detaildata.renderdailycharts("AAPL")
    this.getdetail()
    this.renderdacdata(-1);
    //console.log(this.dailydata)
    
  }
  iswatchlist(){
    this.watchlistdata.inwatchlist(this.ticker)
  }
  addwatchlist(){
    this.watchlistdata.addwatchlist(this.ticker)
  }
  deletewatchlist(){
    this.watchlistdata.deletewatchlist(this.ticker)
  }
  buy(){

  }
  openbuy(){
    
  }
  getdetail(){
    this.detaildata.rendersummary(this.ticker).subscribe(res=>{
      console.log("daily info")
      console.log(res[0])
      console.log(res[1])
      this.detaildesc.ticker= res[0]["ticker"]
      this.detaildesc.exchangecode=res[0]["exchangeCode"];
      this.detaildesc.description = res[0]["description"];
      this.detaildesc.startdate = res[0]["startDate"];
      this.detaildesc.name = res[0]["name"];
      this.detailclose.last = res[1][0]["last"];
      this.detailclose.high = res[1][0]["high"];
      this.detailclose.low = res[1][0]["low"];
      this.detailclose.open = res[1][0]["open"];
      this.detailclose.prevclose = res[1][0]["prevClose"];
      this.detailclose.volume = res[1][0]["volume"];
      this.detailclose.change = res[1][0]["last"]-res[1][0]["prevClose"];
      this.detailclose.changepercent = (res[1][0]["last"]-res[1][0]["prevClose"])/res[1][0]["prevClose"];
      this.detailopen.askprice = res[1][0]["askPrice"];
      this.detailopen.asksize = res[1][0]["askSize"];
      this.detailopen.bidprice = res[1][0]["bidPrice"];
      this.detailopen.bidsize = res[1][0]["bidSize"];
      this.detailopen.mid = res[1][0]["mid"];
      this.detailclose.lasttimestamp=res[1][0]["timestamp"];
      var date= new Date();
      if((Date.now()-Date.parse(this.detailclose.lasttimestamp))>60000)
      {
        this.marketopen = false;
      }
      else
      {
        this.marketopen = true;
      }
    })
  }
  renderdacdata(offset:number=0){
    this.detaildata.renderdailycharts(this.ticker,offset).subscribe(res=>{
      //console.log(res)
      if(res==[])
      {
        this.renderdacdata(offset-1)
      }
      else
      {
        //console.log(typeof(res))
        //console.log(Object.values(res))
        this.dailydata=Object.values(res)
        this.chartOptions.series[0].data=Object.values(res)
        this.chartOptions.title.text=this.ticker;
        this.chartOptions.series[0].name=this.ticker;
        this.updatechart=true;
        //console.log(this.dailydata)
      }
    })
  }
  chartCallback: Highcharts.ChartCallbackFunction = function (chart): void {
    setTimeout(() => {
     chart.reflow();
    },0);
  };
  highcharts = Highcharts;
   chartOptions = { 
      charts:{
        zoomType:"",
        reflow:"true"
      }
      ,
      rangeSelector: {
        inputEnabled: false,
        buttonTheme: {
            visibility: 'hidden'
        },
        labelStyle: {
            visibility: 'hidden'
        }
    },

      title: {
          text: `${this.detaildesc.ticker}`
      },
      
      series: [{
        fillOpacity: 0.05,
        color: 'red',
          name: `${this.detaildesc.ticker}`,
          data: this.dailydata,
          
      }],
      responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                chart: {
                    height: 500
                },
                subtitle: {
                    text: null
                },
                navigator: {
                    enabled: false
                }
            }
        }]
    }

      }
      
}
