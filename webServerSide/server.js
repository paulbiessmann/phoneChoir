// Paul Biessmann - 30-March-2021
// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html
// and Daniel Shiffman https://shiffman.net/a2z/server-node/

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();
var value;
var mean;
var valueDict = {};
var numPerformer = 0;
var numClients = 0;
var numPhones = 0;
var activeClients = 0;
var pixelVal = 0;
var pixelValRcv = 0;
var synth = 0;

// Set up the server
// process.env.PORT is related to deploying on heroku
// var server = app.listen(process.env.PORT || 80, listen);
var server = app.listen(3000, "192.168.0.100");
// var server = app.listen(3000, "127.0.0.1");

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {

    console.log("We have a new client: " + socket.id);


    socket.on('phone', function(newPhone){
      if (newPhone == 1){
          socket.room = 'roomPhone';
          socket.join('roomPhone');
          console.log(socket.id + " added to " + socket.room );
          numPhones++;
      }
    });

    // socket.on('pixelVal', function(pixelValIn){
    //       socket.broadcast.to('roomPhone').emit('pixelVal', pixelValIn);
    //       console.log("pixVal " + pixelValIn);
    // });
    //
    // socket.broadcast.to('roomPhone').emit('time', Date.now());
    // console.log(Date.now());
    //
    // socket.on('synth', function(synth){
    //   console.log("synth" + synth);
    //   socket.broadcast.to('roomPhone').emit('synth', synth);
    // });

    socket.on('message', function(msg){
      //console.log("msg "+ msg);
      socket.broadcast.to('roomPhone').emit('message', msg);
    });


    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('applause', function(value) {

      var pixelVal = pixelValIn;
        // Send it to all other clients
        //socket.broadcast.emit('applauseRcv', mean);
        socket.broadcast.to('roomPhones').emit('pixelVal', pixelVal);
        socket.broadcast.to('roomPerformer').emit('numClientsRcv', numClients);
        socket.broadcast.to('roomPerformer').emit('activeClientsRcv', activeClients);


        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");
      }
    );

    socket.on('disconnect', function() {
        console.log("Client has disconnected");
        delete valueDict[socket.id];
        socket.leave(socket.room);
        if (socket.room == 'roomPerformer'){
            numPerformer--;
        }
    });

  }
);

function getMean(valueDict){
    var mean = 0;
    for (var key in valueDict){
        mean = mean + valueDict[key];
    }
    mean = mean / Object.keys(valueDict).length;
    //console.log("mean func " + mean);
    return mean;
}
