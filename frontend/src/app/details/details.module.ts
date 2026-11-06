import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { HighchartsChartModule } from 'highcharts-angular';
import { DetailChartComponent } from '../components/detail-chart/detail-chart.component';
import { DetailNewsComponent } from '../components/detail-news/detail-news.component';
import { DetailsPageComponent } from '../components/details-page/details-page.component';
import { NewsItemComponent } from '../components/news-item/news-item.component';
import { NewsmodalComponent } from '../components/newsmodal/newsmodal.component';

/** The stock details page, loaded on demand since it alone needs Highcharts. */
@NgModule({
  declarations: [
    DetailsPageComponent,
    DetailNewsComponent,
    DetailChartComponent,
    NewsItemComponent,
    NewsmodalComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    HighchartsChartModule,
    RouterModule.forChild([{ path: ':ticker', component: DetailsPageComponent }])
  ]
})
export class DetailsModule { }
