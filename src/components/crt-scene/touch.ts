import * as THREE from "three";

// El, klavye, monitör ve masadaki eşyaların ortak durumu. Sahne tek olduğu için modül düzeyinde durur;
// her kare değişen değerler React state'i yerine burada tutulur (yeniden render tetiklemesin).

export const touch = {
  visible: false, // imleç pencerenin içinde mi
  down: false, // fare düğmesi basılı mı
  pressed: 0, // 0..1, yumuşatılmış "parmak yüzeye bastı"
  tip: new THREE.Vector3(), // işaret parmağının ucu (dünya koordinatı)
  vel: new THREE.Vector2(), // parmak ucunun masa düzlemindeki hızı (m/sn)
  keyIndex: -1, // parmağın altındaki klavye tuşu
};

// Ekranın açılma durumu (0 kapalı, 1 tam açık): ışık ve LED buradan okur
export const crt = { boot: 0 };

// Prize dokununca çarpılma. t: kalan süre; char: parmaktaki kararma (yavaşça geçer)
export const SHOCK_TIME = 1.25;
export const shock = { t: 0, char: 0, armed: true, at: new THREE.Vector3(), normal: new THREE.Vector3() };

// Dokunulan nesnenin etiketi: kendisinde ya da bir üst grubunda userData.touch
export const tagOf = (o: THREE.Object3D | null): string | undefined => {
  for (let n = o; n; n = n.parent) if (n.userData.touch) return n.userData.touch as string;
  return undefined;
};

/* ---------- Masadaki itilebilir eşyalar ---------- */
export type Item = {
  group: THREE.Group;
  x: number;
  z: number;
  y: number;
  rot: number;
  vx: number;
  vz: number;
  vr: number;
  r: number; // çarpışma yarıçapı
  h: number; // yükseklik: parmak bunun üstündeyse itmez
  mass: number;
  layer: number; // farklı katmandakiler (üst üste disket) birbirine çarpmaz
};

export const items: Item[] = [];

export const registerItem = (it: Item) => {
  items.push(it);
  return () => void items.splice(items.indexOf(it), 1);
};

type Box = { x0: number; x1: number; z0: number; z1: number };
// Hareket etmeyen şeyler: klavye, monitör, kitap yığınları, kitaplık, priz şeridi
const STATICS: Box[] = [
  { x0: -0.19, x1: 0.19, z0: 0.03, z1: 0.225 },
  { x0: -0.34, x1: 0.34, z0: -0.7, z1: -0.055 },
  { x0: -0.615, x1: -0.345, z0: -0.42, z1: -0.24 },
  { x0: -0.77, x1: -0.53, z0: -0.67, z1: -0.485 },
  { x0: 0.365, x1: 0.595, z0: -0.385, z1: -0.215 },
  { x0: 0.28, x1: 0.64, z0: -0.545, z1: -0.455 },
];
// Masanın kadrajdaki kısmı; eşyalar buradan dışarı düşmez
const BOUNDS: Box = { x0: -0.62, x1: 0.62, z0: -0.66, z1: 0.3 };

const FINGER_R = 0.012;
const { clamp } = THREE.MathUtils;

type Finger = { on: boolean; x: number; z: number; y: number; vx: number; vz: number };

// Basit 2B fizik: parmak, eşyaları yayla iter ve hızını aktarır; sürtünme ile durur
export const stepItems = (dt: number, f: Finger) => {
  for (const it of items) {
    if (f.on && f.y <= it.h + 0.02) {
      const dx = it.x - f.x;
      const dz = it.z - f.z;
      const d = Math.hypot(dx, dz) || 1e-6;
      const min = it.r + FINGER_R;
      if (d < min) {
        const nx = dx / d;
        const nz = dz / d;
        const overlap = (min - d) / min;
        const k = Math.min(1, dt * 60);
        // 1) yay gibi it: yüzeye gömüldükçe daha çok
        const a = ((overlap * 14) / it.mass) * dt;
        it.vx += nx * a;
        it.vz += nz * a;
        // 2) parmağın kendine doğru olan hızını aktar
        const fn = f.vx * nx + f.vz * nz;
        const vn = it.vx * nx + it.vz * nz;
        if (fn > vn) {
          const dv = (fn - vn) * Math.min(1, 0.9 / it.mass) * k;
          it.vx += nx * dv;
          it.vz += nz * dv;
        }
        // 3) teğet hız eşyayı döndürür
        it.vr += ((nx * f.vz - nz * f.vx) * 5 * k) / it.mass;
      }
    }

    it.x += it.vx * dt;
    it.z += it.vz * dt;
    it.rot += it.vr * dt;
    const damp = Math.exp(-5 * dt);
    it.vx *= damp;
    it.vz *= damp;
    it.vr *= Math.exp(-4 * dt);
    const sp = Math.hypot(it.vx, it.vz);
    if (sp > 1.6) {
      it.vx *= 1.6 / sp;
      it.vz *= 1.6 / sp;
    }

    for (const b of STATICS) {
      const cx = clamp(it.x, b.x0, b.x1);
      const cz = clamp(it.z, b.z0, b.z1);
      const dx = it.x - cx;
      const dz = it.z - cz;
      const d = Math.hypot(dx, dz);
      if (d < it.r) {
        let nx: number;
        let nz: number;
        if (d > 1e-6) {
          nx = dx / d;
          nz = dz / d;
        } else {
          // merkez kutunun içinde: en yakın kenara doğru çık
          const l = it.x - b.x0;
          const r = b.x1 - it.x;
          const t = it.z - b.z0;
          const bt = b.z1 - it.z;
          const m = Math.min(l, r, t, bt);
          nx = m === l ? -1 : m === r ? 1 : 0;
          nz = m === t ? -1 : m === bt ? 1 : 0;
        }
        it.x = cx + nx * (it.r + (d > 1e-6 ? 0 : 0.001));
        it.z = cz + nz * (it.r + (d > 1e-6 ? 0 : 0.001));
        const vn = it.vx * nx + it.vz * nz;
        if (vn < 0) {
          it.vx -= nx * vn;
          it.vz -= nz * vn;
        }
      }
    }

    if (it.x < BOUNDS.x0 + it.r || it.x > BOUNDS.x1 - it.r) {
      it.x = clamp(it.x, BOUNDS.x0 + it.r, BOUNDS.x1 - it.r);
      it.vx = 0;
    }
    if (it.z < BOUNDS.z0 + it.r || it.z > BOUNDS.z1 - it.r) {
      it.z = clamp(it.z, BOUNDS.z0 + it.r, BOUNDS.z1 - it.r);
      it.vz = 0;
    }
  }

  // eşyalar birbirini iter (aynı katmandakiler)
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (a.layer !== b.layer) continue;
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const d = Math.hypot(dx, dz) || 1e-6;
      const min = a.r + b.r;
      if (d < min) {
        const nx = dx / d;
        const nz = dz / d;
        const push = min - d;
        const wa = b.mass / (a.mass + b.mass);
        a.x -= nx * push * wa;
        a.z -= nz * push * wa;
        b.x += nx * push * (1 - wa);
        b.z += nz * push * (1 - wa);
        const rel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
        if (rel < 0) {
          a.vx += nx * rel * (1 - wa);
          a.vz += nz * rel * (1 - wa);
          b.vx -= nx * rel * wa;
          b.vz -= nz * rel * wa;
        }
      }
    }
  }

  for (const it of items) {
    it.group.position.set(it.x, it.y, it.z);
    it.group.rotation.y = it.rot;
  }
};
