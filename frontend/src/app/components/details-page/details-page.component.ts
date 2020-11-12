import { Component, OnInit } from '@angular/core';
import {detaildesc,detailclose,detailopen} from '../../models/remotedata';
import {DetaildataService} from '../../services/detaildata.service';
import {WatchlistdataService} from '../../services/watchlistdata.service';
import {PortfoliodataService} from '../../services/portfoliodata.service';
import * as Highcharts from 'highcharts/highstock'
import { Subject } from 'rxjs'
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuymodalComponent } from '../buymodal/buymodal.component';
import {order} from '../../models/portfoliodata'
import { Router } from '@angular/router' 

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css']
})
export class DetailsPageComponent implements OnInit {
  ticker:string="NVDA";
  updatechart:boolean=false;
  isvalid:boolean=true;
  showbuy:boolean=false;
  dataupdate: Subject<number> = new Subject<number>();
  showadd:boolean=false;
  showdel:boolean=false;
  isloading:boolean=true;
  stockChart:string="stockChart";
  date:string="2020-02-02";
  inwatchlist:boolean=false;
  marketopen:boolean=false;
  dailydata:number[][]=[];
  now:Date;
  closedtime:Date;
  detaildesc:detaildesc={ticker:"",name:"",exchangecode:"",description:"",startdate:""};
  detailclose:detailclose={last:0,change:0,changepercent:0,lasttimestamp:"",open:0,high:0,low:0,prevclose:0,volume:0};
  detailopen:detailopen={mid:0,askprice:0,asksize:0,bidprice:0,bidsize:0};

  constructor(private router:Router,private modalService:NgbModal,private detaildata:DetaildataService,private portfoliodata:PortfoliodataService,private watchlistdata:WatchlistdataService) { }

  ngOnInit(): void {
    //console.log(this.detaildata.renderdailycharts("AAPL"))
    //this.dailydata=this.detaildata.renderdailycharts("AAPL")
    this.isloading=true;
    console.log(this.router.url.slice(9))
    this.ticker=this.router.url.slice(9)
    this.getdetail()
    setInterval(()=>{
      if(this.marketopen)
      {
        this.getdetail()
      }

    },15000)
    
    //console.log(this.dailydata)
    
  }
  iswatchlist():boolean{
    return this.watchlistdata.inwatchlist(this.ticker)
  }
  addwatchlist(){
    this.watchlistdata.addwatchlist(this.ticker)
    this.inwatchlist=true;
    this.showdel=false;
    this.showadd=true;
    setTimeout(()=>{
      this.showadd=false;
    },5000)
  }
  deletewatchlist(){
    this.watchlistdata.deletewatchlist(this.ticker)
    this.inwatchlist=false;
    this.showdel=true;
    this.showadd=false;
    setTimeout(()=>{
      this.showdel=false;
    },5000)
  }
  buy(neworder:order){
    this.portfoliodata.buy(neworder.name,neworder.amount,neworder.price);
    this.showbuy=true;
    this.portfoliodata.getportfolio();
    setTimeout(()=>{
      this.showbuy=false;
    },5000)
  }
  updatemodal(){
    this.dataupdate.next(this.detailclose.last)
  }
  openbuy() {
    const modalRef = this.modalService.open(BuymodalComponent);
    modalRef.componentInstance.name = this.detaildesc.ticker;
    modalRef.componentInstance.price = this.detailclose.last;
    modalRef.componentInstance.updateevent=this.dataupdate;
    modalRef.componentInstance.buyemitter.subscribe((neworder)=>{
      this.buy(neworder);
    })
  }
  getdetail(){
    this.detaildata.rendersummary(this.ticker).subscribe(res=>{
      //console.log("daily info")
      //if(res=="err")
      console.log(res)
      console.log("analyze res")
      if(Object.keys(res[1]).length==0)
      {
        this.isvalid=false;
        this.isloading=false;
        console.log("wrong")
        return
      }
      
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
      this.now = new Date()
      this.isvalid=true;
      this.updatemodal()
      this.isloading=false;
      var date= new Date();
      this.renderdacdata(0);
      if((Date.now()-Date.parse(this.detailclose.lasttimestamp))>60000)
      {
        //console.log((Date.now()-Date.parse(this.detailclose.lasttimestamp)))
        this.closedtime = new Date(this.detailclose.lasttimestamp)
        this.marketopen = false;
      }
      else
      {
        this.marketopen = true;
      }
      if(this.iswatchlist())
      {
        
        this.inwatchlist=true;
      }
      else{
        //console.log(this.watchlistdata.getwatchlist())
        this.inwatchlist=false;
      }
    })
  }
  renderdacdata(offset:number=0){
    this.detaildata.renderdailycharts(this.ticker,offset).subscribe(res=>{
      console.log(offset)
      console.log(res)
      console.log(Object.keys(res).length)
      if(Object.keys(res).length==0)
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
        this.chartOptions.series[0].color=(this.detailclose.change>0)?"green":"red";
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
    navigator: {
      height:60
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
                    height: 600
                },
                subtitle: {
                    text: null
                },
                navigator: {
                    enabled: true
                }
            }
        }]
    }

      }
      
}
