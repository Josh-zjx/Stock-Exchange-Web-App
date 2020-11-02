import { Injectable } from '@angular/core';
import { localwatchlist } from '../models/localdata';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocaldataService {

  constructor() {
  }
  getwatchlist():Observable<localwatchlist[]>{
    var data:localwatchlist[];
    data =JSON.parse(localStorage.getItem("watchlist"));
    return of(data)
  }
  getlocal(name:string):string{
    return localStorage.getItem(name);
  }
  setlocal(name:string,item:string):void{
    localStorage.setItem(name,item);
  }
  initializelocal(name:string):void{
    localStorage.setItem(name,"[]");
  }
}
