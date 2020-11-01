import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { WatchListPageComponent } from './components/watch-list-page/watch-list-page.component';
import { PortfolioPageComponent } from './components/portfolio-page/portfolio-page.component';
import { DetailsPageComponent } from './components/details-page/details-page.component';

const routes: Routes = [
  {path: '',component:SearchPageComponent},
  {path: 'portfolio',component:PortfolioPageComponent},
  {path: 'watchlist',component:WatchListPageComponent},
  {path: 'details/*',component:DetailsPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
