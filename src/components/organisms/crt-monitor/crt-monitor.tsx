"use client";

import React, { type FC, type ReactNode } from "react";
import { CrtTube } from "@/components/organisms/screen-effects";
import { useFluorescentHum } from "@/hooks/use-fluorescent-hum";
import styles from "./crt-monitor.module.css";
import d from "./desk.module.css";

// Ekim 1987 (1 Ekim perşembe; hafta pazartesi başlar → 3 boş gün)
const CAL_OFFSET = 3;
const CAL_DAYS = 31;

// 3B kutu: ön yüz opsiyonel (ana kasanın önü gerçek içerik olduğu için orada çizilmez).
// data-face, masa eşyalarının yüzlerini CSS'te seçebilmek için.
const Box: FC<{ className: string; front?: boolean; shadow?: boolean }> = ({ className, front, shadow }) => (
  <div className={`${styles.box} ${className}`} aria-hidden="true">
    {front && <div className={styles.faceFront} data-face="front" />}
    <div className={styles.faceBack} data-face="back" />
    <div className={styles.faceLeft} data-face="left" />
    <div className={styles.faceRight} data-face="right" />
    <div className={styles.faceTop} data-face="top" />
    <div className={styles.faceBottom} data-face="bottom" />
    {shadow && <div data-face="shadow" />}
  </div>
);

// Masadaki defterin el yazısı (CSS'te white-space: pre-line)
const NOTE = ["yakında!", "yeni site", "- tasarım ✓", "- kod ..."].join("\n");

const item = (name: string, ...more: string[]) => [d.item, name, ...more].join(" ");

// Masa, duvar ve masa üstü; mobilde tamamen gizlenir
const Desk: FC = () => (
  <div className={d.props} aria-hidden="true">
    <div className={d.wall} />
    <div className={`${d.flat} ${d.surface}`} />
    <div className={d.edge} />
    {/* viewBox: x = (x+1.5)*100, y = (z+1.2)*100 → klavye/mouse/priz kabloları */}
    <svg className={`${d.flat} ${d.cables}`} viewBox="0 0 300 170" preserveAspectRatio="none">
      <path d="M150 134C150 124 156 120 160 116" />
      <path d="M206 137C206 125 190 124 180 116" />
      <path d="M160 56C170 38 200 44 213 27" />
    </svg>
    <div className={`${d.flat} ${d.pad}`} />
    <div className={`${d.flat} ${d.notepad}`}>{NOTE}</div>
    <Box className={item(d.strip)} front shadow />
    <Box className={item(d.book, d.book1)} front shadow />
    <Box className={item(d.book, d.book2)} front />
    <Box className={item(d.book, d.book3)} front />
    <Box className={item(d.keyboard)} front shadow />
    <Box className={item(d.mouse)} front />
    <Box className={item(d.pencil)} front />
    <Box className={item(d.floppy)} front shadow />
    <Box className={item(d.floppy, d.floppy2)} front />
    <Box className={item(d.cassette)} front shadow />
    <div className={d.mug}>
      <span className={d.steam} />
      <span className={d.steam} />
      <span className={d.steam} />
    </div>
  </div>
);

export const CrtMonitor: FC<{ children: ReactNode }> = ({ children }) => {
  const hum = useFluorescentHum();

  return (
    <div className={styles.scene}>
      <div className={styles.calendar} aria-hidden="true">
        <div className={styles.calHead}>EKİM 1987</div>
        <div className={styles.calGrid}>
          {"PSÇPCCP".split("").map((day, i) => (
            <b key={`h${i}`}>{day}</b>
          ))}
          {Array.from({ length: CAL_OFFSET }, (_, i) => (
            <span key={`e${i}`} />
          ))}
          {Array.from({ length: CAL_DAYS }, (_, i) => (
            <span key={i} className={i === 0 ? styles.circled : undefined}>
              {i + 1}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.fluoLight} aria-hidden="true" />
      <div className={styles.fluo} aria-hidden="true">
        <span className={styles.fluoTube} />
      </div>
      <button type="button" className={styles.soundToggle} onClick={hum.toggle} aria-pressed={hum.on}>
        <i className={`fas ${hum.on ? "fa-volume-high" : "fa-volume-xmark"}`} aria-hidden="true" />
        ORTAM SESİ: {hum.on ? "AÇIK" : "KAPALI"}
      </button>
      <div className={styles.rig}>
        {/* Kamera hiç arkaya geçmediği için ön yüz her zaman en öndedir: en son çizilir */}
        <Desk />
        <Box className={styles.shell} />
        <Box className={styles.hood} />
        <Box className={styles.tail} />
        <Box className={styles.neck} front />
        <Box className={styles.base} front />
        <div className={styles.floorShadow} aria-hidden="true" />
        <div className={styles.front}>
          <div className={styles.bezel}>
            <div className={styles.screen}>
              <CrtTube className={styles.tube}>{children}</CrtTube>
            </div>
          </div>
          <div className={styles.chin} aria-hidden="true">
            <span className={styles.badge}>AFU-80</span>
            <span className={styles.grille} />
            <span className={styles.panel}>
              <span className={styles.knob} />
              <span className={styles.knob} />
              <span className={styles.power} />
              <span className={styles.led} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
