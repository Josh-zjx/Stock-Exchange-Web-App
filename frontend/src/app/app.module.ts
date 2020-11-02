import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SearchPageComponent,
    WatchListPageComponent,
    PortfolioPageComponent,
    DetailsPageComponent,
    WatchListItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule
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
