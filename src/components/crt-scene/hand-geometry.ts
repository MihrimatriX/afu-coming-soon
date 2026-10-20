import * as THREE from "three";

// Prosedürel sağ el. Yerel eksenler: x yana (başparmak -x), y el sırtı (+y), z bileğe doğru (+z),
// parmaklar -z yönüne uzanır. Ölçüler metre, gerçek bir yetişkin elinin oranlarında.

type V = THREE.Vector3;
const v = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const { smoothstep } = THREE.MathUtils;

/* ---------- Kemik zinciri: taban + parça boyları + eklem bükümleri → eklem noktaları ---------- */
export type Chain = { points: V[]; up: V };

// yaw: yana sapma (+ → +x), pitch: aşağı eğim
export const chain = (base: V, yaw: number, pitch: number, lens: number[], bends: number[]): Chain => {
  const dir = v(0, 0, -1).applyAxisAngle(v(1, 0, 0), -pitch).applyAxisAngle(v(0, 1, 0), -yaw);
  const up = v(0, 1, 0).applyAxisAngle(v(1, 0, 0), -pitch).applyAxisAngle(v(0, 1, 0), -yaw);
  const up0 = up.clone();
  const points = [base.clone()];
  lens.forEach((len, i) => {
    // bükülme parmağın yan ekseni etrafında: avuca doğru kıvrılır
    const side = dir.clone().cross(up).normalize();
    dir.applyAxisAngle(side, -bends[i]);
    up.applyAxisAngle(side, -bends[i]);
    points.push(points[points.length - 1].clone().addScaledVector(dir, len));
  });
  return { points, up: up0 };
};

/* ---------- Parmak tüpü: değişken kalınlık, basık kesit, yuvarlak uç, eklem kırışıklıkları ---------- */
export type Finger = { geo: THREE.BufferGeometry; tip: V; nail: { pos: V; quat: THREE.Quaternion; r: number } };

export const fingerGeometry = ({ points, up }: Chain, radii: number[]): Finger => {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  const SEG = 64;
  const RAD = 28;
  const CAP = 8;
  const n = points.length - 1;
  const radiusAt = (t: number) => {
    const f = t * n;
    const i = Math.min(n - 1, Math.floor(f));
    let r = THREE.MathUtils.lerp(radii[i], radii[i + 1], f - i);
    // eklem yerinde hafif şişlik (boğum)
    for (let j = 2; j < n; j++) r *= 1 + 0.06 * Math.exp(-((f - j) ** 2) / 0.03);
    return r;
  };

  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const N = up.clone();
  let T = curve.getTangent(0);
  N.addScaledVector(T, -N.dot(T)).normalize();
  let lastC = v();
  let lastT = v();
  let lastN = v();
  let lastR = 0;

  const ring = (c: V, t: V, nrm: V, r: number, s: number, fwd = 0, shrink = 1) => {
    const L = t.clone().cross(nrm).normalize();
    for (let k = 0; k < RAD; k++) {
      const a = (k / RAD) * Math.PI * 2;
      const cs = Math.cos(a);
      const sn = Math.sin(a);
      // sırt tarafı basık, iç (avuç) tarafı dolgun; uç boğumda parmak yastığı
      const pad = sn < 0 ? 0.95 + 0.1 * Math.exp(-(((s - 0.88) / 0.08) ** 2)) : 0.9;
      const p = c
        .clone()
        .addScaledVector(L, cs * r * 1.06 * shrink)
        .addScaledVector(nrm, sn * r * pad * shrink)
        .addScaledVector(t, fwd);
      pos.push(p.x, p.y, p.z);
      // uçlar ve sırttaki eklem kırışıklıkları biraz daha koyu/kırmızı
      const fj = s * n;
      let crease = 0;
      for (let j = 2; j < n; j++) crease += Math.exp(-(((fj - j) / 0.05) ** 2));
      const dorsal = Math.max(0, sn);
      const tip = smoothstep(s, 0.8, 1);
      const shade = 1 - crease * dorsal * 0.14;
      col.push(shade, shade * (1 - tip * 0.1 - crease * dorsal * 0.04), shade * (1 - tip * 0.13 - crease * dorsal * 0.05));
    }
  };

  for (let i = 0; i <= SEG; i++) {
    const s = i / SEG;
    T = curve.getTangent(s);
    // paralel taşıma: sırt yönü parmak boyunca bükülmeyle birlikte döner, burulmaz
    N.addScaledVector(T, -N.dot(T)).normalize();
    const c = curve.getPoint(s);
    const r = radiusAt(s);
    ring(c, T, N, r, s);
    lastC = c;
    lastT = T.clone();
    lastN = N.clone();
    lastR = r;
  }
  // yuvarlak uç: kubbe şeklinde küçülen halkalar
  for (let k = 1; k <= CAP; k++) {
    const a = (k / CAP) * (Math.PI / 2 - 0.08);
    ring(lastC, lastT, lastN, lastR, 1, Math.sin(a) * lastR * 1.15, Math.cos(a));
  }
  const tip = lastC.clone().addScaledVector(lastT, lastR * 1.18);
  pos.push(tip.x, tip.y, tip.z);
  col.push(1, 0.9, 0.87);

  const rings = SEG + 1 + CAP;
  for (let i = 0; i < rings - 1; i++) {
    for (let k = 0; k < RAD; k++) {
      const a = i * RAD + k;
      const b = i * RAD + ((k + 1) % RAD);
      const c = (i + 1) * RAD + k;
      const d = (i + 1) * RAD + ((k + 1) % RAD);
      idx.push(a, c, b, b, c, d);
    }
  }
  const last = (rings - 1) * RAD;
  const tipIdx = rings * RAD;
  for (let k = 0; k < RAD; k++) idx.push(last + k, tipIdx, last + ((k + 1) % RAD));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  // tırnak: uç boğumun sırtında, uca yakın
  const ns = 0.93;
  const nT = curve.getTangent(ns);
  const nN = lastN.clone().addScaledVector(nT, -lastN.dot(nT)).normalize();
  const nr = radiusAt(ns);
  const nPos = curve.getPoint(ns).addScaledVector(nN, nr * 0.72).addScaledVector(nT, nr * 0.35);
  const nL = nT.clone().cross(nN).normalize();
  const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(nL, nN, nT.clone().negate()));
  return { geo, tip, nail: { pos: nPos, quat, r: nr } };
};

/* ---------- Avuç: süperelips kesitli, deforme edilmiş gövde ---------- */
export const KNUCKLES: [number, number, number][] = [
  [-0.026, 0.001, 0.001], // işaret
  [-0.008, 0.002, -0.002], // orta
  [0.011, 0.001, 0.001], // yüzük
  [0.029, -0.001, 0.009], // serçe
];

export const palmGeometry = () => {
  const L = 0.1;
  const U = 48;
  const R = 56;
  const EXP = 2.5;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];

  // halkalar: ön kubbe (parmak kökleri) → gövde → topuk kubbesi (bilek)
  type Ring = { u: number; z: number; s: number };
  const rings: Ring[] = [];
  for (let k = 5; k >= 1; k--) {
    const a = (k / 5) * (Math.PI / 2 - 0.05);
    rings.push({ u: 0, z: -Math.sin(a) * 0.01, s: Math.cos(a) });
  }
  for (let i = 0; i <= U; i++) rings.push({ u: i / U, z: (i / U) * L, s: 1 });
  for (let k = 1; k <= 7; k++) {
    const a = (k / 7) * (Math.PI / 2 - 0.05);
    rings.push({ u: 1, z: L + Math.sin(a) * 0.018, s: Math.cos(a) });
  }

  for (const { u, z, s } of rings) {
    const w = THREE.MathUtils.lerp(0.041, 0.03, smoothstep(u, 0.25, 1)) + 0.0015 * Math.sin(Math.PI * u);
    const h = THREE.MathUtils.lerp(0.0115, 0.0148, u);
    for (let k = 0; k < R; k++) {
      const a = (k / R) * Math.PI * 2;
      const cs = Math.cos(a);
      const sn = Math.sin(a);
      let x = w * Math.sign(cs) * Math.abs(cs) ** (2 / EXP);
      let y = h * Math.sign(sn) * Math.abs(sn) ** (2 / EXP);
      const nx = x / w;
      let zz = z;

      if (y > 0) {
        // el sırtı: enine kavis, kemik başları (boğumlar), bileğe inen tendonlar
        y += 0.0024 * (1 - nx * nx);
        for (const [kx] of KNUCKLES) {
          y += 0.0034 * Math.exp(-(((x - kx) / 0.0065) ** 2)) * Math.exp(-((u / 0.08) ** 2));
          const tx = kx * (1 - 0.4 * u);
          y += 0.0011 * Math.exp(-(((x - tx) / 0.0035) ** 2)) * smoothstep(u, 0.06, 0.3) * (1 - smoothstep(u, 0.65, 0.95));
        }
      } else {
        // avuç içi: ortası hafif çukur, başparmak ve serçe tarafında kas tümsekleri
        y += 0.0028 * Math.exp(-((x / 0.02) ** 2)) * Math.sin(Math.PI * u);
        y -= 0.0075 * Math.exp(-(((x + 0.028) / 0.014) ** 2) - ((u - 0.68) / 0.22) ** 2);
        y -= 0.0042 * Math.exp(-(((x - 0.03) / 0.012) ** 2) - ((u - 0.6) / 0.25) ** 2);
      }
      // başparmak kası yana da taşar
      if (cs < 0) x -= 0.006 * Math.exp(-(((u - 0.62) / 0.2) ** 2)) * Math.abs(cs);
      // parmak kökleri yay çizer: serçe tarafı geride
      zz += (0.002 + 0.011 * Math.max(0, (x + 0.005) / 0.045) ** 1.5) * (1 - smoothstep(u, 0, 0.35));

      pos.push(x * s, y * s + 0.001, zz);
      const dorsal = y > 0;
      const knuckle = dorsal ? Math.exp(-((u / 0.09) ** 2)) : 0;
      const shade = dorsal ? 0.95 : 1;
      col.push(shade, shade * (dorsal ? 0.93 : 0.97) - knuckle * 0.05, shade * (dorsal ? 0.92 : 0.95) - knuckle * 0.06);
    }
  }

  for (let i = 0; i < rings.length - 1; i++) {
    for (let k = 0; k < R; k++) {
      const a = i * R + k;
      const b = i * R + ((k + 1) % R);
      const c = (i + 1) * R + k;
      const d = (i + 1) * R + ((k + 1) % R);
      idx.push(a, b, c, b, d, c);
    }
  }
  // iki uçtaki son halkaları kapat
  const front = pos.length / 3;
  pos.push(0, 0.001, rings[0].z - 0.0005);
  col.push(1, 0.95, 0.93);
  const back = pos.length / 3;
  pos.push(0, 0.001, rings[rings.length - 1].z + 0.0005);
  col.push(1, 0.95, 0.93);
  const lastRing = (rings.length - 1) * R;
  for (let k = 0; k < R; k++) {
    idx.push(front, (k + 1) % R, k);
    idx.push(back, lastRing + k, lastRing + ((k + 1) % R));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
};

/* ---------- İşaret eden el pozu ---------- */
type FingerSpec = { knuckle: number; lens: number[]; radii: number[]; yaw: number; pitch: number; bends: number[] };

export const POINTING: FingerSpec[] = [
  // işaret: neredeyse düz
  { knuckle: 0, lens: [0.012, 0.043, 0.025, 0.02], radii: [0.0104, 0.0101, 0.0092, 0.0083, 0.0074], yaw: -0.03, pitch: -0.02, bends: [0, 0.05, 0.1, 0.07] },
  // orta, yüzük, serçe: avuca kıvrık (yumruk)
  { knuckle: 1, lens: [0.012, 0.047, 0.029, 0.021], radii: [0.0107, 0.0104, 0.0095, 0.0086, 0.0076], yaw: 0.01, pitch: -0.08, bends: [0, 1.45, 1.85, 1.0] },
  { knuckle: 2, lens: [0.012, 0.044, 0.027, 0.02], radii: [0.0101, 0.0098, 0.009, 0.0081, 0.0072], yaw: 0.04, pitch: -0.08, bends: [0, 1.5, 1.85, 1.0] },
  { knuckle: 3, lens: [0.012, 0.034, 0.02, 0.018], radii: [0.0092, 0.0088, 0.008, 0.0072, 0.0064], yaw: 0.08, pitch: -0.1, bends: [0, 1.55, 1.8, 0.95] },
];

// başparmak: kökü avuç içindeki kasta, işaret parmağının altından orta parmağın yanına kıvrılır.
// Açılarla değil eklem noktalarıyla tanımlı; tırnağı dışa (-x) bakar.
export const THUMB: Chain & { radii: number[] } = {
  points: [v(-0.026, -0.006, 0.075), v(-0.043, -0.015, 0.045), v(-0.04, -0.029, 0.018), v(-0.024, -0.036, 0.0)],
  up: v(-0.7, 0.7, 0).normalize(),
  radii: [0.0142, 0.0126, 0.011, 0.0097],
};
