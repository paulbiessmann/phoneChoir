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
var scene = 6;
var bDrawWave = true;
var idRandom;
let visSize = 5;
var voices = 4;
var bDrawText = false;
var angle = 0;
var pos = 0;
var w = 0, h = 0;
let futureBook;
let soundSnow, soundIceBowl, soundPnoMel, soundIceSynArp, soundPills;
let soundFieldPno1, soundFieldPno2, soundDwarfs;
var amp;
var volhistory = [];
let bPlaySnow = 0, bPlayBowl = 0, bPlayIceArp = 0, bPlayPills = 0, bPlayIceMelo = 0;
let bPlaySynthField = 0, bPlayDwarfs = 0;
let val1 = 0.1, val2 = 0, val3 = 0, val4 = 0;
let gifEye, gifEye2, gifBug, gifForest;
let flash = 0;
let frameCount = 0;
let height, width;
var waveRect = 0;
var timeCnt = 0;

// const lfo = new LFO(0, 1, 200);
function preload(){
  soundSnow = loadSound('assets/snow.mp3');
  soundIceBowl = loadSound('assets/iceBowl.mp3');
  soundPnoMel = loadSound('assets/icePnoMel.mp3');
  soundIceSynArp = loadSound('assets/iceSynArp.mp3');
  soundPills = loadSound('assets/PillsSounds.mp3');
  soundFieldPno1 = loadSound('assets/SynthField_Piano1.mp3');
  soundFieldPno2 = loadSound('assets/SynthField_Piano2.mp3');
  soundDwarfs = loadSound('assets/klinke_dwarfs4.mp3');
  futureBook = loadFont('assets/futura_book.otf');
  gifEye = loadImage('assets/EyeWideSmall.gif');
  gifBug = loadImage('assets/BugSmall.gif');
  gifForest = loadImage('assets/ForestSmall.gif');

}

function setup() {
  idRandom = random();
  frameCount = 0;

  createCanvas(windowWidth, windowHeight, WEBGL);
   let url = 'http://192.168.0.100:3000';
  // url = 'http://192.168.1.219';
  //let url = 'http://127.0.0.1:3000';
  // console.log("connecting",url);
  // socket = io.connect(url, {path: "/applause/socket.io"});
  //socket = io({transports: ['websocket'], upgrade: false});
  socket = io.connect(url);
  // socket = io.connect('http://127.0.0.1:3000');

  textFont(futureBook);

  let xiaomiWidth = 396;
  let xiaomiHeight = 900;
  gifEye.resize(xiaomiWidth, xiaomiHeight);
  gifForest.resize(xiaomiWidth, xiaomiHeight);
  gifBug.resize(xiaomiWidth, xiaomiHeight);
  height = windowHeight;
  width = windowWidth;


  let params = getURLParams();
  id = params.id - 10;
  voiceID = ((id-1)%voices)+1;
  idX = ((id - 1) % visSize) +1;
  idY = ceil((id) / visSize);

  osc = new p5.Oscillator('sawtooth');
  filter = new p5.LowPass;
  lfo1 = new p5.Oscillator();
  lfo2 = new p5.Oscillator();
  lfo3 = new p5.Oscillator('square');
  fft = new p5.FFT();
  amp = new p5.Amplitude();

  lfo1.disconnect();
  lfo2.disconnect();
  lfo3.disconnect();
  osc.disconnect();
  osc.connect(filter);

  soundSnow.disconnect();
  soundPnoMel.disconnect();
  soundIceBowl.disconnect();
  soundIceSynArp.disconnect();
  soundPills.disconnect();
  soundFieldPno1.disconnect();
  soundFieldPno2.disconnect();
  soundDwarfs.disconnect();

  soundSnow.connect(filter);
  soundPnoMel.connect(filter);
  soundIceBowl.connect(filter);
  soundIceSynArp.connect(filter);
  soundPills.connect(filter);
  soundFieldPno1.connect(filter);
  soundFieldPno2.connect(filter);
  soundDwarfs.connect(filter);

  lfo3.freq(0.5);

  filter.freq(filterFreq);
  filter.res(5);

  //noise = new p5.Noise();

  // say "Hi, I'm a phone"
  socket.emit('phone', 1);

  socket.on('newId', function(numPhones){
    if(isNaN(id)){
      id = numPhones;
      voiceID = ((id-1)%voices)+1;
      idX = ((id - 1) % visSize) +1;
      idY = ceil((id) / visSize);
    }
  });


  socket.on('message', function(msg) {

    // console.log("msg " , msg);

    if(msg.includes("/pixelValIn")){
      pixelVal = parseFloat(msg[1]);
      if(scene == 6){
        lfo3.freq(idRandom * 3 * pixelVal +
          0.1, 0.1);
        lfo3.start();

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

    else if(msg.includes("/flash")){
      flash = 255;
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
    else if(msg.includes("/playPills")){
      bPlayPills = msg[1];
      if(bPlayPills == 0){
        soundPills.stop();
      }else{
        soundPills.play();
        soundPills.loop();
        soundPills.jump(idRandom * 30);
      }
    }
    else if(msg.includes("/playIceMelo")){
      bPlayIceMelo = msg[1];
      if(bPlayIceMelo == 0){
        soundPnoMel.stop();
      }else{
        soundPnoMel.play();
        soundPnoMel.loop();
      }
    }
    else if(msg.includes("/playIceArp")){
      bPlayIceArp = msg[1];
      if(bPlayIceArp == 0){
        soundIceSynArp.stop();
      }else{
        soundIceSynArp.play();
        soundIceSynArp.loop();
      }
    }
    else if(msg.includes("/playBowl")){
      bPlayBowl = msg[1];
      if(bPlayBowl == 0){
        soundIceBowl.stop();
      }else{
        soundIceBowl.play();
        soundIceBowl.loop();
      }
    }
    else if(msg.includes("/playSnow")){
      bPlaySnow = msg[1];
      if(bPlaySnow == 0){
        soundSnow.stop();
      }else{
        soundSnow.play();
        soundSnow.loop();
        soundSnow.setVolume(0.4);
      }
    }
    else if(msg.includes("/playDwarfs")){
      bPlayDwarfs = msg[1];
      if(bPlayDwarfs == 0){
        soundDwarfs.stop();
      }else{
        soundDwarfs.play();
        soundDwarfs.loop();
        soundDwarfs.jump(idRandom * 10);
        soundDwarfs.setVolume(0.7);
      }
    }
    else if(msg.includes("/playSynthField")){
      bPlaySynthField = msg[1];
      if(id % 2 == 0){
        if(bPlaySynthField == 0){
          soundFieldPno1.stop();
        }else{
          soundFieldPno1.play();
          soundFieldPno1.loop();
        }
      }
      else{
        if(bPlaySynthField == 0){
          soundFieldPno2.stop();
        }else{
          soundFieldPno2.play();
          soundFieldPno2.loop();
        }
      }
    }
    else if(msg.includes("/reset")){
      timeStamp = millis();
      lauf = 0;

      gifForest.setFrame(0);
      gifBug.setFrame(0);
      gifEye.setFrame(0);

      frameCount = 0;
      timeCnt = 0;

    }
    else if(msg.includes("/random")){
      idRandom = random();
      timeStamp = millis() + idRandom * 1000;
      lfo3.freq(idRandom * 3 * pixelVal, 0.1);
      lfo3.start();
      lauf = 0;

      gifForest.setFrame(idRandom * 10);
      gifBug.setFrame(idRandom * 10);
      gifEye.setFrame(idRandom * 10);
    }
    else if(msg.includes("/refreshPhone")){
      location.reload();
    }
    else if(msg.includes("/randomScene")){
      idRandom = random();
      scene = int(idRandom * 15);
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

    let speed = val1 * 2 + 1;

    let visual = scene;
    bDrawWave = true;
    if(visual != 6){
      lfo3.amp(0);
    }

    if(flash > 0.1){
      flash *= 0.95;
    }

    switch(visual){

      case 0:
        background(pixelVal*255 + flash);
        bDrawWave = false;
        bDrawText = false;
        break;

      case 1:
        // Corner to corner:
        brightness = sin(time * 0.05 * val1 + (id-3) / visSize);
        //brightness =sin(time * 0.01  + pixelVal * 10 + (id-3) / 3);
        background(brightness*255, pixelVal*255+ flash, pixelVal*255+ flash);
        break;

      case 2:
      // right to left:
        brightness = cos(time * 0.05 * val1 + ((id-4) % visSize));
        background(brightness*255, pixelVal*255+ flash, pixelVal*255+ flash);
        break;

      case 3:
      // left to right:
        brightness = cos(time * 0.05 * val1 + visSize - ((id-4) % visSize));
        background(brightness*255, pixelVal*255+ flash, pixelVal*255+ flash);
        break;

      case 4:
      // schräg:
        //brightness = sq(cos(time * 0.05 * val1  + idX + idY)) ;
        brightness = cos(time * 0.05 * val1  + idX + idY) ;
        // lauflicht kreis?
        //brightness = sin(time * 0.05 * pixelVal  * (idX-2) + (idY-2));
        background(brightness*255, pixelVal*255+ flash, pixelVal*255+ flash);
        break;

      case 5:
      // schlange:
        brightness = sq(cos(time * 0.05 * val1  + idX - 2 + idY -2)) ;
        //brightness = sin(2 * PI * (16 * val1 / 60) * time * 0.01  ) ;
        background(brightness*255, pixelVal*255+ flash, pixelVal*255+ flash);
        break;

      case 6:
        // black:
        brightness = 0.0;
        background(pixelVal*255+ flash , pixelVal*255+ flash, pixelVal*255+ flash);
        //background(brightness*255, brightness*255, brightness*255);
        bDrawWave = false;
        bDrawText = true;
        break;

      case 7: // ICE noise
        bDrawText = false;
        // noise:
        frameCount += val1 * 5;
        //brightness = sin(time * 0.002 * (val1 + 0.05) * id + idRandom) + noise(time * 0.1 * val1 / 1000);
        brightness = sin(frameCount * 0.1  + idRandom * 10) + noise(frameCount * 0.02);
        background(brightness*255 + flash + pixelVal*255);
        break;

      case 8:
        // squares
        background(pixelVal*255+ flash);
        bDrawText = false;
        push();
        translate(0,0, val1 * 500);

        // rectMode(CENTER);
        stroke(255);
        strokeWeight(2);
        fill(0);
        push();
        rotateY(angle + time * 0.002);
        rotateX(angle + time * 0.002);
        if(val2 < 0.3){
          box(200);
        }else if(val2 < 0.6){
          sphere(150);
        }
        else{
          torus(100, val3 * 50 +2);
        }
        pop();
        pop();
        break;

      case 9:  // Bunte Lines
        //background(pixelVal*255);
        if(val2 > 0.1){
          background(pixelVal*255 + flash);
        }
        push();
        strokeWeight(val1 * 150 + 1);
        translate(-width/2, - height/2, 0 );
        stroke(random(255), random(255), random(255));
        line(random(width), random(height), random(width), random(height));
        pop();
        bDrawWave = false;
        break;

      case 10: // Bar Code 1
        if(val3 > 0.1){
          background(0);
        }
        push();
        translate(-width/2, - height/2, 0 );
        rotateY(-val1);
        stroke(255);
        w = 200 * val2;
        for (let y = 0; y<height; y += 30){
          strokeWeight(sin(time * 0.005 * 1.5 + y) * pixelVal * 40 + 2 );
          line(w * sin(time * 0.01 * 1.5 + y), y, width - w * sin(time*0.01+y), y);
        }
        pop();
        bDrawWave = true;
        break;

      case 11: // Barcode 2
        if(val3 > 0.1){
          background(0);
        }
        push();
        rotateZ(val1*PI);
        translate(-width/2, - height/2, 0 );
        stroke(255);
        w = 200 * val2;
        for (let y = -200; y<height; y += 30){
          strokeWeight(sin(time * 0.005 * 1.5 + y) * pixelVal * 40 + 2 );
          line(y, w * sin(time * 0.01 * 1.5 + y), y, height - w * sin(time*0.01+y));
        }
        pop();
        bDrawWave = true;
        break;

      case 12: // pills Circle
        var vol = amp.getLevel();
        volhistory.push(vol);
        stroke(20);
        push();

        if(val2 > 0.1){
          background(0, vol * 50 * 255, pixelVal * 255);

          fill(255,0,0);
          beginShape();
          for (var i = 0; i < 360; i++) {
            var r = map(volhistory[i], 0, 1, 20, 1000);
            var x = r * cos(i*PI / 180);
            var y = r * sin(i*PI / 180);
            vertex(x, y);
          }
          endShape();
        }
        if (vol > 0.001){
          //background(0);
          push();
          translate(-width/2, - height/2);
          fill(random( 255),random( 255),random(255));
          circle(random(width), random(height), 10+ vol*2000);
          pop();
        }
        pop();
        if (volhistory.length > 360) {
          volhistory.splice(0, 1);
        }
        if(val3 < 0.1){
          bDrawWave = false;
        }else{
          bDrawWave = true;
        }
        break;

      case 13: // bugs
        bDrawWave = false;
        background(0);
        push();
        translate(-width/2, -height/2);
        image(gifBug, 0, 0);
        pop();
        break;

      case 14: // Eyes
        bDrawWave = false;
        background(0);
        push();
        translate(-width/2, -height/2);
        image(gifEye, 0, 0);
        pop();
        break;

      case 15:  // Forest
        bDrawWave = false;
        background(0);
        push();
        translate(-width/2, -height/2);
        image(gifForest, 0, 0);
        pop();
        break;

      case 16: // texts
        background(0);
        bDrawWave = false;
        bDrawText = false;
        push();
        translate(-width/2, -height/2);
        fill(0, 255,0);
        textSize(20);
        for (let i=0; i<height; i+=20){
          text(random(), random(10), i);
        }
        pop();
        break;

      case 17: // waves
        background(0,0,pixelVal*255 + flash);
        if(0){
          brightness = cos((time * 0.01 * val1) + (val2 * 1 * idX));
          push();
          translate(-width/2, -height/2);
          rect(0,0, width, height * abs(brightness) );
          pop();
        }
        if(1){
          push();
          translate(-width/2, -height/2);
          strokeWeight(2);
          stroke(0);
          fill(255,255,0);
          timeCnt += val1 * 2 + 0.01;
          for (let y = 0; y<height; y += 10){
            let lineX = 0;
            // let lineH = width * sin(time * 0.01 * val1 + y * 0.4 * val2 );
            let lineH = width * sin(timeCnt + y * 0.4 * val2 );
            //line(lineX, y, lineH, y);
            rect(lineX, y, lineH, (val3 * 30) + 2);
          }
          pop();
        }
        bDrawWave = false;
        break;

      case 18:
        var vol = amp.getLevel();
        volhistory.push(vol);
        stroke(20);
        push();

        if(val2 > 0.1){
          background(0, vol * 10 * 255, pixelVal * 255);

          fill(255,0,0);
          beginShape();
          for (var i = 0; i < 360; i++) {
            var r = map(volhistory[i], 0, 1, 20, 1000);
            var x = r * cos(i*PI / 180);
            var y = r * sin(i*PI / 180);
            vertex(x, y);
          }
          endShape();
        }

        if (vol > 0.001){
          if (vol > 0.008){
              background(0,0,vol * 40 * 255);
          }
          //background(0);
          push();
          translate(-width/2, - height/2);
          stroke(random( 255),random( 255),random(255));
          //noFill();
          fill(0,0,0, 256);

          strokeWeight(1+ vol*20);
          triangle(random(width), random(height), random(width), random(height),random(width), random(height));
          pop();
        }
        pop();
        if (volhistory.length > 360) {
          volhistory.splice(0, 1);
        }
        if(val3 < 0.1){
          bDrawWave = false;
        }else{
          bDrawWave = true;
        }
        break;

      case 19:
        //timeCnt += val1 * 10 + 0.01;
        if ( val3 > 0.5){
          // left to right:
          brightness = cos(time * 0.05 * val1 + visSize - ((id-4) % visSize));
          background(pixelVal*255, 0, brightness*255);
        }else{
          // Corner to corner:
          brightness = sin(time * 0.05 * val1 + (id-3) / visSize);
          background(0, pixelVal*255, brightness*255);
        }
        break;

    }


    if (bDrawText){//(bDrawText){
      // display variables
      // fill(0);
      fill(255,0,0);
      push();
      translate(-width/2, -height/2, 0);
      text("ID: " + id, 10, 70);
      text("ID Random: " + round(idRandom, 3), 70, 70);
      text("voiceID: " + voiceID, 10, 90);
      text("time " + time, 10, 110);
      text("second " + second(), 10, 130);

      textSize(15);
      text("val1 "  + val1, 15, 150);
      text("val2 "  + val2, 15, 170);
      text("val3 "  + val3, 15, 190);
      text("val4 "  + val4, 15, 210);

      text("width "+ width + " height " + height, 15, 300);

      textSize(40);
      text("idX " + idX + "  idY " + idY, 10, 250);
      textSize(100);
      text(id, 15, 400);

      pop();
      textSize(15);
    }

// Sound

  // Playback sounds
  if(bPlayPills == 1){

    if(id > val1*128){
      soundPills.setVolume(0.0);
    }
    else{
      soundPills.setVolume(0.8);
    }
  }

  //console.log("filterFreq " + filterFreq);

    osc.amp(volume/190,0.1); //eigentlich /127
    osc.freq(freq, 0.01);
    osc.freq(lfo1);


    switch (scene){
      case 7: // ICE
        filter.freq(lfo3);
        lfo3.amp(0.9);
        osc.amp(lfo3);
        break;
    }

    // lerp(filterFreq, 0.0005);
    filterFreq = leaky(filterFreq, filterFreqNew, 0.82);
    filter.freq(lfo2);
    filterFreq = constrain(filterFreq, 120, 22050);
    filter.freq(filterFreq);



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
          translate(-windowWidth/2, -(windowHeight/2)-50, 0);
          beginShape();
          stroke(0,0,255);
          strokeWeight(6);
          for (let i = 0; i < waveform.length; i++){
            let y = map(i, 0, waveform.length, 0, windowHeight+50);
            let x = map( waveform[i], -1, 1, 0, windowWidth);
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

  gifEye.resize(windowWidth, windowHeight);
  gifForest.resize(windowWidth, windowHeight);
  gifBug.resize(windowWidth, windowHeight);
  height = windowHeight;
  width = windowWidth;
}

function leaky(oldVal, newVal, coeff){

  newVal = oldVal * (1-coeff) + newVal * coeff;
  return newVal;

}

function flashEvent(valIn, step){
  var out = valIn - step;
  return out;
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
