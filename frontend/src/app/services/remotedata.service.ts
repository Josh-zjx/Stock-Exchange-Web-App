import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RemotedataService {

  private apihost:string="http://localhost:8080/query";
  constructor(private http:HttpClient) { }

  getremote(ticker:string,type:string):Observable<object>{
    var path:string = "?type="+type+"&name="+ticker;
    var finalpath:string = this.apihost+path;
    return this.http.get<object>(finalpath);
  };
  

}
