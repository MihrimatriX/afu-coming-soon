import { useCallback, useEffect, useRef, useState } from "react";

// Floresan vızıltısı: 50 Hz şebekede balast 100 Hz ve katlarında titreşir.
// Üstüne seyrek, hızla sönen gürültü patlamaları → cızırtı.
const createHum = (): AudioContext => {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.04;
  master.connect(ctx.destination);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 600;
  lowpass.connect(master);

  for (const [freq, level] of [
    [100, 0.5],
    [200, 0.3],
    [300, 0.12],
  ]) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = level;
    osc.connect(gain).connect(lowpass);
    osc.start();
  }

  const length = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    if (Math.random() < 0.0004) {
      const burst = Math.floor(200 + Math.random() * 1500);
      for (let j = 0; j < burst && i + j < length; j++) {
        data[i + j] = (Math.random() * 2 - 1) * (1 - j / burst);
      }
      i += burst;
    }
  }

  const crackle = ctx.createBufferSource();
  crackle.buffer = buffer;
  crackle.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2500;
  band.Q.value = 0.8;
  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.35;
  crackle.connect(band).connect(crackleGain).connect(master);
  crackle.start();

  return ctx;
};

// Tarayıcılar sesi ancak kullanıcı etkileşimiyle başlatır; bu yüzden varsayılan kapalı.
export const useFluorescentHum = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const [on, setOn] = useState(false);

  const toggle = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
      setOn(false);
    } else {
      ctxRef.current = createHum();
      setOn(true);
    }
  }, []);

  useEffect(() => () => void ctxRef.current?.close(), []);

  return { on, toggle };
};
