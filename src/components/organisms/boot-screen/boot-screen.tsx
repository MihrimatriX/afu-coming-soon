"use client";

import React, { useEffect, useState, useSyncExternalStore, type FC } from "react";
import { bootProgress, bootRatio } from "./boot-progress";
import styles from "./boot-screen.module.css";

const BAR = 28;

// Satır: etiket ....... durum
const Line: FC<{ label: string; status?: string; done?: boolean }> = ({ label, status, done }) => (
  <p className={styles.line}>
    <span>{label}</span>
    <span className={styles.dots} />
    <span className={done ? styles.ok : styles.busy}>{done ? "[ OK ]" : status}</span>
  </p>
);

// 3B sahne hazırlanırken gösterilen retro BIOS açılış ekranı. İlerleme gerçek aşamalardan gelir.
export const BootScreen: FC<{ active: boolean }> = ({ active }) => {
  const b = useSyncExternalStore(bootProgress.subscribe, bootProgress.get, bootProgress.get);
  const [mem, setMem] = useState(0);
  const [phase, setPhase] = useState<"boot" | "exit" | "done">("boot");

  // bellek testi sayacı: 0 → 640K
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / 900);
      setMem(Math.round(k * 640));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // hazır olunca kısa bir bekleme, sonra tüp kapanır gibi çıkış
  useEffect(() => {
    if (!b.ready || phase !== "boot") return;
    const t = setTimeout(() => setPhase("exit"), 450);
    return () => clearTimeout(t);
  }, [b.ready, phase]);
  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => setPhase("done"), 750);
    return () => clearTimeout(t);
  }, [phase]);

  // bir şey takılırsa kullanıcı sonsuza dek beklemesin
  useEffect(() => {
    const t = setTimeout(() => setPhase((p) => (p === "boot" ? "exit" : p)), 60000);
    return () => clearTimeout(t);
  }, []);

  if (!active || phase === "done") return null;

  const ratio = bootRatio(b);
  const filled = Math.round(ratio * BAR);
  const [td, tt] = b.textures;
  const [sd, st] = b.shaders;

  return (
    <div className={`${styles.boot} ${phase === "exit" ? styles.exit : ""}`} role="status" aria-live="polite">
      <div className={styles.screen}>
        <header className={styles.head}>
          <span>AFU-80 BIOS v1.87</span>
          <span>(C) 1987 AFU COMPUTING</span>
        </header>
        <p className={styles.line}>CPU : AFU-8088 @ 4.77 MHz</p>
        <p className={styles.line}>
          BELLEK TESTİ : {mem}K {mem === 640 && <span className={styles.ok}>OK</span>}
        </p>
        <br />
        <Line label="Çekirdek yükleniyor" status="..." done={b.kernel} />
        {b.kernel && <Line label="Dokular işleniyor" status={tt ? `${td}/${tt}` : "..."} done={tt > 0 && td === tt} />}
        {tt > 0 && td === tt && (
          <Line label="Gölgelendiriciler derleniyor" status={st ? `${sd}/${st}` : "..."} done={st > 0 && sd === st} />
        )}
        {st > 0 && sd === st && <Line label="Tüp ısınıyor" status="..." done={b.ready} />}
        <br />
        <p className={styles.bar} aria-label={`Yükleniyor %${Math.round(ratio * 100)}`}>
          [{"█".repeat(filled)}
          <span className={styles.empty}>{"░".repeat(BAR - filled)}</span>] {Math.round(ratio * 100)}%
        </p>
        <p className={styles.line}>
          {b.ready ? "SİSTEM HAZIR" : "Lütfen bekleyin"}
          <span className={styles.cursor}>_</span>
        </p>
      </div>
    </div>
  );
};
