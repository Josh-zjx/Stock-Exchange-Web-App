import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RemotedataService {

  private apihost:string="https://mynodejsproject-135423.wl.r.appspot.com/query";
  constructor(private http:HttpClient) { }

  getremote(ticker:string,type:string):Observable<object>{
    var path:string = "?type="+type+"&name="+ticker;
    var finalpath:string = this.apihost+path;
    return this.http.get<object>(finalpath);
  };
  

}
