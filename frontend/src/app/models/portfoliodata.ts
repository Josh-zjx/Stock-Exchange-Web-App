export interface portfolioitem {
    ticker:string;
    name: string;
    Quantity:number;
    averagecost:number;
    totalcost:number;
    change:number;
    currentprice:number;
    marketshare:number;
  }
  export interface localportfolio {
    ticker:string;
    cost:number;
    share:number;
}