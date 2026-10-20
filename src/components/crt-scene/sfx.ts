// Sahnenin bütün sesleri. Ses dosyası yok, hepsi Web Audio ile üretilir.
// Tek AudioContext paylaşılır: her tuş vuruşunda yenisini açmak hem yavaş hem tarayıcı sınırına takılır.
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;

const VOLUME = 0.8; // genel ses ayarı

const audio = () => {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      out = ctx.createGain();
      out.gain.value = VOLUME;
      out.connect(ctx.destination);
    }
  } catch {
    return null;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

// 1 sn beyaz gürültü; tıklar bunun rastgele bir diliminden kesilir, her vuruş biraz farklı çıkar
const noiseBuf = (c: AudioContext) => {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noise;
};

type Burst = { f: number; q?: number; type?: BiquadFilterType; gain: number; dur: number };
// Filtrelenmiş kısa gürültü: plastik tık, yay çıtırtısı, statik cızırtı
const burst = (c: AudioContext, at: number, { f, q = 1, type = "bandpass", gain, dur }: Burst) => {
  const src = c.createBufferSource();
  src.buffer = noiseBuf(c);
  const fl = c.createBiquadFilter();
  fl.type = type;
  fl.frequency.value = f;
  fl.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(fl).connect(g).connect(out!);
  src.start(at, Math.random() * 0.8, dur + 0.02);
};

type Tone = { f: number; f2?: number; type?: OscillatorType; gain: number; dur: number };
// Kısa ton: tok gövde vuruşu ya da bip
const tone = (c: AudioContext, at: number, { f, f2 = f, type = "sine", gain, dur }: Tone) => {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, at);
  o.frequency.exponentialRampToValueAtTime(f2, at + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out!);
  o.start(at);
  o.stop(at + dur + 0.02);
};

// Klavye tuşu. down: basış (yay + tuşun dibe vurması), değilse bırakış (daha hafif, tiz).
// big: boşluk, enter gibi geniş tuşlar daha tok çıkar.
export const playKey = (down: boolean, big = false) => {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const v = 0.85 + Math.random() * 0.3;
  if (down) {
    burst(c, t, { f: (big ? 1900 : 3200) * v, q: 1.3, gain: 0.32, dur: 0.03 });
    tone(c, t + 0.004, { f: (big ? 170 : 290) * v, f2: (big ? 95 : 170) * v, gain: big ? 0.3 : 0.18, dur: 0.055 });
  } else {
    burst(c, t, { f: 4400 * v, q: 1.6, gain: 0.1, dur: 0.018 });
  }
};

// Monitörün güç tuşu: tok mekanik "klak". Açılışta tüpün "tunk"u ve camdaki statik cızırtı,
// kapanışta sönen tiz ıslık.
export const playPower = (on: boolean) => {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  burst(c, t, { f: 1500, q: 0.9, gain: 0.35, dur: 0.045 });
  tone(c, t, { f: 120, f2: 70, gain: 0.3, dur: 0.08 });
  if (on) {
    tone(c, t + 0.07, { f: 62, f2: 55, type: "triangle", gain: 0.28, dur: 0.6 });
    burst(c, t + 0.09, { f: 4500, type: "highpass", gain: 0.09, dur: 0.7 });
  } else {
    tone(c, t + 0.02, { f: 2400, f2: 400, gain: 0.04, dur: 0.3 });
  }
};

// Ayar düğmesi: tek kademe atlayan tırtıklı tık
export const playKnob = () => {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  burst(c, t, { f: 5200, q: 3, gain: 0.22, dur: 0.012 });
  burst(c, t + 0.028, { f: 3800, q: 3, gain: 0.14, dur: 0.012 });
};

// Ekrandaki menü: seçince PC hoparlörü bipi (iki nota), üstüne gelince kısa tık
export const playSelect = () => {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  tone(c, t, { f: 988, type: "square", gain: 0.05, dur: 0.07 });
  tone(c, t + 0.075, { f: 1976, type: "square", gain: 0.05, dur: 0.1 });
};

export const playHover = () => {
  const c = audio();
  if (!c) return;
  tone(c, c.currentTime, { f: 2600, type: "square", gain: 0.018, dur: 0.012 });
};

// Elektrik çarpması: 50 Hz şebeke vızıltısı (distorsiyonlu), rastgele kesilip açılan akım
// ve seyrek kıvılcım çıtırtıları.
export const playZap = () => {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const dur = 1.2;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.3, t + 0.012);
  master.gain.setValueAtTime(0.3, t + dur - 0.2);
  master.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  master.connect(out!);

  // vızıltı: testere dişi + kare dalga, sert kırpılmış
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(((i / 1023) * 2 - 1) * 6);
  shaper.curve = curve;
  const gate = ctx.createGain();
  // akım rastgele kesilip gelir
  for (let s = 0; s < dur; s += 0.025) gate.gain.setValueAtTime(Math.random() < 0.25 ? 0.08 : 0.5 + Math.random() * 0.5, t + s);
  shaper.connect(gate).connect(master);
  for (const [type, f] of [
    ["sawtooth", 100],
    ["square", 150],
  ] as const) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.frequency.linearRampToValueAtTime(f * 0.94, t + dur);
    const g = ctx.createGain();
    g.gain.value = type === "sawtooth" ? 0.6 : 0.25;
    o.connect(g).connect(shaper);
    o.start(t);
    o.stop(t + dur);
  }

  // çıtırtı: seyrek gürültü patlamaları, tiz
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    if (Math.random() < 0.003) {
      const b = Math.floor(40 + Math.random() * 400);
      for (let j = 0; j < b && i + j < len; j++) d[i + j] = (Math.random() * 2 - 1) * (1 - j / b);
      i += b;
    }
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const ng = ctx.createGain();
  ng.gain.value = 0.9;
  noise.connect(hp).connect(ng).connect(master);
  noise.start(t);
};
