"use client";

import React, { useEffect, useRef, useState, type FC } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Title } from "@/components/atoms/title";
import { CrtMonitor } from "@/components/organisms/crt-monitor";
import { ScreenEffects } from "@/components/organisms/screen-effects";
import { CustomCursor } from "@/components/organisms/custom-cursor";
import styles from "./not-found-screen.module.css";

// Terminal günlüğü: satırlar sırayla yazılır (ms cinsinden gecikme)
const LOG_STEP = 550;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Kanal yokken ekranı dolduran kar (TV statiği). Düşük çözünürlüklü canvas, CSS ile büyütülür.
const Static: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const img = ctx.createImageData(canvas.width, canvas.height);
    const draw = () => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };

    draw();
    if (reducedMotion()) return;
    // ~20 kare/sn yeterince "karlı"; her karede çizmek gereksiz yük
    const id = setInterval(draw, 50);
    return () => clearInterval(id);
  }, []);

  return <canvas ref={ref} className={styles.static} width={160} height={120} aria-hidden="true" />;
};

export const NotFoundScreen: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [shown, setShown] = useState(0);

  const log = [
    `GET ${pathname}`,
    "HATA 404 : KANAL BULUNAMADI",
    "ANTEN AYARLANIYOR ....... BAŞARISIZ",
    "ANA KANALA DÖNMEK İÇİN [ENTER]",
  ];

  useEffect(() => {
    if (reducedMotion()) {
      setShown(log.length);
      return;
    }
    const timers = log.map((_, i) => setTimeout(() => setShown(i + 1), 700 + i * LOG_STEP));
    return () => timers.forEach(clearTimeout);
    // satır sayısı sabit; yol değişse bile animasyonu baştan oynatmaya gerek yok
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Klavyeden ENTER: ana sayfaya dön (bağlantı ya da düğme odaktaysa onların kendi davranışı çalışır)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented) return;
      if ((e.target as HTMLElement).closest("a, button, input, textarea")) return;
      router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      <CustomCursor />
      <CrtMonitor>
        <Static />
        <ScreenEffects />
        <main className={styles.main}>
          <div className={styles.osd} aria-hidden="true">
            <span>KANAL 404</span>
            <span className={styles.noSignal}>● SİNYAL YOK</span>
          </div>
          <div className={styles.content}>
            <Title variant="main" className={styles.code}>
              404
            </Title>
            <p className={styles.subtitle}>Sayfa bulunamadı</p>
            <div className={styles.terminal} role="log" aria-live="polite">
              {log.slice(0, shown).map((line, i) => (
                <p key={i} className={`${styles.line} ${i === 1 ? styles.error : ""}`}>
                  <span className={styles.prompt}>&gt;</span>
                  <span className={styles.text}>{line}</span>
                </p>
              ))}
              <p className={styles.line} aria-hidden="true">
                <span className={styles.prompt}>&gt;</span>
                <span className={styles.cursor}>_</span>
              </p>
            </div>
            <Link href="/" className={styles.home}>
              <i className="fas fa-home" aria-hidden="true" />
              <span>ANA SAYFAYA DÖN</span>
            </Link>
          </div>
        </main>
      </CrtMonitor>
    </>
  );
};
