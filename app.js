var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/config');
var session = require('express-session');
var fullDataSplit = require('./controllers/trackingContoller');
var addTracking = require('./controllers/vehicleController');
const net = require('net');
var http = require('http');
var Vehicle = require('./models/vehicle');
const app = express();

mongoose.connect(config.database,{useNewUrlParser:true});
var db = mongoose.connection;

app.use(bodyParser.json());
app.use(session({secret: 'mysupersecret', resave: false, saveUninitialized: false}));

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }
});
  
app.use('/', require('./controllers'));

const port = 3000;

app.get('/',function(req,res){
    res.send("Hello world");
});


//socket setup
var server = net.createServer();
var IMIE;
server.on("connection", function(socket){
    var remoteAddress = socket.remoteAddress +":"+ socket.remotePort;
    console.log("New client connection made %s ", remoteAddress);
  
    socket.on("data", function(d){
        var size= d.length.valueOf();
        if(size==17){
            console.log("IMIE : %s  ",d );
            IMIE = d.toString().substring(2,17);
            Vehicle.checkImei(IMIE,function(err,data){
                if(!err){
                    socket.write("");
                }
                else{
                    console.log({success: false, msg: err});
                }
            });
        }
        else {          
            console.log(fullDataSplit.splitData(d.toString("hex")));
            console.log(fullDataSplit.getNoOfData(d.toString("hex")));
            var noOfData =fullDataSplit.getNoOfData(d.toString("hex"));
            var buf = new Buffer(4);
            buf.writeInt32BE(noOfData);
            socket.write(buf);

            //data obj
            var dataObj = { 
                imeiNumber:IMIE,
                data:d.toString("hex")
            } 

            //data to database
            addTracking.addTrackingData(dataObj);
        }
    });
  
    socket.once("close", function(){
      console.log("Connection from %s deleted ", remoteAddress)
    });
  
    socket.on("error", function(err){
      console.log(err);
    })
  });

  server.listen(1245, function(){
    console.log("Port 1245 is open, server listening to %j", server.address());
  })

app.listen(port, function(){
    console.log("connected");
});


