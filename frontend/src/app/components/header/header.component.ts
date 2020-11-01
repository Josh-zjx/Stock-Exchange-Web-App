import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  //namelist : string[] = ["Search","Watchlist","Portfolio"];
  constructor() { }
  //selectedSwitch:String="";
  //onSelected(name:string):void{
  //this.selectedSwitch=name;
  //}
  ngOnInit(): void {
  }

}
