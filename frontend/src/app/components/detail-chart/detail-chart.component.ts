import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import {DetaildataService} from '../../services/detaildata.service';

@Component({
  selector: 'app-detail-chart',
  templateUrl: './detail-chart.component.html',
  styleUrls: ['./detail-chart.component.css']
})
export class DetailChartComponent implements OnInit {
ticker:string="AAPL"
  constructor(private dataservice:DetaildataService) { }
  histdata=[];
  ohlc:number[][]=[];
  volume:number[][]=[]
  ngOnInit(): void {
    this.rendercharts()
  }
  rendercharts(){
    this.dataservice.rendercharts(this.ticker).subscribe(res=>{
      console.log(res)
    })
  }
  groupingUnits = [[
    'week',                         // unit name
    [1]                             // allowed multiples
], [
    'month',
    [1, 2, 3, 4, 6]
]];

  chartCallback: Highcharts.ChartCallbackFunction = function (chart): void {
    setTimeout(() => {
     chart.reflow();
    },0);
  };
  highcharts = Highcharts;
   chartOptions = { 
    rangeSelector: {
      selected: 2
  },

  title: {
      text: 'AAPL Historical'
  },

  subtitle: {
      text: 'With SMA and Volume by Price technical indicators'
  },

  yAxis: [{
      startOnTick: false,
      endOnTick: false,
      labels: {
          align: 'right',
          x: -3
      },
      title: {
          text: 'OHLC'
      },
      height: '60%',
      lineWidth: 2,
      resize: {
          enabled: true
      }
  }, {
      labels: {
          align: 'right',
          x: -3
      },
      title: {
          text: 'Volume'
      },
      top: '65%',
      height: '35%',
      offset: 0,
      lineWidth: 2
  }],

  tooltip: {
      split: true
  },

  plotOptions: {
      series: {
          dataGrouping: {
              units: this.groupingUnits
          }
      }
  },

  series: [{
      type: 'candlestick',
      name: 'AAPL',
      id: 'aapl',
      zIndex: 2,
      data: this.ohlc
  }, {
      type: 'column',
      name: 'Volume',
      id: 'volume',
      data: this.volume,
      yAxis: 1
  }, {
      type: 'vbp',
      linkedTo: 'aapl',
      params: {
          volumeSeriesID: 'volume'
      },
      dataLabels: {
          enabled: false
      },
      zoneLines: {
          enabled: false
      }
  }, {
      type: 'sma',
      linkedTo: 'aapl',
      zIndex: 1,
      marker: {
          enabled: false
      }
  }]
}
      
}
