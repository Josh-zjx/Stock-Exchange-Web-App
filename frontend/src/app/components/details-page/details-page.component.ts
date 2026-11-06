import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Highcharts from 'highcharts/highstock';
import { concat, EMPTY, forkJoin, noop, Observable, of, Subject, timer } from 'rxjs';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Order } from '../../models/order';
import { CompanyMeta, dayChange, PricePoint, Quote } from '../../models/stock';
import { PortfoliodataService } from '../../services/portfoliodata.service';
import { StockApiService } from '../../services/stock-api.service';
import { WatchlistdataService } from '../../services/watchlistdata.service';
import { BuymodalComponent } from '../buymodal/buymodal.component';

const REFRESH_INTERVAL = 15000;
// A quote older than this means trading has stopped
const MARKET_CLOSED_AFTER = 60000;
const ALERT_DURATION = 5000;

interface DetailDesc {
  ticker: string;
  name: string;
  exchangecode: string;
  description: string;
  startdate: string;
}

interface DetailClose {
  last: number;
  change: number;
  changepercent: number;
  lasttimestamp: string;
  high: number;
  low: number;
  open: number;
  prevclose: number;
  volume: number;
}

interface DetailOpen {
  mid: number;
  askprice: number;
  asksize: number;
  bidprice: number;
  bidsize: number;
}

const intradayChartOptions = () => ({
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
    height: 60
  },
  title: {
    text: ''
  },
  series: [{
    fillOpacity: 0.05,
    color: 'red',
    name: '',
    data: [] as PricePoint[]
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
});

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css']
})
export class DetailsPageComponent implements OnInit, OnDestroy {
  ticker = '';
  isloading = true;
  isvalid = true;
  showadd = false;
  showdel = false;
  showbuy = false;
  inwatchlist = false;
  marketopen = false;
  now: Date;
  closedtime: Date;
  detaildesc: DetailDesc = { ticker: '', name: '', exchangecode: '', description: '', startdate: '' };
  detailclose: DetailClose = { last: 0, change: 0, changepercent: 0, lasttimestamp: '', open: 0, high: 0, low: 0, prevclose: 0, volume: 0 };
  detailopen: DetailOpen = { mid: 0, askprice: 0, asksize: 0, bidprice: 0, bidsize: 0 };

  highcharts = Highcharts;
  stockChart = 'stockChart';
  chartOptions = intradayChartOptions();
  updatechart = false;

  private readonly prices = new Subject<number>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private api: StockApiService,
    private portfolio: PortfoliodataService,
    private watchlist: WatchlistdataService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('ticker')),
      switchMap(ticker => this.track(ticker)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  chartCallback: Highcharts.ChartCallbackFunction = chart => {
    setTimeout(() => chart.reflow(), 0);
  }

  addwatchlist(): void {
    this.watchlist.add(this.ticker);
    this.inwatchlist = true;
    this.showdel = false;
    this.showadd = true;
    setTimeout(() => this.showadd = false, ALERT_DURATION);
  }

  deletewatchlist(): void {
    this.watchlist.remove(this.ticker);
    this.inwatchlist = false;
    this.showdel = true;
    this.showadd = false;
    setTimeout(() => this.showdel = false, ALERT_DURATION);
  }

  openbuy(): void {
    const modal = this.modalService.open(BuymodalComponent);
    Object.assign(modal.componentInstance, {
      name: this.detaildesc.ticker,
      price: this.detailclose.last,
      updateevent: this.prices
    });
    modal.result.then((order: Order) => this.buy(order), noop);
  }

  private buy(order: Order): void {
    this.portfolio.buy(order.name, order.amount, order.price);
    this.showbuy = true;
    setTimeout(() => this.showbuy = false, ALERT_DURATION);
  }

  /** Shows a ticker, then keeps its quote and intraday chart fresh while the market is open. */
  private track(ticker: string): Observable<PricePoint[]> {
    this.ticker = ticker;
    this.isloading = true;
    this.chartOptions = intradayChartOptions();

    const firstQuote = forkJoin([this.api.meta(ticker), this.api.quote(ticker)]).pipe(
      tap(([meta]) => this.showMeta(meta)),
      map(([, quote]) => quote)
    );
    const laterQuotes = timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(
      filter(() => this.marketopen),
      exhaustMap(() => this.api.quote(ticker).pipe(catchError(() => EMPTY)))
    );
    return concat(firstQuote, laterQuotes).pipe(
      tap(quote => this.showQuote(quote)),
      filter(quote => quote !== undefined),
      switchMap(() => this.api.intraday(ticker).pipe(catchError(() => of([])))),
      tap(points => this.showIntraday(points)),
      catchError(() => {
        this.showQuote(undefined);
        return EMPTY;
      })
    );
  }

  private showMeta(meta: CompanyMeta): void {
    this.detaildesc = {
      ticker: meta.ticker,
      name: meta.name,
      exchangecode: meta.exchangeCode,
      description: meta.description,
      startdate: meta.startDate
    };
  }

  private showQuote(quote: Quote | undefined): void {
    this.isloading = false;
    this.isvalid = quote !== undefined;
    if (!quote) {
      return;
    }
    const change = dayChange(quote);
    this.detailclose = {
      last: quote.last,
      change,
      changepercent: change / quote.prevClose,
      lasttimestamp: quote.timestamp,
      high: quote.high,
      low: quote.low,
      open: quote.open,
      prevclose: quote.prevClose,
      volume: quote.volume
    };
    this.detailopen = {
      mid: quote.mid,
      askprice: quote.askPrice,
      asksize: quote.askSize,
      bidprice: quote.bidPrice,
      bidsize: quote.bidSize
    };
    this.now = new Date();
    this.marketopen = Date.now() - Date.parse(quote.timestamp) <= MARKET_CLOSED_AFTER;
    if (!this.marketopen) {
      this.closedtime = new Date(quote.timestamp);
    }
    this.inwatchlist = this.watchlist.has(this.ticker);
    this.prices.next(quote.last);
  }

  private showIntraday(points: PricePoint[]): void {
    const [series] = this.chartOptions.series;
    series.data = points;
    if (points.length) {
      this.chartOptions.title.text = this.ticker;
      series.name = this.ticker;
      series.color = this.detailclose.change > 0 ? 'green' : 'red';
    }
    this.updatechart = true;
  }
}
