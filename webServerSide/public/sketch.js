// Paul Biessmann - 30-March-2021
// for oper.digital
let value = 0;
let button;
let mouseVal = 0;
var socket;
let valueRcv = 0;
let permissionGranted = false;
let playSound = false;
let freq = 440;
let volume = 0.0;
var pixelVal = 0.2;
var pixelValRcv = 0.1;

const lfo = new LFO(0, 1, 200);

function setup() {
  createCanvas(windowWidth, windowHeight);
  // let url = 'https://oper.digital';
  // console.log("connecting",url);
  // socket = io.connect(url, {path: "/applause/socket.io"});
  socket = io.connect('http://192.168.0.100:3000');
  // socket = io.connect('http://127.0.0.1:3000');

  // say "I'm a phone"
  socket.emit('phone', 1);

  osc = new p5.Oscillator('sawtooth');

  socket.on('pixelVal', function(pixelValRcv){
    pixelVal = pixelValRcv;
    console.log("pixel" + pixelVal);
  });

  socket.on('freq',  function(msg){
    freq = msg[1];
    volume = msg[2];
    osc.amp(volume/127,0.1);
    osc.freq(freq,0.1);
  });





}


function draw() {


    background(pixelVal*255, pixelVal*255, 0);

    //background(pixelVal*255*sin(lfo))

    // display variables
    fill(0);

    textSize(48);
    fill(255,0,0);
    text("Phone!!", 25, 200);

    // Send that object to the socket
    // if (value > 5){
    //  socket.emit('applause',value);
    // }

    //LFO
    // const n = lfo.run();
    // fill(255,0,0);
    // text(n, 25, 25);

    if (value > 5){
      value = value - 5;
    }

    textSize(15);
    text("PixelVal "  + pixelVal, 15, 250);


    if(value > 200 && playSound == false){
      osc.amp(0.5,0.5);
      playSound = true;
    }
    if(value < 100 && playSound == true){
      osc.amp(0,0.5);
      playSound = false;
    }

}



function LFO(min, max, step = 1) {
  const damp = 0.0137;
  this.max = max;
  this.min = min;
  this.step = step;
  this.run = () => {
    return (
      this.min + this.max * Math.sin(radians(Math.PI * frameCount * (this.step * damp)))
    );
  };
}


function deviceShaken() {
  value = value + 4.5;
  if (value > 255) {
    value = 255;
  }
}

function mousePressed() {
  value = value + 200;
  if (value >= 260) {
    value = 260;
  }
  osc.start();
  osc.amp(0.0);


  let fs = fullscreen();
  fullscreen(!fs);

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
