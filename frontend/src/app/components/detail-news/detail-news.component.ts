import { Component, OnInit,Input } from '@angular/core';
import { detailnewsitem } from '../../models/remotedata';
import {  DetaildataService } from '../../services/detaildata.service'
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsmodalComponent } from '../newsmodal/newsmodal.component';

@Component({
  selector: 'app-detail-news',
  templateUrl: './detail-news.component.html',
  styleUrls: ['./detail-news.component.css']
})
export class DetailNewsComponent implements OnInit {
  @Input() ticker:string;
  newslist1:detailnewsitem[]=[];
  newslist2:detailnewsitem[]=[];
  constructor(private dataservice:DetaildataService,private modalService:NgbModal) { }

  ngOnInit(): void {
    console.log("rendering news")
    this.getnews()
  }
  opennews(inputnews:detailnewsitem)
  {
      console.log("open modal news")
      const modalRef = this.modalService.open(NewsmodalComponent);
      modalRef.componentInstance.news = inputnews;
      
  }
  getnews(){
    this.dataservice.rendernews(this.ticker).subscribe(res=>{
      console.log(res)
      for(var i=0;i!=res.length;i++)
      {
        var newnewsitem:detailnewsitem={};
        newnewsitem.description=res[i].description;
        newnewsitem.title=res[i].title;
        newnewsitem.url=res[i].url;
        newnewsitem.image=res[i].urlToImage;
        newnewsitem.source=res[i].source;
        newnewsitem.published=res[i].publishedAt;
        if(i%2==0)
        {
          this.newslist1.push(newnewsitem)
        }
        else
        {
          this.newslist2.push(newnewsitem)
        }
        
      }
    })
  }

}
