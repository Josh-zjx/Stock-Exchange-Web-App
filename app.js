var express = require("express");
var https = require("https");
var cors = require("cors");
var fs = require('fs');
var url = require('url');
const news_token = '7f20794f88a54122a84190892f8641e4'
const stock_token = 'b121787d28d3e2a8ce8f38860d189dd20b9477b4'
var app = express();
app.use('/public',express.static('public'));
app.use(cors());
const port = 8080;


app.get('/query',(req,res)=>{
    var type = req.query.type;
    var ticker = req.query.name;
    console.log(`Received query on ${ticker}`);
    var options = {host:"api.tiingo.com"}
    if(type=="daily"){
        options.path = `/tiingo/daily/${ticker}?token=${stock_token}`;
        
        https.get(options,(response)=>{
            var body = '';
            response.on('data', function(data) {
                body += data;
            });
            response.on('end',()=>{
                console.log(body);
                res.send(body);
            });
        });
    }
    else if(type=="iex"){
        options.path = `/iex/${ticker}?token=${stock_token}`;
        https.get(options,(response)=>{
            var body = '';
            response.on('data', function(data) {
                body += data;
            });
            response.on('end',()=>{
                console.log(body);
                res.send(body);
            }); 
        });
    }
    else if(type=="dac"){
        var date = new Date();
        date.setDate(date.getDate() - 2);
        var start_date = "";
        start_date +=(date.getFullYear()).toString();
        start_date +="-";
        start_date +=(date.getMonth()+1).toString();
        start_date +="-";
        start_date +=date.getDate().toString();
        options.path = `/iex/${ticker}/prices?startDate=${start_date}&resampleFreq=5min&token=${stock_token}`;
        https.get(options,(response)=>{
            var body = '';
            response.on('data', function(data) {
                body += data;
            });
            response.on('end',()=>{
                console.log(body);
                res.send(body);
            });
        });
    }
    else if(type=="hist"){
        var date = new Date();
        var start_date = "";
        start_date +=(date.getFullYear()-2).toString();
        start_date +="-";
        start_date +=(date.getMonth()+1).toString();
        start_date +="-";
        start_date +=date.getDate().toString();

        options.path = `/tiingo/daily/${ticker}/prices?startDate=${start_date}&resampleFreq=daily&token=${stock_token}`;
        https.get(options,(response)=>{
            var body = '';
            response.on('data', function(data) {
                body += data;
            });
            response.on('end',()=>{
                console.log(body);
                res.send(body);
            });
        });
    }
    else if(type=="news"){
        options.host="newsapi.org";
        options.path=`/v2/everything?apiKey=${news_token}&q=${ticker}`;
        https.get(options,(response)=>{
            var body = '';
            response.on('data', function(data) {
                body += data;
            });
            response.on('end',()=>{
                console.log(body);
                res.send(body);
            }); 
        });
    }
    else if(type=="ac")
    {

    }
    else{
        res.send("Unrecognized Token");
        return 0;
    }

    
    
    


})
app.get('*',(req,res)=>{
    fs.readFile("search.html",(err,data)=>{
        if(err)
        {
            console.log("Search File read error");
            res.send("Cannot fetch the page");
        }else{
            res.send(data.toString());
        }
    })

})
app.listen(port,()=>{
    console.log(` Server started. Listening at port ${port}`)

})
