import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl} from '@angular/forms';
import {RemotedataService} from '../../services/remotedata.service'
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
interface acitem{
  name:string;
  ticker:string;
}
@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {
  options:acitem[]
  ticker:string=""
  isloading:boolean=false;
  constructor(private router:Router,private remoteOP:RemotedataService) { }
  myControl = new FormControl()
  ngOnInit(): void {
    this.myControl.valueChanges.pipe(debounceTime(300)).subscribe(
      ()=>{
        this.isloading=true;
        this.getnewac(this.ticker)
      }
    )
  }
  navi(){
    if(this.ticker!="")
    {
      this.router.navigateByUrl(`/details/${this.ticker}`);
    }
    
  }
  getnewac(ticker:string)
  {
    if(ticker!="")
    {
      this.remoteOP.getremote(ticker,"ac").subscribe(res=>{
        if(Object.keys(res).length==0)
        {
          this.isloading=false;
          this.options=[]
        }
        else
        {
          this.options = Object.keys(res).map(key => ({
            name: res[key]["name"],
            ticker: res[key]["ticker"]
          }));
        }
        this.isloading=false;
      })
    }
    else
    {
      this.isloading=false;
      this.options=[]
    }
  }
}
