let mic;
let port, writer;

let pulse = 0;
let pulseDecay = 0.92; // closer to 1 = slower fade

let baseline = 0;          // smooth background level
let alpha = 0.03;          // smoothing (lower = slower baseline)
let spikeThreshold = 0.025; // <-- tune this for knock
let cooldownMs = 400;
let lastHit = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  userStartAudio();
  mic = new p5.AudioIn();
  mic.start();

  const btn = createButton("Start");
  btn.mousePressed(connectSerial);

  createP("Clap!");
}

function draw() {
  background(245);

  const level = mic.getLevel();
  baseline = lerp(baseline, level, alpha);
  const spike = level - baseline;

  // knock detection
  const now = millis();
  if (spike > spikeThreshold && now - lastHit > cooldownMs) {
    lastHit = now;
    pulse = 140;   // pulse strength
    sendHit();
  }

  // decay pulse
  pulse *= pulseDecay;

  // circle size
  const baseR = 30;
  const levelR = map(level, 0, 0.2, 0, 80, true);
  const finalR = baseR + levelR + pulse;

  // draw
  noStroke();
  fill(0);
  circle(width / 2, height / 2, finalR * 2);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

async function connectSerial() {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
  writer = port.writable.getWriter();
}

async function sendHit() {
  if (!writer) return;
  await writer.write(new TextEncoder().encode("H"));
}
