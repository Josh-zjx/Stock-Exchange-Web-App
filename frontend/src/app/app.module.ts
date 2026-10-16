import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BuymodalComponent } from './components/buymodal/buymodal.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { PortfolioPageItemComponent } from './components/portfolio-page-item/portfolio-page-item.component';
import { PortfolioPageComponent } from './components/portfolio-page/portfolio-page.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { SellmodalComponent } from './components/sellmodal/sellmodal.component';
import { WatchListItemComponent } from './components/watch-list-item/watch-list-item.component';
import { WatchListPageComponent } from './components/watch-list-page/watch-list-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SearchPageComponent,
    WatchListPageComponent,
    WatchListItemComponent,
    PortfolioPageComponent,
    PortfolioPageItemComponent,
    BuymodalComponent,
    SellmodalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
