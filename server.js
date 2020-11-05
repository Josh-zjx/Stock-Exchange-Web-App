var stra="2020-11-03T21:00:00+00:00"
var date=new Date(stra);
console.log(date.toUTCString())
console.log(date.getTimezoneOffset())
var newdate = new Date(date.getTime())
