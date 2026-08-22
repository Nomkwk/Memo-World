// Lightweight Web Audio engine for Memory World. All sounds are synthesised
// (no asset files). The AudioContext is created lazily on the first user
// gesture to respect browser autoplay policies. Mute state persists.

const MUTE_KEY = "memory_world_muted";

let ctx = null;
let master = null;
let pad = null;
function readMuted() {
  try {
    return (
      typeof localStorage !== "undefined" &&
      localStorage.getItem(MUTE_KEY) === "1"
    );
  } catch {
    return false;
  }
}
let muted = readMuted();

function ensure() {
  if (ctx) return ctx;
  const AC =
    typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.5;
  master.connect(ctx.destination);
  return ctx;
}

export function resume() {
  const c = ensure();
  if (c && c.state === "suspended") c.resume();
}

export function isMuted() {
  return muted;
}

export function setMuted(m) {
  muted = !!m;
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {}
  if (master) master.gain.value = muted ? 0 : 0.5;
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

// Soft looping ambient pad: detuned sine/triangle voices through a lowpass
// filter, with a slow LFO breathing the gain.
export function startPad() {
  const c = ensure();
  if (!c || pad) return;
  const now = c.currentTime;
  const voices = [
    { type: "sine", freq: 110 },
    { type: "sine", freq: 164.81 },
    { type: "triangle", freq: 220 },
  ];
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.13, now + 2.5);
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.03;
  lfo.connect(lfoGain).connect(g.gain);
  const oscs = voices.map((v) => {
    const o = c.createOscillator();
    o.type = v.type;
    o.frequency.value = v.freq;
    o.connect(filter);
    o.start(now);
    return o;
  });
  filter.connect(g).connect(master);
  lfo.start(now);
  pad = { oscs, lfo, g, filter };
}

let lastStep = 0;
export function footstep() {
  const c = ensure();
  if (!c || muted) return;
  const now = c.currentTime;
  if (now - lastStep < 0.16) return;
  lastStep = now;
  const dur = 0.13;
  const buffer = c.createBuffer(
    1,
    Math.floor(c.sampleRate * dur),
    c.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filt = c.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 400;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.16, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(filt).connect(g).connect(master);
  src.start(now);
  src.stop(now + dur);
}

// Gentle chime when a memory finishes generating.
export function chime() {
  const c = ensure();
  if (!c || muted) return;
  const now = c.currentTime;
  [880, 1320, 1760].forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = c.createGain();
    const peak = 0.16 / (i + 1);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.02 + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    o.connect(g).connect(master);
    o.start(now);
    o.stop(now + 1.5);
  });
}

// Page-turn sound when a memory card opens.
export function pageTurn() {
  const c = ensure();
  if (!c || muted) return;
  const now = c.currentTime;
  const dur = 0.28;
  const buffer = c.createBuffer(
    1,
    Math.floor(c.sampleRate * dur),
    c.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filt = c.createBiquadFilter();
  filt.type = "bandpass";
  filt.Q.value = 1.5;
  filt.frequency.setValueAtTime(700, now);
  filt.frequency.linearRampToValueAtTime(2400, now + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.12, now + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(filt).connect(g).connect(master);
  src.start(now);
  src.stop(now + dur);
}