import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css']
})
export class DetailsPageComponent implements OnInit {
  ticker:string="NVDA";
  name:string="NVIDIA";
  price:number=123;
  change:number=1;
  exchange:string="NASDAQ";
  date:string="2020-02-02";


  constructor() { }

  ngOnInit(): void {
  }

}
