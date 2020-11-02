import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocaldataService } from './localdata.service'
import { RemotedataService } from './remotedata.service'
import { localwatchlist } from '../models/localdata';

@Injectable({
  providedIn: 'root'
})
export class WatchlistdataService {

  constructor(private localOP:LocaldataService,private remoteOP:RemotedataService) {}

  setwatchlist(){};
  getwatchlist(){};

}
