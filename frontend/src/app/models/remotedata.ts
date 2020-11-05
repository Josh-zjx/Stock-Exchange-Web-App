export interface detaildesc{
    ticker:string;
    name:string;
    exchangecode:string;
    description:string;
    startdate:string;
}
export interface detailclose{
    last:number;
    change:number;
    changepercent:number;
    lasttimestamp:string;
    high:number;
    low:number;
    open:number;
    prevclose:number;
    volume:number;
}
export interface detailopen{
    mid:number;
    askprice:number;
    asksize:number;
    bidprice:number;
    bidsize:number;
}
export interface detaildailyitem{
    time:number;
    price:number;
}
export interface detailhistitem{
    date:number;
    open:number;
    high:number;
    low:number;
    close:number;
    volume:number;
}
export interface detailnewsitem{
    url:string;
    title:string;
    description:string;
    source:string;
    image:string;
    published:string;
}