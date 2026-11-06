import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioPageComponent } from './components/portfolio-page/portfolio-page.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { WatchListPageComponent } from './components/watch-list-page/watch-list-page.component';

const routes: Routes = [
  { path: 'portfolio', component: PortfolioPageComponent },
  { path: 'watchlist', component: WatchListPageComponent },
  { path: 'details', loadChildren: () => import('./details/details.module').then(m => m.DetailsModule) },
  { path: '', component: SearchPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
