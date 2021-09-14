// Paul Biessmann - 14-Sept-2021
// for Musem für Kommunikation Nürnberg
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
let id = 0;
var time = 0;
var voiceID = 0;

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

  socket.on('time', function(timeRcv){
    time = timeRcv;
  })

  let params = getURLParams();
  id = params.id;
  voiceID = id%5;

  socket.on('synth',  function(msg){
    voiceNum = msg[1];

    if (voiceNum == voiceID){
      freq = midiToFreq(msg[2]);
      volume = msg[3];
      osc.amp(volume/127,0.1);
      osc.freq(freq,0.1);
    }
  });


}


function draw() {

    var lauf = sin(millis()/500 + id * 1 );
    var brightness = sin(pixelVal * 10 + id * 1);

    background(brightness*255, brightness*255, brightness*255);

    //background(pixelVal*255*sin(lfo))

    // display variables
    // fill(0);
    fill(255,0,0);
    text("ID: " + id, 10, 10);
    text("voiceID: " + voiceID, 10, 20);
    // text("time " + millis(), 10, 25);
    // textSize(48);
    // fill(255,0,0);
    // text("Phone!!", 25, 200);
    // textSize(15);
    // text("PixelVal "  + pixelVal, 15, 250);


    //LFO
    // const n = lfo.run();
    // fill(255,0,0);
    // text(n, 25, 25);

    if (value > 5){
      value = value - 5;
    }



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
