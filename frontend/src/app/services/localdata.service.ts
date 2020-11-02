import { Injectable } from '@angular/core';
import { localwatchlist } from '../models/localdata';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocaldataService {

  constructor() { }
  getwatchlist():Observable<localwatchlist[]>{
    var data:localwatchlist[];
    data =JSON.parse(localStorage.getItem("watchlist"));
    return of(data)
  }
}
