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
let id = 0, idX = 0, idY = 0;
let visSize = 5;
var time = 0, timeStamp = 0, gMillis = 0;
var voiceID = 0;
var msg;
let filter;
var filterFreq = 150;
var filterFreqNew = 150;
var lfo1Freq = 0, lfo1Amnt = 0;
var lfo2Freq = 0, lfo2Amnt = 0;
var lauf = 0, brightness;
let fft;
var scene = 5;
var bDrawWave = true;
var idRandom;
var voices = 5;
var bDrawText = false;
var angle = 0;
var pos = 0;
var w = 0, h = 0;
let futureBook;
let soundSnow, soundIceBowl, soundPnoMel, soundIceSynArp;
let val1 = 1, val2 = 0, val3 = 0, val4 = 0;

// const lfo = new LFO(0, 1, 200);
function preload(){
  soundSnow = loadSound('assets/snow.mp3');
  soundIceBowl = loadSound('assets/iceBowl.mp3');
  soundPnoMel = loadSound('assets/icePnoMel.mp3');
  soundIceSynArp = loadSound('assets/iceSynArp.mp3');
  futureBook = loadFont('assets/futura_book.otf');
}

function setup() {
  idRandom = random();

  createCanvas(windowWidth, windowHeight, WEBGL);
   let url = 'http://192.168.0.100:3000';
  //let url = 'http://127.0.0.1:3000';
  // console.log("connecting",url);
  // socket = io.connect(url, {path: "/applause/socket.io"});
  //socket = io({transports: ['websocket'], upgrade: false});
  socket = io.connect(url);
  // socket = io.connect('http://127.0.0.1:3000');

  textFont(futureBook);

  let params = getURLParams();
  id = params.id;
  voiceID = ((id-1)%voices)+1;
  idX = ((id - 4) % visSize) +1;
  idY = ceil((id - 3) / visSize);

  osc = new p5.Oscillator('sawtooth');
  filter = new p5.LowPass;
  lfo1 = new p5.Oscillator();
  lfo2 = new p5.Oscillator();
  lfo3 = new p5.Oscillator('sawtooth');
  fft = new p5.FFT();

  lfo1.disconnect();
  lfo2.disconnect();
  lfo3.disconnect();
  osc.disconnect();
  osc.connect(filter);

  soundSnow.disconnect();
  soundPnoMel.disconnect();
  soundIceBowl.disconnect();
  soundIceSynArp.disconnect();

  soundSnow.connect(filter);
  soundPnoMel.connect(filter);
  soundIceBowl.connect(filter);
  soundIceSynArp.connect(filter);

  filter.freq(filterFreq);
  filter.res(5);

  //noise = new p5.Noise();


  // say "Hi, I'm a phone"
  socket.emit('phone', 1);


// // TODO:
// - Anordnung der Phones quadratisch? Vll in drei Reihen besser.. 3x8
// - Start in Fullscreen


  socket.on('message', function(msg) {

    // console.log("msg " , msg);

    if(msg.includes("/pixelValIn")){
      pixelVal = parseFloat(msg[1]);
      val1 = pixelVal;
      if(scene == 6){
        lfo3.freq(idRandom * 3 * pixelVal, 0.1);
      }
    }

    else if(msg.includes("/val1")){
      val1 = parseFloat(msg[1]);
    }
    else if(msg.includes("/val2")){
      val2 = parseFloat(msg[1]);
    }
    else if(msg.includes("/val3")){
      val3 = parseFloat(msg[1]);
    }

    else if(msg.includes("/synth")){
      voiceNum = msg[1];

      if (voiceNum == voiceID){
        freq = midiToFreq(msg[2]);
        volume = msg[3];
        lfo1.start();
        lfo2.start();
        lfo3.start();

      }

    }
    else if(msg.includes("/filterFreq")){
      filterFreqNew = map(msg[1], 0, 1, 40, 5000);
    }
    else if(msg.includes("/lfo1")){
      lfo1Freq = map(msg[1], 0.01, 1, 0, 20);
      lfo1Amnt = map(msg[2], 0, 1, 0, 10);
      lfo1.freq(lfo1Freq, 0.01);
      lfo1.amp(lfo1Amnt, 0.01);
    }
    else if(msg.includes("/lfo2")){
      lfo2Freq = map(msg[1], 0.01, 1, 0.001, 30);
      lfo2Amnt = map(msg[2], 0, 1, 0, 500);
      lfo2.freq(lfo2Freq, 0.01);
      lfo2.amp(lfo2Amnt, 0.01);

    }
    else if(msg.includes("/scene")){
      scene = msg[1];
    }
    else if(msg.includes("/reset")){
      timeStamp = millis();
      lauf = 0;

      if(soundPnoMel.isPlaying()){
        soundPnoMel.stop();
      }else{
        soundPnoMel.play();
        soundPnoMel.loop();
      }
      if(soundSnow.isPlaying()){
        soundSnow.stop();
      }else{
        soundSnow.play();
        soundSnow.loop();
      }
      if(soundIceSynArp.isPlaying()){
        soundIceSynArp.stop();
      }else{
        soundIceSynArp.play();
        soundIceSynArp.loop();
      }

    }
    else if(msg.includes("/random")){
      idRandom = random();
      timeStamp = millis() + idRandom * 1000;
      lfo3.freq(idRandom * 3 * pixelVal, 0.1);
      lauf = 0;
      if(soundIceBowl.isPlaying()){
        soundIceBowl.stop();
      }else{
        soundIceBowl.play();
        soundIceBowl.loop();
      }
    }
    else if(msg.includes("/refreshPhone")){
      location.reload();
    }

  });

  mousePressed();


}


function draw() {
    // Timing
    time = millis() - timeStamp;
    //gMillis = time - second() * 1000;

    //background(pixelVal*255*sin(lfo))
    //brightness = pixelVal; // sin(pixelVal * 10 + id / 9);

    let visual = scene;
    bDrawWave = true;
    if(visual != 6){
      lfo3.amp(0);
    }


    switch(visual){

      case 0:
        background(pixelVal*255);
        bDrawWave = false;
        bDrawText = false;
        break;

      case 1:
        // Corner to corner:
        brightness = sin(time * 0.05 * pixelVal + (id-3) / visSize);
        //brightness =sin(time * 0.01  + pixelVal * 10 + (id-3) / 3);
        background(brightness*255, pixelVal*255, pixelVal*255);
        break;

      case 2:
      // right to left:
        brightness = cos(time * 0.05 * pixelVal + ((id-4) % visSize));
        background(brightness*255, pixelVal*255, pixelVal*255);
        break;

      case 3:
      // left to right:
        brightness = cos(time * 0.05 * pixelVal + visSize - ((id-4) % visSize));
        background(brightness*255, pixelVal*255, pixelVal*255);
        break;

      case 4:
      // ring:
        brightness = cos(time * 0.05 * pixelVal  * ((idX-2) + (idY-2)));
        // lauflicht kreis?
        //brightness = sin(time * 0.05 * pixelVal  * (idX-2) + (idY-2));
        background(brightness*255, pixelVal*255, pixelVal*255);
        break;

      case 5:
        // black:
        brightness = 0.0;
        background(pixelVal*255 , pixelVal*255, pixelVal*255);
        //background(brightness*255, brightness*255, brightness*255);
        bDrawWave = false;
        bDrawText = true;
        break;

      case 6:
        bDrawText = false;
        // noise:
        brightness = sin(time * 0.002 * (pixelVal + 0.05) * id + idRandom) + noise(time * 0.1 * pixelVal / 1000);
        background(brightness*255);
        break;

      case 7:
        // squares
        background(pixelVal*255);
        bDrawText = false;
        push();
        translate(0,0, pixelVal * 500);

        // rectMode(CENTER);
        stroke(255);
        strokeWeight(2);
        fill(0);
        push();
        rotateY(angle + time * 0.002);
        rotateX(angle + time * 0.002);
        box(200);
        //sphere(200);
        //torus(100, 50);

        pop();
        pop();
        break;

      case 8:
        //background(pixelVal*255);
        if(val2 > 0.1){
          background(pixelVal*255);
        }
        push();
        strokeWeight(pixelVal * 150 + 1);
        translate(-width/2, - height/2, 0 );
        stroke(random(255), random(255), random(255));
        line(random(width), random(height), random(width), random(height));
        pop();
        break;

      case 9:
        if(val3 > 0.1){
          background(0);
        }

        push();
        translate(-width/2, - height/2, 0 );
        stroke(255);
        let speed = val1 * 2 + 1;
        w = 200 * val2;
        for (let y = 0; y<height; y += 20){
          strokeWeight(sin(time * 0.005 * 1.5 + y) * pixelVal * 40 + 2 );
          line(w * sin(time * 0.01 * 1.5 + y), y, width - w * sin(time*0.01+y), y);
        }

        pop();
        bDrawWave = true;
        break;


    }


    if (bDrawText){//(bDrawText){
      // display variables
      // fill(0);
      fill(255,0,0);
      translate(-width/2, -height/2, 0);
      push();
      text("ID: " + id, 10, 70);
      text("voiceID: " + voiceID, 10, 90);
      text("time " + time, 10, 110);
      text("second " + second(), 10, 130);

      textSize(15);
      text("val1 "  + val1, 15, 150);
      text("val2 "  + val2, 15, 170);
      text("val3 "  + val3, 15, 190);
      text("val4 "  + val4, 15, 210);

      textSize(40);
      text("idX " + idX + "  idY " + idY, 10, 250);
      textSize(100);
      text(id, 15, 400);

      pop();
      textSize(15);
    }

// Sound

  //console.log("filterFreq " + filterFreq);

    osc.amp(volume/127,0.1);
    osc.freq(freq, 0.01);
    osc.freq(lfo1);


    switch (scene){
      case 6:
        filter.freq(lfo3);
        lfo3.amp(0.9);
        osc.amp(lfo3);
        break;
    }

    // lerp(filterFreq, 0.0005);
    filterFreq = leaky(filterFreq, filterFreqNew, 0.82);
    filterFreq = constrain(filterFreq, 20, 22050);
    filter.freq(filterFreq);
    filter.freq(lfo2);


// Draw stuff:

    // lauf += (lfo1Freq * id);
    // if (lauf > windowHeight){
    //   lauf = -windowHeight;
    // }

    lauf = sin(time/1000 + id * lfo1Freq) * windowHeight; //+ id / 9
    fill(0, 0,  255);
    //rect(windowWidth/2 - 50, lauf, 100, windowHeight  );


    if (bDrawWave){
        let waveform = fft.waveform();
        // fill(0,0,255);
        var waveNum = 1;
        push();
        for (let n = 0; n < waveNum; n++){
          translate(n*10,0,  -n * 100);
          noFill();
          push();
          translate(-windowWidth/2, -windowHeight/2, 0);
          beginShape();
          stroke(0,0,255);
          strokeWeight(6);
          for (let i = 0; i < waveform.length; i++){
            let y = map(i, 0, waveform.length, 0, height);
            let x = map( waveform[i], -1, 1, 0, width);
            vertex(x,y);
          }
          endShape();
          pop();
        }
        pop();
        noStroke();
    }

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



function mousePressed() {
  value = value + 200;
  if (value >= 260) {
    value = 260;
  }
  osc.start();
  osc.amp(0.0);
  lfo1.start();
  lfo2.start();

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

// var elem = document.getElementsByTagName("body")[0];
//
// function openFullscreen() {
//   if (elem.requestFullscreen) {
//     elem.requestFullscreen();
//   } else if (elem.mozRequestFullScreen) { /* Firefox */
//     elem.mozRequestFullScreen();
//   } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
//     elem.webkitRequestFullscreen();
//   } else if (elem.msRequestFullscreen) { /* IE/Edge */
//     elem.msRequestFullscreen();
//   }
// }
//
// openFullscreen();
