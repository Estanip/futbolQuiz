/** Sonidos procedurales con Web Audio (sin archivos externos). */

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function tone(freq, duration, type = 'sine', gain = 0.08, slideTo = null) {
  const audio = getCtx();
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), now + duration);
  }
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function noiseBurst(duration = 0.12, gain = 0.05) {
  const audio = getCtx();
  const now = audio.currentTime;
  const length = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const src = audio.createBufferSource();
  const g = audio.createGain();
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1400;
  src.buffer = buffer;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(audio.destination);
  src.start(now);
}

export const sfx = {
  unlock() {
    getCtx();
  },

  click() {
    tone(520, 0.06, 'triangle', 0.05);
  },

  correct() {
    tone(523, 0.1, 'sine', 0.07);
    setTimeout(() => tone(659, 0.1, 'sine', 0.07), 80);
    setTimeout(() => tone(784, 0.16, 'sine', 0.08), 160);
  },

  wrong() {
    tone(220, 0.22, 'sawtooth', 0.05, 110);
  },

  whistle() {
    tone(1800, 0.18, 'sine', 0.04);
    setTimeout(() => tone(1900, 0.28, 'sine', 0.05), 120);
  },

  kick() {
    noiseBurst(0.1, 0.07);
    tone(120, 0.12, 'triangle', 0.06, 60);
  },

  goal() {
    tone(392, 0.12, 'square', 0.05);
    setTimeout(() => tone(523, 0.12, 'square', 0.05), 100);
    setTimeout(() => tone(659, 0.12, 'square', 0.05), 200);
    setTimeout(() => tone(784, 0.28, 'square', 0.06), 320);
    setTimeout(() => noiseBurst(0.25, 0.04), 100);
  },

  save() {
    noiseBurst(0.18, 0.08);
    tone(180, 0.2, 'triangle', 0.05, 90);
  },

  tick() {
    tone(880, 0.04, 'square', 0.03);
  },

  gameOver() {
    tone(330, 0.2, 'sawtooth', 0.05, 200);
    setTimeout(() => tone(247, 0.35, 'sawtooth', 0.05, 140), 180);
  },

  win() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => tone(f, 0.18, 'sine', 0.07), i * 120);
    });
  },
};
