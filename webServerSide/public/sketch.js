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
var pixelVal = 0.0;
var pixelValRcv = 0.0;
let id = 0;
var time = 0, timeStamp = 0, gMillis = 0;
var voiceID = 0;
var msg;
let filter;
var filterFreq = 1000;
var filterFreqNew = 1000;
var lfo1Freq = 0, lfo1Amnt = 0;
var lfo2Freq = 0, lfo2Amnt = 0;
var lauf = 0, brightness;
let fft;

// const lfo = new LFO(0, 1, 200);

function setup() {
  createCanvas(windowWidth, windowHeight);
  // let url = 'https://oper.digital';
  // console.log("connecting",url);
  // socket = io.connect(url, {path: "/applause/socket.io"});
  socket = io.connect('http://192.168.0.100:3000');
  // socket = io.connect('http://127.0.0.1:3000');

  let params = getURLParams();
  id = params.id;
  voiceID = ((id-1)%4)+1;

  osc = new p5.Oscillator('sawtooth');
  filter = new p5.LowPass;
  lfo1 = new p5.Oscillator();
  lfo2 = new p5.Oscillator();
  fft = new p5.FFT();

  lfo1.disconnect();
  lfo2.disconnect();
  osc.disconnect();
  osc.connect(filter);

  filter.freq(filterFreq);
  filter.res(5);



  //noise = new p5.Noise();


  // say "Hi, I'm a phone"
  socket.emit('phone', 1);


// // TODO:
// - Reset call for timing, LFOs, Freqs, Eff, Visuals
// - Speed of LFO for visuals and Sound
// - Anordnung der Phones quadratisch? Vll in drei Reihen besser.. 3x8



  socket.on('message', function(msg) {

    // console.log("msg " , msg);

    if(msg.includes("/pixelValIn")){
      pixelVal = parseFloat(msg[1]);
    }
    if(msg.includes("/synth")){
      voiceNum = msg[1];

      if (voiceNum == voiceID){
        freq = midiToFreq(msg[2]);
        volume = msg[3];
        lfo1.start();
        lfo2.start();
      }

    }
    if(msg.includes("/filterFreq")){
      filterFreqNew = map(msg[1], 0, 1, 100, 5000);
    }
    if(msg.includes("/lfo1")){
      lfo1Freq = map(msg[1], 0, 1, 0, 20);
      lfo1Amnt = map(msg[2], 0, 1, 0, 10);
      lfo1.freq(lfo1Freq, 0.01);
      lfo1.amp(lfo1Amnt, 0.01);
    }
    if(msg.includes("/lfo2")){
      lfo2Freq = map(msg[1], 0, 1, 0, 50);
      lfo2Amnt = map(msg[2], 0, 1, 0, 500);
      lfo2.freq(lfo2Freq, 0.01);
      lfo2.amp(lfo2Amnt, 0.01);
    }
    if(msg.includes("/reset")){
      //setup();
      timeStamp = millis();
      lauf = 0;

    }

  });


}


function draw() {
    // Timing
    time = millis() - timeStamp;
    //gMillis = time - second() * 1000;

    //background(pixelVal*255*sin(lfo))
    //brightness = pixelVal; // sin(pixelVal * 10 + id / 9);
    brightness =sin(time * 0.1 * pixelVal + (id-3) / 3);
    //brightness =sin(time * 0.01  + pixelVal * 10 + (id-3) / 3);
    background(brightness*255, pixelVal*255, pixelVal*255);


    // display variables
    // fill(0);
    fill(255,0,0);
    text("ID: " + id, 10, 10);
    text("voiceID: " + voiceID, 10, 20);
    text("time " + time, 10, 35);
    text("second " + second(), 10, 50);
    //text("osc " + osc.getAmp(), 10, 70);
    text("windowHeight " + windowHeight, 10, 70);
    text("windowWidth " + windowWidth, 10, 90);

    // textSize(48);
    // fill(255,0,0);
    // text("Phone!!", 25, 200);
    textSize(15);
    text("PixelVal "  + pixelVal, 15, 250);



// Sound
    // lerp(filterFreq, 0.0005);
    filterFreq = leaky(filterFreq, filterFreqNew, 0.82);
    filterFreq = constrain(filterFreq, 20, 22050);
    filter.freq(filterFreq);
    filter.freq(lfo2);
  //console.log("filterFreq " + filterFreq);

    osc.amp(volume/127,0.1);
    osc.freq(freq, 0.01);
    osc.freq(lfo1);

    //LFO
    // const n = lfo.run();
    // fill(255,0,0);
    // text(n, 10, 40);


// Draw stuff:

    // lauf += (lfo1Freq * id);
    // if (lauf > windowHeight){
    //   lauf = -windowHeight;
    // }

    lauf = sin(time/1000 + id * lfo1Freq) * windowHeight; //+ id / 9
    fill(0, 0,  255);
    //rect(windowWidth/2 - 50, lauf, 100, windowHeight  );


    let waveform = fft.waveform();
    // fill(0,0,255);
    noFill();
    beginShape();
    stroke(0,0,255);
    strokeWeight(6);
    for (let i = 0; i < waveform.length; i++){
      let y = map(i, 0, waveform.length, 0, height);
      let x = map( waveform[i], -1, 1, 0, width);
      vertex(x,y);
    }
    endShape();
    noStroke();

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

function leaky(oldVal, newVal, coeff){

  newVal = oldVal * (1-coeff) + newVal * coeff;

  return newVal;

}
