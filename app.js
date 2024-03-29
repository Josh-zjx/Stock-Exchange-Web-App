var express = require("express");
var https = require("https");
var cors = require("cors");
var fs = require('fs');
var url = require('url');
const news_token = '7f20794f88a54122a84190892f8641e4'
const stock_token = 'b121787d28d3e2a8ce8f38860d189dd20b9477b4'
var app = express();
app.use(express.static(process.cwd()+"/frontend/dist/frontend/"));
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
                if(body=='{"detail":"Not found."}')
                {
                    res.send("error")
                }
                else
                {
                    console.log(body);
                res.send(body);
                }
                
            }); 
        });
    }
    else if(type=="dac"){
        var offset = Number(req.query.offset);
        console.log(offset)
        var date = new Date();
        console.log(date)
        date.setDate(date.getDate()+offset);
        var start_date = "";
        start_date +=(date.getFullYear()).toString();
        start_date +="-";
        start_date +=(date.getMonth()+1).toString();
        start_date +="-";
        start_date +=date.getDate().toString();
        console.log(start_date)
        options.path = `/iex/${ticker}/prices?startDate=${start_date}&resampleFreq=4min&token=${stock_token}`;
        https.get(options,(response)=>{
            var body = '';
            response.on('data', function(data) {
                body += data;
            });
            response.on('end',()=>{
                if(body=='{"detail":"Not found."}')
                {   
                    console.log("wrong ticker")
                    res.send("error")}
                else
                {
                    console.log(body)
                    rawdata=JSON.parse(body);
                    console.log(rawdata.length)
                newdata=[]
                if(rawdata.length==0)
                {
                    console.log("No daily data")
                    res.send(JSON.stringify([]))
                }
                else
                {
                    
                for(var i=0;i!=rawdata.length;i++)
                {
                    //console.log(JSON.parse(rawdata[i]))
                    newdata.push([Date.parse(rawdata[i]["date"])-3600000*8,rawdata[i]["close"]])
                }
                console.log(body);
                res.send(JSON.stringify(newdata));
                }
                console.log(body)
                }
                //console.log(body)
                
                //console.log(typeof(rawdata[0]["date"]))
                
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
                if(body=='{"detail":"Not found."}')
                {
                    res.send("error")
                }
                else
                {
                    rawdata=JSON.parse(body);
                newdata=[]
                console.log(typeof(rawdata[0]["date"]))
                //res.send(body)
                for(var i=0;i!=rawdata.length;i++)
                {
                    //console.log(JSON.parse(rawdata[i]))
                    newdata.push([Date.parse(rawdata[i]["date"]),rawdata[i]["open"],rawdata[i]["high"],rawdata[i]["low"],rawdata[i]["close"],rawdata[i]["volume"]])
                }
                console.log(body);
                res.send(JSON.stringify(newdata));
                //res.send(body);
                }
                
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
               
                    status = JSON.parse(body)["status"]
                    if(status=="error")
                    {
                        res.send("error")
                    }else{
                    //console.log(body);
                rawnews = JSON.parse(body)["articles"];
                newnews = []
                for(var i=0;i!=rawnews.length;i++)
                {
                    newnews.push({"url":rawnews[i]["url"],"title":rawnews[i]["title"],"description":rawnews[i]["description"],"source":rawnews[i]["source"]["name"],"urlToImage":rawnews[i]["urlToImage"],"publishedAt":rawnews[i]["publishedAt"]})
                }
                res.send(JSON.stringify(newnews));
                console.log(rawnews.length)
                }
                
            }); 
        });
    }
    else if(type=="ac")
    {
        options.path = `/tiingo/utilities/search?query=${ticker}&token=${stock_token}`;
            
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
    else{
        res.send("Unrecognized Token");
        return 0;
    }
})
app.get('/',(req,res)=>{
    fs.readFile("./frontend/dist/frontend/index.html",(err,data)=>{
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
