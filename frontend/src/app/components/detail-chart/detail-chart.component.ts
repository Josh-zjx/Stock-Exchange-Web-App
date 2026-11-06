import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import IndicatorsCore from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Candle } from '../../models/stock';
import { StockApiService } from '../../services/stock-api.service';

IndicatorsCore(Highcharts);
vbp(Highcharts);

const historyChartOptions = () => ({
  rangeSelector: {
    selected: 5
  },
  title: {
    text: ' Historical'
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
    type: 'datetime',
    labels: {
      formatter(this: Highcharts.AxisLabelsFormatterContextObject<number>): string {
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
        units: [['week', [1]], ['month', [1, 2, 3, 4, 6]]]
      }
    }
  },
  series: [{
    type: 'candlestick',
    name: 'AAPL',
    id: 'aapl',
    zIndex: 2,
    data: [[0, 0, 0, 0, 0]]
  }, {
    type: 'column',
    name: 'Volume',
    id: 'volume',
    data: [[0, 0]],
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
});

@Component({
  selector: 'app-detail-chart',
  templateUrl: './detail-chart.component.html',
  styleUrls: ['./detail-chart.component.css']
})
export class DetailChartComponent implements OnInit {
  @Input() ticker = '';
  highcharts = Highcharts;
  stockChart = 'stockChart';
  chartOptions = historyChartOptions();
  updatechart = false;

  constructor(private api: StockApiService) { }

  chartCallback: Highcharts.ChartCallbackFunction = chart => {
    setTimeout(() => chart.reflow(), 0);
  }

  ngOnInit(): void {
    this.api.history(this.ticker).pipe(catchError(() => of([]))).subscribe((candles: Candle[]) => {
      const [ohlc, volume] = this.chartOptions.series;
      ohlc.data = candles.map(([time, open, high, low, close]) => [time, open, high, low, close]);
      ohlc.name = this.ticker;
      volume.data = candles.map(([time, , , , , traded]) => [time, traded]);
      this.chartOptions.title.text = `${this.ticker} Historical`;
      this.updatechart = true;
    });
  }
}
