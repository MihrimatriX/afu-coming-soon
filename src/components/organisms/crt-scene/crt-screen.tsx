"use client";

import React, { useCallback, useEffect, useMemo, useRef, type FC } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { playHover, playSelect } from "./sfx";
import { crt, shock } from "./touch";

const W = 1024;
const H = 768;
const WARP = 0.07; // gölgelendiricideki bombe (barrel) katsayısıyla aynı olmalı

export type ScreenLink = { label: string; url: string };
// Ekrana yazılan metinler: başlık, altındaki satır, terminal kutusu ve alttaki durum satırı
export type ScreenText = { title: string; subtitle: string; tagline: string; status: string };

const BUTTONS = [
  { x: 186, y: 436, w: 318, h: 76 },
  { x: 520, y: 436, w: 318, h: 76 },
  { x: 186, y: 528, w: 318, h: 76 },
  { x: 520, y: 528, w: 318, h: 76 },
];
const PRESS_MS = 450; // seçilen düğmenin parlama süresi

// Gölgelendiricideki warp() ile aynı: ekranda görünen nokta → canvas'taki nokta
const warp = (u: number, v: number): [number, number] => {
  let cx = u * 2 - 1;
  let cy = v * 2 - 1;
  const k = 1 + (cx * cx + cy * cy) * WARP;
  cx *= k;
  cy *= k;
  return [cx * 0.5 + 0.5, cy * 0.5 + 0.5];
};

const hitTest = (u: number, v: number) => {
  const [tu, tv] = warp(u, v);
  const px = tu * W;
  const py = (1 - tv) * H;
  return BUTTONS.findIndex((b) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
};

const openLink = (url: string) => {
  if (url.startsWith("http")) window.open(url, "_blank", "noopener,noreferrer");
  else window.location.href = url;
};

// lvl: düğme başına 0..1 yumuşak "üstünde" değeri; pressed: şu an parlayan (seçilen) düğme
type Draw = { t: number; lvl: number[]; pressed: number; glitch: number; font: string; links: ScreenLink[]; text: ScreenText };

const draw = (x: CanvasRenderingContext2D, s: Draw) => {
  const bg = x.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 700);
  bg.addColorStop(0, "#0c2a17");
  bg.addColorStop(1, "#020604");
  x.fillStyle = bg;
  x.fillRect(0, 0, W, H);
  x.textAlign = "center";
  x.textBaseline = "middle";

  // Başlık: parlama + ara sıra RGB ayrışması / dilim kayması
  x.font = `800 132px ${s.font}`;
  x.letterSpacing = "6px";
  if (s.glitch > 0) {
    x.save();
    x.globalAlpha = 0.75;
    x.fillStyle = "#ff00ff";
    x.fillText(s.text.title, W / 2 + 9 * s.glitch, 172);
    x.fillStyle = "#00ffff";
    x.fillText(s.text.title, W / 2 - 9 * s.glitch, 172);
    x.restore();
  }
  x.shadowColor = "rgba(74,222,128,.95)";
  x.shadowBlur = 30;
  x.fillStyle = "#4ade80";
  if (s.glitch > 0) {
    // iki yatay şerit kaydırılır
    for (const [y0, hh, dx] of [
      [110, 26, 22],
      [186, 22, -18],
    ] as const) {
      x.save();
      x.beginPath();
      x.rect(0, y0, W, hh);
      x.clip();
      x.fillText(s.text.title, W / 2 + dx * s.glitch, 172);
      x.restore();
    }
  }
  x.fillText(s.text.title, W / 2, 172);
  x.shadowBlur = 0;

  x.font = `600 44px ${s.font}`;
  x.letterSpacing = "8px";
  x.shadowColor = "rgba(134,239,172,.6)";
  x.shadowBlur = 14;
  x.fillStyle = "#86efac";
  x.fillText(s.text.subtitle.toLocaleUpperCase("tr"), W / 2, 268);
  x.shadowBlur = 0;

  // Terminal kutusu
  x.fillStyle = "rgba(17,24,39,.85)";
  x.fillRect(212, 312, 600, 78);
  x.shadowColor = "rgba(34,197,94,.9)";
  x.shadowBlur = 22;
  x.strokeStyle = "rgba(34,197,94,.75)";
  x.lineWidth = 3;
  x.strokeRect(212, 312, 600, 78);
  x.font = `700 29px "Courier New", monospace`;
  x.letterSpacing = "4px";
  x.fillStyle = "#22c55e";
  x.fillText(s.text.tagline, W / 2, 352);
  x.shadowBlur = 0;

  // Terminal menüsü: numara rozeti + etiket. Üstüne gelince ters renk (dolu yeşil), seçince beyaz parlar.
  x.font = `700 30px "Courier New", monospace`;
  x.letterSpacing = "3px";
  x.lineWidth = 2;
  s.links.forEach((l, i) => {
    const b = BUTTONS[i];
    const a = s.lvl[i];
    const hit = i === s.pressed;
    const inv = hit || a > 0.5; // dolu zeminde koyu yazı
    const cy = b.y + b.h / 2 + 1;
    x.fillStyle = "rgba(0,0,0,.45)";
    x.fillRect(b.x, b.y, b.w, b.h);
    if (a > 0.01 || hit) {
      x.shadowColor = "rgba(74,222,128,.95)";
      x.shadowBlur = hit ? 44 : 30 * a;
      x.globalAlpha = hit ? 1 : a;
      x.fillStyle = hit ? "#ecfdf5" : "#4ade80";
      x.fillRect(b.x, b.y, b.w, b.h);
      x.globalAlpha = 1;
      x.shadowBlur = 0;
    }
    x.strokeStyle = inv ? "#d1fae5" : "rgba(74,222,128,.6)";
    x.strokeRect(b.x, b.y, b.w, b.h);
    // numara rozeti: klavyedeki tuşun karşılığı
    x.fillStyle = inv ? "#052e16" : "rgba(74,222,128,.16)";
    x.fillRect(b.x + 15, b.y + 15, 46, 46);
    x.strokeStyle = inv ? "#052e16" : "rgba(74,222,128,.7)";
    x.strokeRect(b.x + 15, b.y + 15, 46, 46);
    x.textAlign = "center";
    x.fillStyle = inv ? "#4ade80" : "#d1fae5";
    x.fillText(String(i + 1), b.x + 39, cy);
    x.textAlign = "left";
    x.fillStyle = inv ? "#052e16" : "#a7f3d0";
    x.fillText(l.label, b.x + 80, cy);
    if (inv && !hit && s.t % 0.8 < 0.5) x.fillText("▶", b.x + b.w - 44, cy);
  });

  x.textAlign = "center";
  x.font = `700 24px "Courier New", monospace`;
  x.letterSpacing = "1px";
  x.fillStyle = "rgba(74,222,128,.7)";
  x.fillText(`${s.text.status}${s.t % 1 < 0.55 ? " _" : ""}`, W / 2, 648);
  x.font = `700 20px "Courier New", monospace`;
  x.letterSpacing = "3px";
  x.fillStyle = "rgba(74,222,128,.62)";
  x.fillText("SEÇMEK İÇİN 1-4 TUŞLARI VEYA TIKLA", W / 2, 690);
};

// Camın bombeli geometrisi: merkez öne doğru şişer, kenarlar yerinde kalır
const bulged = (w: number, h: number, bulge: number) => {
  const g = new THREE.PlaneGeometry(w, h, 96, 72);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const nx = p.getX(i) / (w / 2);
    const ny = p.getY(i) / (h / 2);
    p.setZ(i, bulge * (1 - (nx * nx + ny * ny) / 2));
  }
  g.computeVertexNormals();
  return g;
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uBoot;
  uniform float uBright;
  uniform float uContrast;
  uniform float uShock;
  varying vec2 vUv;
  const float K = ${WARP.toFixed(3)};

  vec2 warp(vec2 uv) {
    vec2 c = uv * 2.0 - 1.0;
    c *= 1.0 + dot(c, c) * K;
    return c * 0.5 + 0.5;
  }
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    if (uBoot < 0.002) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    // açılış: tek çizgiden dikeyde genişleme
    float open = smoothstep(0.12, 0.7, uBoot);
    if (abs(vUv.y - 0.5) > mix(0.004, 0.5, open)) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    vec2 uv = warp(vUv);
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // aşağı doğru kayan tazeleme bandı, hafif yatay dalgalanma
    float d = uv.y - (1.0 - fract(uTime * 0.09));
    uv.x += exp(-d * d * 900.0) * 0.002 * sin(uTime * 40.0 + uv.y * 30.0);
    uv.x += 0.00012 * sin(uv.y * 400.0 + uTime * 30.0);

    // elektrik çarpması: yatay yırtılma ve renk kayması
    float tear = hash(vec2(floor(uv.y * 48.0), floor(uTime * 40.0)));
    uv.x += (tear - 0.5) * 0.07 * uShock * step(0.55, tear);
    float ca = 0.0006 + uShock * 0.012;
    vec3 col = vec3(
      texture2D(uMap, uv + vec2(ca, 0.0)).r,
      texture2D(uMap, uv).g,
      texture2D(uMap, uv - vec2(ca, 0.0)).b
    );

    // fosfor ışıması: çevredeki pikselleri karıştır
    vec3 glow = vec3(0.0);
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.7854;
      glow += texture2D(uMap, uv + vec2(cos(a), sin(a)) * 0.006).rgb;
    }
    col += glow * 0.065;
    col = pow(max(col, vec3(0.0)), vec3(1.0 / uContrast));
    col *= 1.0 + uShock * (hash(vec2(uTime, 7.0)) * 1.8 - 0.4);

    // tarama çizgileri ve fosfor maskesi
    col *= 0.88 + 0.12 * sin(vUv.y * 190.0 * 6.2831853);
    float m = vUv.x * 250.0 * 6.2831853;
    col *= vec3(1.0) - 0.035 * vec3(cos(m), cos(m + 2.094), cos(m + 4.188));

    col *= 1.0 + 0.025 * sin(uTime * 55.0) + 0.02 * (hash(vec2(floor(uTime * 24.0), 3.0)) - 0.5);
    vec2 c = vUv * 2.0 - 1.0;
    col *= 1.0 - 0.3 * dot(c, c);
    col += (hash(vUv * vec2(1024.0, 768.0) + fract(uTime)) - 0.5) * 0.006;
    col *= 1.0 + (1.0 - open) * 1.2;

    // kapanırken çizgi de sönsün
    gl_FragColor = vec4(col * 1.25 * uBright * smoothstep(0.0, 0.08, uBoot), 1.0);
  }
`;

type Props = {
  links: ScreenLink[];
  text: ScreenText;
  position: [number, number, number];
  size: [number, number];
  bulge?: number;
  power: boolean;
  bright: number;
  contrast: number;
};

export const CrtScreen: FC<Props> = ({ links, text, position, size, bulge = 0.012, power, bright, contrast }) => {
  const [sw, sh] = size;
  const geo = useMemo(() => bulged(sw, sh, bulge), [sw, sh, bulge]);
  const { ctx, tex, uniforms } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return {
      ctx: canvas.getContext("2d")!,
      tex,
      uniforms: {
        uMap: { value: tex },
        uTime: { value: 0 },
        uBoot: { value: 0 },
        uBright: { value: 1 },
        uContrast: { value: 1 },
        uShock: { value: 0 },
      },
    };
  }, []);

  const hover = useRef(-1);
  const lvl = useRef([0, 0, 0, 0]);
  const flash = useRef({ i: -1, until: 0 });
  // seçim: düğme beyaz parlar, bip çalar, bağlantı açılır
  const select = useCallback(
    (i: number) => {
      flash.current = { i, until: performance.now() + PRESS_MS };
      playSelect();
      openLink(links[i].url);
    },
    [links],
  );
  const glitch = useRef({ until: 0, next: 2 });
  const last = useRef(-1);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const boot = useRef(0);
  // olay dinleyicileri en güncel değeri okusun
  const on = useRef(power);
  on.current = power;
  const font = useRef('"Space Grotesk", sans-serif');

  useEffect(() => {
    // next/font'un ürettiği gerçek yazı tipi adı CSS değişkeninde durur
    const fam = getComputedStyle(document.documentElement).getPropertyValue("--font-space-grotesk").trim();
    if (fam) font.current = fam;
    document.fonts.load(`800 100px ${font.current}`).catch(() => undefined);

    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (on.current && i >= 0 && i < links.length && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat) select(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [links, select]);

  useEffect(() => () => tex.dispose(), [tex]);

  useFrame((state, rawDt) => {
    const t = state.clock.elapsedTime;
    // R3F uniforms nesnesini kopyalar: değerleri materyalin kendi uniform'larına yazmalıyız
    const u = mat.current?.uniforms;
    if (u) {
      // açılış 1.6 sn sürer, kapanış çabuk: çizgiye çöküp söner
      boot.current = Math.min(1, Math.max(0, boot.current + (power ? rawDt / 1.6 : -rawDt / 0.35)));
      crt.boot = boot.current;
      u.uTime.value = t;
      u.uBoot.value = boot.current;
      u.uBright.value = bright;
      u.uContrast.value = contrast;
      u.uShock.value = shock.t > 0 ? 1 : 0;
    }

    // ara sıra 0.18 sn'lik ekran arızası
    if (t > glitch.current.next) {
      glitch.current = { until: t + 0.18, next: t + 3 + Math.random() * 5 };
    }
    // düğmeler üstüne gelince ~0.1 sn'de dolar, ayrılınca söner
    const k = Math.min(1, rawDt * 14);
    lvl.current.forEach((v, i) => void (lvl.current[i] = v + ((i === hover.current ? 1 : 0) - v) * k));
    // içerik ~24 kare/sn'de yeniden çizilir
    if (t - last.current < 1 / 24) return;
    last.current = t;
    draw(ctx, {
      t,
      lvl: lvl.current,
      pressed: flash.current.until > performance.now() ? flash.current.i : -1,
      glitch: t < glitch.current.until || shock.t > 0 ? Math.random() : 0,
      font: font.current,
      links,
      text,
    });
    tex.needsUpdate = true;
  });

  const pick = (e: { uv?: THREE.Vector2 }) => (e.uv ? hitTest(e.uv.x, e.uv.y) : -1);

  return (
    <group position={position}>
      <mesh
        geometry={geo}
        onPointerMove={(e) => {
          const i = on.current ? pick(e) : -1;
          if (i >= 0 && i !== hover.current) playHover();
          hover.current = i;
        }}
        onPointerOut={() => {
          hover.current = -1;
        }}
        onClick={(e) => {
          const i = on.current ? pick(e) : -1;
          if (i >= 0) select(i);
        }}
      >
        <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} toneMapped={false} />
      </mesh>
      {/* Cam: yalnızca ortamın yansımasını üstüne ekler (ekle-karıştır) */}
      <mesh geometry={geo} position-z={0.0012} raycast={() => null} userData={{ noShadow: true }}>
        <meshPhysicalMaterial
          color="#000000"
          roughness={0.04}
          metalness={0}
          envMapIntensity={1.8}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
