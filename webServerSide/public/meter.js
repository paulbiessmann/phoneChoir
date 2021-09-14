let value = 0;
let button;
let mouseVal = 0;
var socket;
var valueRcv = -1;
var socketOsc;
var port = 3334;
let input;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // connect to webserver, get audience data:
  let url = 'https://oper.digital';
  socket = io.connect(url, {path: "/applause/socket.io"});
  console.log("perf",url);
  // say "I'm a performer"
  socket.emit('performer', 1);

  socket.on('applauseRcv',
    function(valueRcv) {
      console.log("Got: " + valueRcv);
      value = valueRcv;
    }
  );


}

function draw() {
  background(0, 255, 0);

  let meter = value * 400 / 255;

  fill(255,0,0);
  //stroke();
  textSize(14);
  rect(20, 440-meter, 12, meter);
  triangle(20, 440-meter, 10, 435-meter, 10, 445-meter );
  strokeWeight(2);
  stroke(51);
  text("Applaus", 5, 460);
  for (let i = 0; i <= 10; i ++) {
    textSize(12);
    rect(30, 439-(i*40), 5, 1);
    text(i*10 + " %", 39, 444-(i*40));
  }

}
