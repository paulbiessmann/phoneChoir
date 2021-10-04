let value = 0;
let button;
let on = 0;
let mouseVal = 0;
var socket;
var valueRcv = -1;
var socketOsc;
var port = 8004;
let input;
var numClientsRcv = -1;
var numClients = -1;
var activeClients = -1;
var activeClientsRcv = -1;
var maxClients = 0;
var maxActive = 0;
var sendNeutral = 0;
let osc;
let playSound = false;
let pixelValIn = 0;
let pixelVal = 0;
let freq = 440;
var msg;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // connect to webserver, get audience data:
   let url = 'http://192.168.0.100:3000';
  // let url = 'http://192.168.178.35:3000';
  //let url = 'http://127.0.0.1:3000';

  // socket = io.connect(url, {path: "/applause/socket.io"});
  socket = io.connect(url);
  console.log("perf",url);

  // say "I'm a performer"
  socket.emit('performer', 1);


  socket.on('numClientsRcv',
    function(numClientsRcv) {
      numClients = numClientsRcv;
      if (numClients > maxClients){
        maxClients = numClients;
      }
   }
  );


  // connect to local OSC server on the performer machines:
  socketOsc = io.connect('http://localhost:8081');
  socketOsc.on('connect', function() {
        // sends to socket.io server the host/port of oscServer
        // and oscClient
        socketOsc.emit('config',
            {
                server: {
                    port: port,
                    host: '127.0.0.1'
                },
                client: {
                    port: 4444,
                    host: '127.0.0.1'
                }
            }
        );
    });

    socketOsc.on('message',
      function(msg) {

        socket.emit('message', msg);

      }
    );


    input = createInput('');
    input.position(15, 110);
    input.size(50);
    let portButton = createButton("change OSC port");
    portButton.position(70, 110);

    portButton.mousePressed(changeUdpPort);

    let onButton = createButton("OnOff");
    onButton.position(70, 150);
    onButton.mousePressed(changeBypass);

}

function changeBypass(){
  if (on == 0){
    on = 1;
  }else{
    on = 0;
  }
}

function changeUdpPort() {
    var inputValue = int(input.value());
    if(inputValue > 0 && inputValue < 65536){
        port = inputValue;
        console.log('Change Udp Port to: ', port);

        socketOsc.emit('config',
          {
              server: {
                  port: port,
                  host: '127.0.0.1'
              },
              client: {
                  port: 4444,
                  host: '127.0.0.1'
              }
          }
      );
  }else {

  }

}



function draw() {
    background(0, pixelVal*255, pixelVal*255);

      // display variables
    fill(255);
    textSize(25);
    text("on = " + on, 130, 170);
    text("Performer", 15, 50);
    text("udp port: " + port, 15, 80 );
    textSize(20);
    text("clients:         " + numClients + "            active: " + activeClients, 15, 200);
    text("maxClients: " + maxClients + "      maxActive: " + maxActive, 15, 230);
    textSize(20);

}

function deviceShaken() {
  value = value + 3;
  if (value >= 255) {
    value = 255;
  }
}

function mousePressed() {
  value = value + 15;
  if (value > 255) {
    value = 255;
  }

}
