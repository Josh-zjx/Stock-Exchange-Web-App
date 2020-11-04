import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { WatchListPageComponent } from './components/watch-list-page/watch-list-page.component';
import { PortfolioPageComponent } from './components/portfolio-page/portfolio-page.component';
import { DetailsPageComponent } from './components/details-page/details-page.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WatchlistdataService } from './services/watchlistdata.service';
import { PortfoliodataService } from './services/portfoliodata.service';
import { DetaildataService } from './services/detaildata.service';
import { RemotedataService } from './services/remotedata.service';
import { LocaldataService } from './services/localdata.service';
import { WatchListItemComponent} from './components/watch-list-item/watch-list-item.component'
import { HttpClientModule } from '@angular/common/http';
import { PortfolioPageItemComponent } from './components/portfolio-page-item/portfolio-page-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BuymodalComponent } from './components/buymodal/buymodal.component';
import { SellmodalComponent } from './components/sellmodal/sellmodal.component';
import { DetailSummaryComponent } from './components/detail-summary/detail-summary.component';
import { DetailNewsComponent } from './components/detail-news/detail-news.component';
import { DetailChartComponent } from './components/detail-chart/detail-chart.component';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SearchPageComponent,
    WatchListPageComponent,
    PortfolioPageComponent,
    DetailsPageComponent,
    WatchListItemComponent,
    PortfolioPageItemComponent,
    BuymodalComponent,
    SellmodalComponent,
    DetailSummaryComponent,
    DetailNewsComponent,
    DetailChartComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTabsModule
  ],
  providers: [
    WatchlistdataService,
    PortfoliodataService,
    DetaildataService,
    RemotedataService,
    LocaldataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
