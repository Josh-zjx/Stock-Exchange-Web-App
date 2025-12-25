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

// Helper function to make HTTPS requests and reduce code duplication
function makeHttpsRequest(options, res, onSuccess) {
    https.get(options, (response) => {
        let body = '';
        response.on('data', (data) => {
            body += data;
        });
        response.on('end', () => {
            onSuccess(body);
        });
    });
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


app.get('/query',(req,res)=>{
    const type = req.query.type;
    const ticker = req.query.name;
    const options = {host:"api.tiingo.com"};
    
    if(type=="daily"){
        options.path = `/tiingo/daily/${ticker}?token=${stock_token}`;
        makeHttpsRequest(options, res, (body) => {
            res.send(body);
        });
    }
    else if(type=="iex"){
        options.path = `/iex/${ticker}?token=${stock_token}`;
        makeHttpsRequest(options, res, (body) => {
            if(body=='{"detail":"Not found."}') {
                res.send("error");
            } else {
                res.send(body);
            }
        });
    }
    else if(type=="dac"){
        const offset = Number(req.query.offset);
        const date = new Date();
        date.setDate(date.getDate()+offset);
        const start_date = formatDate(date);
        
        options.path = `/iex/${ticker}/prices?startDate=${start_date}&resampleFreq=4min&token=${stock_token}`;
        makeHttpsRequest(options, res, (body) => {
            if(body=='{"detail":"Not found."}') {
                res.send("error");
            } else {
                const rawdata = JSON.parse(body);
                if(rawdata.length==0) {
                    res.send(JSON.stringify([]));
                } else {
                    const newdata = rawdata.map(item => 
                        [Date.parse(item.date) - 3600000*8, item.close]
                    );
                    res.send(JSON.stringify(newdata));
                }
            }
        });
    }
    else if(type=="hist"){
        const date = new Date();
        const start_date = formatDate(new Date(date.getFullYear()-2, date.getMonth(), date.getDate()));

        options.path = `/tiingo/daily/${ticker}/prices?startDate=${start_date}&resampleFreq=daily&token=${stock_token}`;
        makeHttpsRequest(options, res, (body) => {
            if(body=='{"detail":"Not found."}') {
                res.send("error");
            } else {
                const rawdata = JSON.parse(body);
                const newdata = rawdata.map(item => 
                    [Date.parse(item.date), item.open, item.high, item.low, item.close, item.volume]
                );
                res.send(JSON.stringify(newdata));
            }
        });
    }
    else if(type=="news"){
        options.host="newsapi.org";
        options.path=`/v2/everything?apiKey=${news_token}&q=${ticker}`;
        makeHttpsRequest(options, res, (body) => {
            const parsedBody = JSON.parse(body);
            if(parsedBody.status === "error") {
                res.send("error");
            } else {
                const rawnews = parsedBody.articles;
                const newnews = rawnews.map(article => ({
                    url: article.url,
                    title: article.title,
                    description: article.description,
                    source: article.source.name,
                    urlToImage: article.urlToImage,
                    publishedAt: article.publishedAt
                }));
                res.send(JSON.stringify(newnews));
            }
        });
    }
    else if(type=="ac")
    {
        options.path = `/tiingo/utilities/search?query=${ticker}&token=${stock_token}`;
        makeHttpsRequest(options, res, (body) => {
            res.send(body);
        });
    }
    else{
        res.send("Unrecognized Token");
    }
})
app.get('/',(req,res)=>{
    fs.readFile("./frontend/dist/frontend/index.html",(err,data)=>{
        if(err) {
            res.send("Cannot fetch the page");
        } else {
            res.send(data.toString());
        }
    })
})

app.listen(port,()=>{
    console.log(` Server started. Listening at port ${port}`)
})
