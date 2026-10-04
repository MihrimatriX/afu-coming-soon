import * as THREE from "three";
import { buildKeys, KB_W } from "./keyboard-layout";

// Sahnedeki bütün yüzeyler kod ile üretilir: harici resim/model dosyası yok.

type C2 = CanvasRenderingContext2D;

const make = (w: number, h: number): [HTMLCanvasElement, C2] => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
};

// Tekrarlanabilir rastgelelik: sahne her açılışta aynı görünsün
const rand = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const toTex = (c: HTMLCanvasElement, o: { color?: boolean; repeat?: [number, number] } = {}) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = o.color === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = 16;
  if (o.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...o.repeat);
  }
  return t;
};

const HAND = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';
const MONO = '"Courier New", Consolas, monospace';

const roundRect = (x: C2, px: number, py: number, w: number, h: number, r: number) => {
  x.beginPath();
  x.roundRect(px, py, w, h, r);
};

/* ---------- Ahşap: 4 tahta, uzun damarlar, tahta birleşimleri ---------- */
export const woodMaps = () => {
  const W = 3072;
  const H = 768;
  const PLANKS = 4;
  const PH = H / PLANKS;
  const r = rand(7);
  const [c, x] = make(W, H);
  const [g, gx] = make(W, H);
  gx.fillStyle = "#8c8c8c";
  gx.fillRect(0, 0, W, H);

  for (let p = 0; p < PLANKS; p++) {
    const y0 = p * PH;
    const tone = 0.8 + r() * 0.4;
    x.fillStyle = `rgb(${Math.round(96 * tone)},${Math.round(62 * tone)},${Math.round(38 * tone)})`;
    x.fillRect(0, y0, W, PH);

    for (let i = 0; i < 220; i++) {
      const dark = r() < 0.7;
      const a = 0.05 + r() * 0.2;
      const th = 0.6 + r() * 2.8;
      let y = y0 + r() * PH;
      const pts: [number, number][] = [];
      for (let px = 0; px <= W; px += 64) {
        y += (r() - 0.5) * 1.4;
        pts.push([px, y + Math.sin(px * 0.003 + p * 2) * 4]);
      }
      const draw = (ctx: C2, style: string) => {
        ctx.strokeStyle = style;
        ctx.lineWidth = th;
        ctx.beginPath();
        pts.forEach(([px, py], k) => (k ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.stroke();
      };
      draw(x, dark ? `rgba(28,14,6,${a})` : `rgba(176,124,78,${a * 0.7})`);
      draw(gx, dark ? `rgba(0,0,0,${a * 1.4})` : `rgba(255,255,255,${a * 0.5})`);
    }

    // tahta birleşimi: koyu çizgi + altında ince ışık
    x.fillStyle = "rgba(10,5,2,.85)";
    x.fillRect(0, y0, W, 2.5);
    x.fillStyle = "rgba(255,220,180,.10)";
    x.fillRect(0, y0 + 2.5, W, 1.5);
    gx.fillStyle = "rgba(0,0,0,.9)";
    gx.fillRect(0, y0, W, 3);
  }

  // iki budak
  for (const [kx, ky] of [
    [W * 0.27, H * 0.37],
    [W * 0.71, H * 0.83],
  ]) {
    for (let k = 6; k > 0; k--) {
      x.strokeStyle = `rgba(30,14,6,${0.1 + (6 - k) * 0.05})`;
      x.lineWidth = 2;
      x.beginPath();
      x.ellipse(kx, ky, k * 9, k * 4.2, 0, 0, Math.PI * 2);
      x.stroke();
    }
  }
  return { map: toTex(c), bump: toTex(g, { color: false }) };
};

/* ---------- Duvar kağıdı ---------- */
export const wallpaperMap = () => {
  const S = 1024;
  const P = 128;
  const r = rand(11);
  const [c, x] = make(S, S);
  for (let i = 0; i < S / P; i++) {
    x.fillStyle = "#1d2720";
    x.fillRect(i * P, 0, P, S);
    x.fillStyle = "#243128";
    x.fillRect(i * P + P * 0.14, 0, P * 0.72, S);
    x.fillStyle = "rgba(255,255,255,.06)";
    x.fillRect(i * P + P * 0.14, 0, 2, S);
    x.fillStyle = "rgba(0,0,0,.35)";
    x.fillRect(i * P + P * 0.86 - 2, 0, 2, S);
  }
  // şeritlerin ortasında elmas motifler
  x.fillStyle = "rgba(196,216,196,.09)";
  for (let i = 0; i < S / P; i++) {
    for (let j = 0; j < S / 64; j++) {
      const cx = i * P + P / 2;
      const cy = j * 64 + 32;
      x.beginPath();
      x.moveTo(cx, cy - 9);
      x.lineTo(cx + 6, cy);
      x.lineTo(cx, cy + 9);
      x.lineTo(cx - 6, cy);
      x.fill();
    }
  }
  for (let i = 0; i < 9000; i++) {
    x.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "0,0,0"},${r() * 0.04})`;
    x.fillRect(r() * S, r() * S, 2, 2);
  }
  return toTex(c, { repeat: [7, 3] });
};

/* ---------- Plastik gren: küçük yüzey pürüzü (bump) ---------- */
export const grainBump = () => {
  const [c, x] = make(256, 256);
  const r = rand(3);
  const img = x.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) {
    const v = 110 + r() * 60;
    img.data.set([v, v, v, 255], i * 4);
  }
  x.putImageData(img, 0, 0);
  return toTex(c, { color: false, repeat: [6, 6] });
};

/* ---------- Kumaş mouse pad ---------- */
export const padMap = () => {
  const [c, x] = make(640, 520);
  const r = rand(5);
  const g = x.createLinearGradient(0, 0, 640, 520);
  g.addColorStop(0, "#31558a");
  g.addColorStop(1, "#1b3358");
  x.fillStyle = g;
  x.fillRect(0, 0, 640, 520);
  for (let i = 0; i < 26000; i++) {
    x.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "0,0,0"},${r() * 0.12})`;
    x.fillRect(r() * 640, r() * 520, 1.5, 1.5);
  }
  x.setLineDash([9, 7]);
  x.strokeStyle = "rgba(232,224,196,.55)";
  x.lineWidth = 3;
  roundRect(x, 20, 20, 600, 480, 14);
  x.stroke();
  x.setLineDash([]);
  x.fillStyle = "rgba(232,224,196,.88)";
  x.textAlign = "center";
  x.font = "800 96px Arial Black, Arial, sans-serif";
  x.fillText("AFU", 320, 285);
  x.font = `700 22px ${MONO}`;
  x.letterSpacing = "12px";
  x.fillText("COMPUTING", 326, 335);
  return toTex(c);
};

/* ---------- Defter (üstten görünüm) ---------- */
export const notepadTop = () => {
  const W = 560;
  const H = 760;
  const [c, x] = make(W, H);
  x.fillStyle = "#f3ecd4";
  x.fillRect(0, 0, W, H);
  // üst bağ şeridi
  const hg = x.createLinearGradient(0, 0, 0, 56);
  hg.addColorStop(0, "#c2443a");
  hg.addColorStop(1, "#8e2a22");
  x.fillStyle = hg;
  x.fillRect(0, 0, W, 56);
  x.fillStyle = "rgba(255,255,255,.35)";
  x.fillRect(0, 0, W, 3);
  // çizgiler ve kenar boşluğu
  x.strokeStyle = "rgba(62,92,196,.38)";
  x.lineWidth = 2;
  for (let y = 116; y < H; y += 44) {
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(W, y);
    x.stroke();
  }
  x.strokeStyle = "rgba(204,54,54,.55)";
  x.beginPath();
  x.moveTo(86, 56);
  x.lineTo(86, H);
  x.stroke();
  // el yazısı
  x.fillStyle = "#26386b";
  x.font = `700 54px ${HAND}`;
  x.fillText("yakında!", 104, 108);
  x.font = `400 32px ${HAND}`;
  [
    "yeni site geliyor",
    "✓ tasarım",
    "✓ 3D masa",
    "✓ floresan cızırtısı",
    "☐ içerik",
    "☐ blog",
  ].forEach((t, i) => x.fillText(t, 104, 152 + i * 44));
  // kahve halkası
  for (const [rr, a] of [
    [58, 0.34],
    [54, 0.18],
  ] as const) {
    x.strokeStyle = `rgba(96,54,22,${a})`;
    x.lineWidth = 5;
    x.beginPath();
    x.arc(400, 560, rr, 0.3, Math.PI * 1.85);
    x.stroke();
  }
  // kıvrık köşe
  const cg = x.createLinearGradient(W - 90, H - 90, W, H);
  cg.addColorStop(0, "rgba(0,0,0,.22)");
  cg.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = cg;
  x.fillRect(W - 90, H - 90, 90, 90);
  return toTex(c);
};

/* ---------- Disket yüzü ---------- */
export const floppyFace = (o: { body: [string, string]; stripe: string; title: string; sub: string }) => {
  const S = 512;
  const [c, x] = make(S, S);
  x.beginPath();
  x.moveTo(30, 0);
  x.lineTo(S - 80, 0);
  x.lineTo(S, 80);
  x.lineTo(S, S - 30);
  x.quadraticCurveTo(S, S, S - 30, S);
  x.lineTo(30, S);
  x.quadraticCurveTo(0, S, 0, S - 30);
  x.lineTo(0, 30);
  x.quadraticCurveTo(0, 0, 30, 0);
  x.closePath();
  const g = x.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, o.body[0]);
  g.addColorStop(1, o.body[1]);
  x.fillStyle = g;
  x.fill();
  // metal kapak
  const m = x.createLinearGradient(120, 0, 380, 0);
  m.addColorStop(0, "#9ba1a8");
  m.addColorStop(0.35, "#f0f2f4");
  m.addColorStop(0.65, "#c4c8cd");
  m.addColorStop(1, "#858b92");
  x.fillStyle = m;
  x.fillRect(122, 0, 268, 176);
  x.fillStyle = "#24272b";
  x.fillRect(300, 26, 56, 124);
  x.strokeStyle = "rgba(255,255,255,.4)";
  x.lineWidth = 2;
  x.strokeRect(300, 26, 56, 124);
  // etiket
  x.fillStyle = "#f4edd6";
  roundRect(x, 46, 226, 420, 256, 10);
  x.fill();
  x.fillStyle = o.stripe;
  x.fillRect(46, 226, 420, 46);
  x.fillStyle = "#fff";
  x.font = `700 26px Arial, sans-serif`;
  x.textAlign = "center";
  x.letterSpacing = "6px";
  x.fillText(o.sub, 256, 259);
  x.letterSpacing = "0px";
  x.strokeStyle = "rgba(62,92,196,.35)";
  x.lineWidth = 2;
  for (const y of [350, 398, 446]) {
    x.beginPath();
    x.moveTo(66, y);
    x.lineTo(446, y);
    x.stroke();
  }
  x.fillStyle = "#1d3aa8";
  x.textAlign = "left";
  x.font = `700 62px ${HAND}`;
  x.fillText(o.title, 74, 340);
  // yazma koruma çentiği
  x.fillStyle = "#0b0b0d";
  x.fillRect(S - 70, S - 64, 34, 34);
  x.fillStyle = "rgba(255,255,255,.07)";
  x.beginPath();
  x.moveTo(0, 0);
  x.lineTo(360, 0);
  x.lineTo(0, 360);
  x.fill();
  return toTex(c);
};

/* ---------- Kaset yüzü ---------- */
export const cassetteFace = () => {
  const W = 800;
  const H = 512;
  const [c, x] = make(W, H);
  const bg = x.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#2c2c31");
  bg.addColorStop(1, "#15151a");
  x.fillStyle = bg;
  roundRect(x, 0, 0, W, H, 34);
  x.fill();
  // etiket
  x.fillStyle = "#efe6cc";
  roundRect(x, 56, 40, 688, 232, 12);
  x.fill();
  x.fillStyle = "#c0392b";
  x.fillRect(56, 40, 688, 36);
  x.fillStyle = "#e08e2b";
  x.fillRect(56, 76, 688, 14);
  x.strokeStyle = "rgba(62,92,196,.3)";
  x.lineWidth = 2;
  for (const y of [168, 214, 258]) {
    x.beginPath();
    x.moveTo(76, y);
    x.lineTo(724, y);
    x.stroke();
  }
  x.fillStyle = "#1c2d78";
  x.font = `700 86px ${HAND}`;
  x.fillText("MIX '87", 84, 176);
  x.font = `700 26px ${MONO}`;
  x.fillStyle = "#7a1f18";
  x.fillText("SIDE A", 596, 68);
  // pencere + makaralar
  x.fillStyle = "#08080a";
  roundRect(x, 206, 286, 388, 96, 12);
  x.fill();
  for (const cx of [292, 508]) {
    x.fillStyle = "#3b2a20";
    x.beginPath();
    x.arc(cx, 334, 40, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#e9e5d8";
    x.beginPath();
    x.arc(cx, 334, 24, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#222";
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      x.fillRect(cx + Math.cos(a) * 15 - 3, 334 + Math.sin(a) * 15 - 3, 6, 6);
    }
  }
  x.strokeStyle = "#4a3a2c";
  x.lineWidth = 5;
  x.beginPath();
  x.moveTo(332, 372);
  x.lineTo(468, 372);
  x.stroke();
  // alt mekanizma
  x.fillStyle = "#0e0e11";
  x.beginPath();
  x.moveTo(170, 420);
  x.lineTo(630, 420);
  x.lineTo(590, 494);
  x.lineTo(210, 494);
  x.closePath();
  x.fill();
  x.fillStyle = "#3a3a42";
  for (const cx of [262, 538]) {
    x.beginPath();
    x.arc(cx, 458, 15, 0, Math.PI * 2);
    x.fill();
  }
  // vidalar
  for (const [sx, sy] of [
    [30, 30],
    [W - 30, 30],
    [30, H - 30],
    [W - 30, H - 30],
  ]) {
    x.fillStyle = "#565660";
    x.beginPath();
    x.arc(sx, sy, 11, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = "#1a1a1e";
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(sx - 6, sy);
    x.lineTo(sx + 6, sy);
    x.stroke();
  }
  return toTex(c);
};

/* ---------- Kitap sırtı (altın yazı) ve kapak ---------- */
export const spineText = (title: string) => {
  const [c, x] = make(1024, 160);
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = "700 62px Georgia, 'Times New Roman', serif";
  x.letterSpacing = "6px";
  x.fillStyle = "rgba(0,0,0,.55)";
  x.fillText(title, 514, 84);
  x.fillStyle = "#d9b866";
  x.fillText(title, 512, 80);
  for (const px of [96, 928]) {
    x.fillRect(px - 26, 20, 3, 120);
    x.fillRect(px + 22, 20, 3, 120);
  }
  return toTex(c);
};

export const bookCover = (title: string) => {
  const [c, x] = make(512, 380);
  x.strokeStyle = "#3d2a12";
  x.globalAlpha = 0.8;
  x.lineWidth = 5;
  x.strokeRect(34, 34, 444, 312);
  x.lineWidth = 2;
  x.strokeRect(48, 48, 416, 284);
  x.fillStyle = "#3d2a12";
  x.textAlign = "center";
  x.font = "700 62px Georgia, serif";
  x.letterSpacing = "8px";
  x.fillText(title, 256, 200);
  x.fillRect(146, 224, 220, 4);
  return toTex(c);
};

/* ---------- Duvar takvimi ---------- */
export const calendarTexture = () => {
  const [c, x] = make(512, 660);
  x.fillStyle = "#ece3cb";
  x.fillRect(0, 0, 512, 660);
  const hg = x.createLinearGradient(0, 0, 0, 96);
  hg.addColorStop(0, "#b23a30");
  hg.addColorStop(1, "#8a2820");
  x.fillStyle = hg;
  x.fillRect(0, 0, 512, 96);
  x.fillStyle = "#f3e9d2";
  x.textAlign = "center";
  x.font = `700 46px ${MONO}`;
  x.letterSpacing = "8px";
  x.fillText("EKİM 1987", 260, 64);
  x.letterSpacing = "0px";
  const days = "PSÇPCCP";
  x.font = `700 28px ${MONO}`;
  x.fillStyle = "#a3322a";
  for (let i = 0; i < 7; i++) x.fillText(days[i], 46 + i * 70, 148);
  x.fillStyle = "#3a3228";
  x.font = `700 32px ${MONO}`;
  const offset = 3; // 1 Ekim 1987 perşembe
  for (let d = 1; d <= 31; d++) {
    const k = d - 1 + offset;
    const px = 46 + (k % 7) * 70;
    const py = 204 + Math.floor(k / 7) * 68;
    x.fillText(String(d), px, py);
    if (d === 1) {
      x.strokeStyle = "#c0392b";
      x.lineWidth = 4;
      x.beginPath();
      x.ellipse(px, py - 11, 26, 27, 0, 0, Math.PI * 2);
      x.stroke();
    }
  }
  return toTex(c);
};

/* ---------- Marka plakası ---------- */
export const plateTexture = (text: string) => {
  const [c, x] = make(384, 96);
  const g = x.createLinearGradient(0, 0, 0, 96);
  g.addColorStop(0, "#3d3a34");
  g.addColorStop(1, "#1b1917");
  x.fillStyle = g;
  roundRect(x, 0, 0, 384, 96, 10);
  x.fill();
  x.fillStyle = "#e6dfcc";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = `700 42px ${MONO}`;
  x.letterSpacing = "12px";
  x.fillText(text, 198, 50);
  return toTex(c);
};

/* ---------- Priz şeridi (üstten) ---------- */
export const stripTop = () => {
  const W = 680;
  const H = 160;
  const [c, x] = make(W, H);
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#efe9d8");
  g.addColorStop(1, "#d6cfba");
  x.fillStyle = g;
  roundRect(x, 0, 0, W, H, 22);
  x.fill();
  for (const sx of [54, 194, 334]) {
    x.fillStyle = "#e3dcc8";
    roundRect(x, sx, 26, 110, 108, 14);
    x.fill();
    x.strokeStyle = "rgba(0,0,0,.3)";
    x.lineWidth = 2;
    x.stroke();
    x.fillStyle = "#26262a";
    roundRect(x, sx + 24, 44, 14, 36, 3);
    x.fill();
    roundRect(x, sx + 72, 44, 14, 36, 3);
    x.fill();
    x.beginPath();
    x.arc(sx + 55, 108, 9, 0, Math.PI * 2);
    x.fill();
  }
  x.fillStyle = "#b8b09a";
  roundRect(x, 500, 30, 100, 100, 12);
  x.fill();
  x.fillStyle = "#e11d1d";
  roundRect(x, 512, 42, 76, 76, 8);
  x.fill();
  x.fillStyle = "rgba(255,255,255,.35)";
  x.fillRect(512, 42, 76, 14);
  x.fillStyle = "#5f5848";
  x.font = `700 15px ${MONO}`;
  x.textAlign = "center";
  x.fillText("10A · 250V", 552, 150);
  return toTex(c);
};

/* ---------- Klavye tuş yazıları (tuşların üstüne oturan saydam katman) ---------- */
export const keyLegends = () => {
  const { keys, depth } = buildKeys();
  const PX = 5120;
  const W = Math.round(KB_W * PX);
  const H = Math.round(depth * PX);
  const [c, x] = make(W, H);
  x.textAlign = "center";
  x.textBaseline = "middle";
  for (const k of keys) {
    if (!k.label) continue;
    const long = k.label.length > 1;
    x.font = `700 ${Math.round((long ? 0.0046 : 0.0074) * PX)}px Arial, sans-serif`;
    x.fillStyle = k.dark ? "rgba(236,232,220,.92)" : "rgba(58,52,42,.9)";
    x.fillText(k.label, (k.x + KB_W / 2) * PX, k.z * PX + 2);
  }
  return toTex(c);
};

/* ---------- Buhar için yumuşak lekeler ---------- */
export const puffTexture = () => {
  const [c, x] = make(128, 128);
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,.9)");
  g.addColorStop(0.5, "rgba(255,255,255,.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return toTex(c);
};

/* ---------- Kupa yazısı ---------- */
export const mugLabel = () => {
  const [c, x] = make(512, 256);
  x.fillStyle = "#f6f0e0";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = "800 150px Arial Black, Arial, sans-serif";
  x.fillText("AFU", 256, 112);
  x.font = `700 34px ${MONO}`;
  x.letterSpacing = "10px";
  x.fillText("WORLD'S BEST DEV", 262, 216);
  return toTex(c);
};

/* ---------- Önbellekli erişim: aynı dokuyu birden çok parça paylaşır ---------- */
const cache = new Map<string, unknown>();
const once = <T,>(key: string, fn: () => T): T => {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key) as T;
};
export const getGrain = () => once("grain", grainBump);
export const getPlate = (text: string) => once(`plate:${text}`, () => plateTexture(text));
export const getWall = () => once("wall", wallpaperMap);
export const getCalendar = () => once("calendar", calendarTexture);
export const getWood = () =>
  once("wood", () => {
    const { map, bump } = woodMaps();
    // ince kenar yüzeyleri için sıkıştırılmış tahta deseni
    const edge = map.clone();
    edge.wrapS = edge.wrapT = THREE.RepeatWrapping;
    edge.repeat.set(1, 0.07);
    edge.needsUpdate = true;
    return { map, bump, edge };
  });

/* ---------- Kağıt yığınının yan yüzü: ince satırlar ---------- */
export const pagesMap = () => {
  const [c, x] = make(64, 256);
  x.fillStyle = "#efe7cf";
  x.fillRect(0, 0, 64, 256);
  x.fillStyle = "rgba(90,70,40,.32)";
  for (let y = 0; y < 256; y += 4) x.fillRect(0, y, 64, 1.5);
  return toTex(c);
};
export const getPages = () => once("pages", pagesMap);
export const getPad = () => once("pad", padMap);
export const getNotepad = () => once("notepad", notepadTop);
export const getLegends = () => once("legends", keyLegends);
export const getPuff = () => once("puff", puffTexture);
export const getMugLabel = () => once("mugLabel", mugLabel);
export const getCassette = () => once("cassette", cassetteFace);
export const getStrip = () => once("strip", stripTop);
export const getSpine = (title: string) => once(`spine:${title}`, () => spineText(title));
export const getCover = (title: string) => once(`cover:${title}`, () => bookCover(title));
const DISK = '3.5" DS,HD';
export const getFloppy = (k: "blue" | "black") =>
  once(`floppy:${k}`, () =>
    k === "blue"
      ? floppyFace({ body: ["#2f4f86", "#1a2f57"], stripe: "#c0392b", title: "AFU OS", sub: DISK })
      : floppyFace({ body: ["#2b2b30", "#141417"], stripe: "#1f6f4a", title: "BACKUP", sub: DISK }),
  );
