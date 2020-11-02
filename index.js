var date = new Date();
console.log(date.getDate())
console.log(date.getMonth()-2)
console.log(date.getFullYear())
var start_date = "";
        start_date +=(date.getFullYear()-2).toString();
        start_date +="-";
        start_date +=(date.getMonth()+1).toString();
        start_date +="-";
        start_date +=date.getDate().toString();
        console.log(start_date)