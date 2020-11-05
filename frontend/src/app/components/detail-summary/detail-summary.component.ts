import { Component, OnInit,Input} from '@angular/core';
import {detailclose,detailopen,detaildesc} from '../../models/remotedata'
import * as Highcharts from 'highcharts/highstock'
@Component({
  selector: 'app-detail-summary',
  templateUrl: './detail-summary.component.html',
  styleUrls: ['./detail-summary.component.css']
})
export class DetailSummaryComponent implements OnInit {
   stockChart:string="stockChart"
  @Input() detailclose:detailclose;
  @Input() detailopen:detailopen;
  @Input() detaildesc:detaildesc;
  @Input() updatechart:boolean=false;
  @Input() dailydata:number[][]=[];
  @Input() marketopen:boolean=false;
  constructor() { }

  ngOnInit(): void {
   console.log(this.dailydata)
  }
  
  highcharts = Highcharts;
   chartOptions = { 


      rangeSelector: {
          selected: 1
      },

      title: {
          text: 'AAPL Stock Price'
      },

      series: [{
          name: 'AAPL',
          data: this.dailydata,
          tooltip: {
              valueDecimals: 2
          }
      }]
}
}
