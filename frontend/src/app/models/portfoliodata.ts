export interface portfolioitem {
    ticker:string;
    name: string;
    Quantity:number;
    averagecost:number;
    totalcost:number;
    change:number;
    currentprice:number;
    marketvalue:number;
  }
  export interface localportfolio {
    ticker:string;
    cost:number;
    share:number;
}
export interface order{
  name:string;
  amount:number;
  price:number;
}