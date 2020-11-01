var express = require("express");
var http = require("http");
var fs = require('fs');
var url = require('url');

var app = express();
app.use('/public',express.static('public'));

const port = 8080;

app.get('/',(req,res)=>{
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

app.get('/watchlist',(req,res)=>{
    res.send("watch List");

})

app.get('/portfolio',(req,res)=>{
    res.send("portfolio");

})

app.get('/details/*',(req,res)=>{
    res.send("details on ");

})

app.get('/query',(req,res)=>{
    var sticker = req.query.name;
    console.log(`Received query on ${sticker}`);
    res.send(`Results on ${sticker}`);
})

app.listen(port,()=>{
    console.log(` Server started. Listening at port ${port}`)

})