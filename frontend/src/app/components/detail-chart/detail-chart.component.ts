import { Component, OnInit,Input } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import IndicatorsCore from 'highcharts/indicators/indicators';
import HC_stock from 'highcharts/modules/stock';
import {DetaildataService} from '../../services/detaildata.service';
import more from 'highcharts/highcharts-more';
import vbp from 'highcharts/indicators/volume-by-price'

IndicatorsCore(Highcharts);
more(Highcharts)
vbp(Highcharts)
HC_stock(Highcharts);

@Component({
  selector: 'app-detail-chart',
  templateUrl: './detail-chart.component.html',
  styleUrls: ['./detail-chart.component.css']
})
export class DetailChartComponent implements OnInit {
@Input() ticker:string;
  constructor(private dataservice:DetaildataService) { }
  histdata=[];
  ohlcdata = []
  stockChart="stockChart"
  volumedata = []
  updatechart:boolean=false;
  ohlc:number[][]=[[0,0,0,0,0]];
  volume:number[][]=[[0,0]]
  ngOnInit(): void {
      
    
    this.rendercharts()
  }
  rendercharts(){
    this.dataservice.rendercharts(this.ticker).subscribe(res=>{
      console.log(res)
      
      for(var i=0;i!=res.length;i++)
      {
          this.ohlcdata.push([res[i][0],res[i][1],res[i][2],res[i][3],res[i][4]])
          this.volumedata.push([res[i][0],res[i][5]])
      }
      this.chartOptions.series[0].data=this.ohlcdata;
      this.chartOptions.series[1].data=this.volumedata;
      this.chartOptions.title.text=`${this.ticker} Historical`
      this.chartOptions.series[0].name=this.ticker
      this.updatechart=true;

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
    charts:{
        zoomType:"x",
        reflow:"true"
      },
    rangeSelector: {
      selected: 5
  },

  title: {
      text: `${this.ticker} Historical`
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
  xAxis: {
      type: "datetime",
      labels: {
        formatter: function() {
          return Highcharts.dateFormat('%b/%e/%Y', this.value);
        }
      }
    },
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
