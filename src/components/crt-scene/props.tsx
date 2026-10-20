"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type FC, type ReactNode } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { useFrame } from "@react-three/fiber";
import { Decal, RoundedBox } from "@react-three/drei";
import { buildKeys, KB_W } from "./keyboard-layout";
import { playKey } from "./sfx";
import { registerItem, touch } from "./touch";
import {
  getCassette,
  getCover,
  getFloppy,
  getGrain,
  getLegends,
  getMugLabel,
  getNotepad,
  getPad,
  getPages,
  getPuff,
  getSpine,
  getStrip,
} from "./textures";

type V3 = [number, number, number];

/* ---------- Kablo: noktalardan geçen yumuşak tüp ---------- */
export const Cable: FC<{ points: V3[]; radius?: number }> = ({ points, radius = 0.0018 }) => {
  const geo = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 90, radius, 8),
    [points, radius],
  );
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color="#151515" roughness={0.42} clearcoat={0.3} />
    </mesh>
  );
};

/* ---------- Klavye: 6 sıra, eğimli gövde, tuşlar tek InstancedMesh ---------- */
// KeyboardEvent.key → tuş etiketi (özel tuşlar); tek karakterler zaten büyük harf etiketiyle eşleşir
const KEY_NAMES: Record<string, string> = {
  " ": "",
  Enter: "ENTER",
  Backspace: "BKSP",
  Tab: "TAB",
  CapsLock: "CAPS",
  Escape: "ESC",
  Delete: "DEL",
  Control: "CTRL",
  Alt: "ALT",
  Shift: "SHIFT",
};
export const Keyboard: FC<{ position: V3 }> = ({ position }) => {
  const { keys, depth } = useMemo(buildKeys, []);
  const legends = useMemo(getLegends, []);
  const grain = useMemo(getGrain, []);
  const geo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.22), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new THREE.Color();
    keys.forEach((k, i) => {
      dummy.position.set(k.x, 0.0148, k.z - depth / 2);
      dummy.scale.set(k.w - 0.0024, 0.009, k.d - 0.0024);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, c.set(k.dark ? "#8d8779" : "#ebe4cf"));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [keys, depth, dummy]);

  // tuşlar basılınca 3.5 mm iner: hem elle hem gerçek klavyeyle
  const press = useRef<number[]>([]);
  const was = useRef<number[]>([]); // parmağın son karedeki basma durumu: değişince tık sesi
  const held = useRef(new Set<number>());

  useEffect(() => {
    const index = (label: string) => keys.flatMap((k, i) => (k.label === label ? [i] : []));
    const label = (e: KeyboardEvent) => KEY_NAMES[e.key] ?? e.key.toUpperCase();
    // Gerçek klavyenin sesi olayda çalar, karede değil: hızlı bir vuruşta tuş iki kare arasında
    // basılıp bırakılabilir, kare döngüsü onu hiç görmez.
    // TODO(human): basınca ve bırakınca playKey çal
    const down = (e: KeyboardEvent) => {
      const ids = index(label(e));
      ids.forEach((i) => held.current.add(i));
    };
    const up = (e: KeyboardEvent) => {
      const ids = index(label(e));
      ids.forEach((i) => held.current.delete(i));
    };
    const clear = () => held.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [keys]);

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    let changed = false;
    keys.forEach((k, i) => {
      const touched = touch.down && touch.visible && touch.keyIndex === i ? 1 : 0;
      // elle basış: parmak tuşa indiği ve kalktığı karede tık (tuş zaten basılı tutuluyorsa sessiz)
      if (touched !== (was.current[i] ?? 0)) {
        was.current[i] = touched;
        if (!held.current.has(i)) playKey(touched === 1, k.w > 0.035);
      }
      const target = held.current.has(i) || touched ? 1 : 0;
      const cur = press.current[i] ?? 0;
      if (cur === target) return;
      const next = Math.abs(target - cur) < 0.02 ? target : cur + (target - cur) * Math.min(1, dt * 32);
      press.current[i] = next;
      dummy.position.set(k.x, 0.0148 - next * 0.0035, k.z - depth / 2);
      dummy.scale.set(k.w - 0.0024, 0.009, k.d - 0.0024);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      changed = true;
    });
    if (changed) m.instanceMatrix.needsUpdate = true;
  });

  const bw = KB_W + 0.034;
  const bd = depth + 0.05;
  return (
    <group position={position} rotation={[0.09, 0, 0]}>
      <RoundedBox args={[bw, 0.022, bd]} radius={0.006} smoothness={4} position={[0, 0, -0.008]}>
        <meshPhysicalMaterial color="#d3cab1" roughness={0.5} clearcoat={0.2} bumpMap={grain} bumpScale={0.6} />
      </RoundedBox>
      {/* tuşların oturduğu çukur tabla */}
      <mesh position={[0, 0.0111, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KB_W + 0.006, depth + 0.006]} />
        <meshStandardMaterial color="#b3aa93" roughness={0.7} />
      </mesh>
      <instancedMesh ref={ref} args={[geo, undefined, keys.length]} userData={{ touch: "keys" }}>
        <meshPhysicalMaterial roughness={0.42} clearcoat={0.15} clearcoatRoughness={0.4} />
      </instancedMesh>
      <mesh position={[0, 0.0195, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ noShadow: true }} raycast={() => null}>
        <planeGeometry args={[KB_W, depth]} />
        <meshStandardMaterial map={legends} transparent depthWrite={false} roughness={1} />
      </mesh>
      {/* kauçuk ayaklar */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (bw / 2 - 0.02), -0.012, bd / 2 - 0.028]}>
          <boxGeometry args={[0.03, 0.004, 0.012]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

/* ---------- Mouse pad + mouse (yüzeye oturan kavisli gövde) ---------- */
const ellipsoidY = (rx: number, ry: number, rz: number, x: number, z: number) =>
  ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2 - (z / rz) ** 2));

const RX = 0.0225;
const RY = 0.017;
const RZ = 0.038;

export const MouseAndPad: FC<{ position: V3 }> = ({ position }) => {
  const pad = useMemo(getPad, []);
  const grain = useMemo(getGrain, []);
  // düğme ayrım çizgileri: gövdenin yüzeyine oturan ince tüpler
  const seams = useMemo(() => {
    const along = Array.from({ length: 24 }, (_, i) => {
      const z = -0.0365 + (i / 23) * 0.0385;
      return new THREE.Vector3(0, ellipsoidY(RX, RY, RZ, 0, z) + 0.0002, z);
    });
    const across = Array.from({ length: 24 }, (_, i) => {
      const x = -0.0215 + (i / 23) * 0.043;
      return new THREE.Vector3(x, ellipsoidY(RX, RY, RZ, x, 0.002) + 0.0002, 0.002);
    });
    return [along, across].map((pts) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.0004, 6));
  }, []);

  return (
    <group position={position}>
      <RoundedBox args={[0.23, 0.004, 0.19]} radius={0.0015} smoothness={3} position={[0, 0.002, 0]}>
        <meshStandardMaterial map={pad} roughness={1} bumpMap={grain} bumpScale={0.4} />
      </RoundedBox>
      <group position={[0.012, 0.004, 0.012]} rotation={[0, 0.12, 0]}>
        <mesh scale={[RX, RY, RZ]}>
          <sphereGeometry args={[1, 64, 40]} />
          <meshPhysicalMaterial color="#e2dac3" roughness={0.38} clearcoat={0.45} clearcoatRoughness={0.25} />
        </mesh>
        {seams.map((g, i) => (
          <mesh key={i} geometry={g} userData={{ noShadow: true }}>
            <meshStandardMaterial color="#5a5446" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ---------- Kupa: döner (lathe) gövde, kahve, kulp, yazı ve buhar ---------- */
export const Mug: FC = () => {
  const label = useMemo(getMugLabel, []);
  const puff = useMemo(getPuff, []);
  const body = useMemo(() => {
    const pts = [
      [0, 0],
      [0.024, 0],
      [0.031, 0.0012],
      [0.0352, 0.0055],
      [0.0366, 0.014],
      [0.0372, 0.05],
      [0.0376, 0.088],
      [0.0378, 0.0925],
      [0.0368, 0.0938],
      [0.0356, 0.0928],
      [0.0348, 0.089],
      [0.0344, 0.05],
      [0.0336, 0.014],
      [0.0, 0.01],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  const puffs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    puffs.current.forEach((m, i) => {
      if (!m) return;
      const ph = (t * 0.22 + i / 3) % 1;
      m.position.set(Math.sin(ph * 6 + i * 2) * 0.009 + (i - 1) * 0.008, 0.098 + ph * 0.1, 0.004);
      m.scale.set(0.014 + ph * 0.026, 0.026 + ph * 0.06, 1);
      (m.material as THREE.MeshBasicMaterial).opacity = Math.sin(ph * Math.PI) * 0.16;
    });
  });

  return (
    <>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#b83b2e" roughness={0.22} clearcoat={1} clearcoatRoughness={0.06} side={THREE.DoubleSide} />
        <Decal position={[0, 0.05, 0.037]} rotation={[0, 0, 0]} scale={[0.056, 0.028, 0.02]}>
          <meshStandardMaterial map={label} transparent roughness={0.3} polygonOffset polygonOffsetFactor={-4} />
        </Decal>
      </mesh>
      {/* kahve */}
      <mesh position={[0, 0.079, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ noShadow: true }}>
        <circleGeometry args={[0.0342, 48]} />
        <meshPhysicalMaterial color="#1c0e07" roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {/* kulp */}
      <mesh position={[0.0375, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1.25, 1, 1]}>
        <torusGeometry args={[0.021, 0.0052, 20, 40, Math.PI]} />
        <meshPhysicalMaterial color="#b83b2e" roughness={0.22} clearcoat={1} clearcoatRoughness={0.06} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => void (puffs.current[i] = m)} userData={{ noShadow: true }} raycast={() => null}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={puff} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
};

/* ---------- Kitap: yatık; sırt yazısı varsa sırtı, yoksa sayfa kenarı öne bakar ---------- */
type BookProps = {
  position: V3;
  rotY?: number;
  size: [number, number, number]; // uzunluk (x), kalınlık (y), derinlik (z)
  cover: string;
  spine?: string;
  topTitle?: string;
};

export const Book: FC<BookProps> = ({ position, rotY = 0, size: [L, T, D], cover, spine, topTitle }) => {
  const pages = useMemo(getPages, []);
  const spineTex = useMemo(() => (spine ? getSpine(spine) : null), [spine]);
  const topTex = useMemo(() => (topTitle ? getCover(topTitle) : null), [topTitle]);
  const board = { color: cover, roughness: 0.62, clearcoat: 0.12, clearcoatRoughness: 0.5 };
  const paper = useMemo(() => {
    const t = pages.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, T / 0.014);
    t.needsUpdate = true;
    return t;
  }, [pages, T]);
  // sırt yoksa kitabı ters çevir: sayfalar öne, sırt arkaya
  const rot = spine ? rotY : rotY + Math.PI;

  return (
    <group position={position} rotation={[0, rot, 0]}>
      <RoundedBox args={[L + 0.006, 0.0035, D]} radius={0.0012} smoothness={2} position={[0, T / 2 - 0.00175, 0]}>
        <meshPhysicalMaterial {...board} />
      </RoundedBox>
      <RoundedBox args={[L + 0.006, 0.0035, D]} radius={0.0012} smoothness={2} position={[0, -T / 2 + 0.00175, 0]}>
        <meshPhysicalMaterial {...board} />
      </RoundedBox>
      <mesh position={[0, 0, -0.003]}>
        <boxGeometry args={[L - 0.004, T - 0.006, D - 0.012]} />
        <meshStandardMaterial map={paper} roughness={0.9} />
      </mesh>
      {/* sırt: yarım silindir */}
      <mesh position={[0, 0, D / 2 - T / 2 + 0.0005]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[T / 2, T / 2, L + 0.006, 32, 1, false, -Math.PI / 2, Math.PI]} />
        <meshPhysicalMaterial {...board} side={THREE.DoubleSide} />
      </mesh>
      {spineTex && (
        <mesh position={[0, 0, D / 2 + 0.0006]} userData={{ noShadow: true }}>
          <planeGeometry args={[L * 0.86, T * 0.7]} />
          <meshStandardMaterial map={spineTex} transparent roughness={0.4} metalness={0.3} />
        </mesh>
      )}
      {topTex && (
        <mesh position={[0, T / 2 + 0.0002, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ noShadow: true }}>
          <planeGeometry args={[L - 0.02, D - 0.03]} />
          <meshStandardMaterial map={topTex} transparent roughness={0.6} />
        </mesh>
      )}
    </group>
  );
};

export const Books: FC<{ position: V3 }> = ({ position: [x, y, z] }) => (
  <group>
    <Book position={[x, y + 0.019, z]} rotY={0.05} size={[0.25, 0.038, 0.17]} cover="#6b2f2a" spine="COMPUTER GRAPHICS" />
    <Book position={[x + 0.006, y + 0.054, z]} rotY={-0.09} size={[0.22, 0.032, 0.155]} cover="#2f4a3c" />
    <Book
      position={[x - 0.004, y + 0.084, z + 0.004]}
      rotY={0.11}
      size={[0.2, 0.028, 0.14]}
      cover="#b8a06a"
      spine="PASCAL"
      topTitle="PASCAL"
    />
  </group>
);

/* ---------- Kitaplık: iki metal destek arasında dik duran kitaplar ---------- */
// h: yükseklik, t: kalınlık, d: derinlik. Sırt yazıları crt-scene'deki TEXTURES listesinde de olmalı.
const SHELF = [
  { h: 0.232, t: 0.044, d: 0.165, cover: "#1f2f4a", title: "ALGORITHMS" },
  { h: 0.212, t: 0.028, d: 0.15, cover: "#6b2f2a", title: "THE C LANGUAGE" },
  { h: 0.196, t: 0.022, d: 0.14, cover: "#2c2c30", title: "UNIX" },
  { h: 0.244, t: 0.05, d: 0.172, cover: "#2f4a3c", title: "ASSEMBLER" },
  { h: 0.205, t: 0.03, d: 0.145, cover: "#5a3a22", title: "BASIC" },
  { h: 0.222, t: 0.036, d: 0.158, cover: "#1f4a4a", title: "FORTRAN 77" },
];

const Bookend: FC<{ position: V3; flip?: boolean }> = ({ position, flip }) => (
  <group position={position} rotation={[0, flip ? Math.PI : 0, 0]}>
    <RoundedBox args={[0.003, 0.15, 0.12]} radius={0.001} smoothness={2} position={[-0.0015, 0.075, 0]}>
      <meshStandardMaterial color="#2b2d2b" metalness={0.6} roughness={0.45} />
    </RoundedBox>
    {/* kitapların altına giren taban sacı */}
    <mesh position={[0.05, 0.001, 0]}>
      <boxGeometry args={[0.1, 0.002, 0.12]} />
      <meshStandardMaterial color="#2b2d2b" metalness={0.6} roughness={0.45} />
    </mesh>
  </group>
);

// position: sol desteğin yeri; kitapların sırtı position z'sinde hizalanır
export const Shelf: FC<{ position: V3 }> = ({ position: [x0, y0, z0] }) => {
  let x = x0 + 0.001;
  return (
    <group>
      <Bookend position={[x0, y0, z0 - 0.07]} />
      {SHELF.map((b, i) => {
        const cx = x + b.t / 2;
        x += b.t + 0.0012;
        // yan yatır: uzunluk dikey, sırt öne; yazı yukarıdan aşağı okunur
        return (
          <group key={b.title} position={[cx, y0 + 0.005 + b.h / 2, z0 - b.d / 2]} rotation={[0, (i % 3) * 0.012 - 0.012, -Math.PI / 2]}>
            <Book position={[0, 0, 0]} size={[b.h, b.t, b.d]} cover={b.cover} spine={b.title} />
          </group>
        );
      })}
      <Bookend position={[x + 0.001, y0, z0 - 0.07]} flip />
    </group>
  );
};

/* ---------- Saksıda kaktüs: pişmiş toprak saksı, kaburgalı gövde, yavru ve çiçek ---------- */
// Dikine uzatılmış küre; kaburgalar yarıçapı açıya göre dalgalandırarak verilir
const ribbed = (r: number, h: number, ribs: number) => {
  const g = new THREE.SphereGeometry(1, 64, 40);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = r * (1 + 0.08 * Math.cos(ribs * Math.atan2(p.getZ(i), p.getX(i))));
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * h, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
};

export const Cactus: FC<{ position: V3 }> = ({ position }) => {
  const [pot, body, pup] = useMemo(() => {
    const pot = new THREE.LatheGeometry(
      [
        [0, 0],
        [0.025, 0],
        [0.027, 0.003],
        [0.033, 0.056],
        [0.037, 0.058],
        [0.0375, 0.068],
        [0.0345, 0.0695],
        [0.0335, 0.062],
        [0, 0.062],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      64,
    );
    return [pot, ribbed(0.022, 0.05, 11), ribbed(0.011, 0.018, 8)];
  }, []);
  const green = { color: "#4f7d3a", roughness: 0.55 };
  return (
    <group position={position}>
      <mesh geometry={pot}>
        <meshStandardMaterial color="#b0603a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.063, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0335, 40]} />
        <meshStandardMaterial color="#2a1d14" roughness={1} />
      </mesh>
      <mesh geometry={body} position={[0, 0.105, 0]}>
        <meshStandardMaterial {...green} />
      </mesh>
      <mesh geometry={pup} position={[0.019, 0.07, 0.012]} rotation={[0.3, 0, -0.5]}>
        <meshStandardMaterial {...green} />
      </mesh>
      {/* tepedeki çiçek: taç yapraklar */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i * 1.047) * 0.005, 0.156, Math.sin(i * 1.047) * 0.005]} rotation={[0, -i * 1.047, 0.5]} scale={[1, 0.35, 0.6]}>
          <sphereGeometry args={[0.006, 12, 8]} />
          <meshStandardMaterial color="#ec6a94" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

/* ---------- Rubik küpü: siyah gövde, karışık renkli 54 etiket (tek InstancedMesh) ---------- */
const RUBIK = ["#f4f4f0", "#ffd21f", "#c8202e", "#ff6a13", "#1250b0", "#12a150"];
const CUBE = 0.056;

export const Rubik: FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.15), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const cell = CUBE / 3;
    let seed = 11; // sabit karışım: her açılışta aynı küp
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let n = 0;
    for (let f = 0; f < 6; f++) {
      const axis = f >> 1;
      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          const p = [0, 0, 0];
          const s = [cell * 0.86, cell * 0.86, cell * 0.86];
          p[axis] = (f & 1 ? -1 : 1) * (CUBE / 2 + 0.0003);
          p[(axis + 1) % 3] = a * cell;
          p[(axis + 2) % 3] = b * cell;
          s[axis] = 0.0012;
          o.position.set(p[0], p[1] + CUBE / 2, p[2]);
          o.scale.set(s[0], s[1], s[2]);
          o.updateMatrix();
          m.setMatrixAt(n, o.matrix);
          // orta etiket yüzün rengi, gerisi karışık
          m.setColorAt(n++, c.set(RUBIK[a === 0 && b === 0 ? f : Math.floor(rand() * 6)]));
        }
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);
  return (
    <>
      <RoundedBox args={[CUBE, CUBE, CUBE]} radius={0.004} smoothness={3} position={[0, CUBE / 2, 0]}>
        <meshPhysicalMaterial color="#141414" roughness={0.4} clearcoat={0.3} />
      </RoundedBox>
      <instancedMesh ref={ref} args={[geo, undefined, 54]} userData={{ noShadow: true }}>
        <meshPhysicalMaterial roughness={0.3} clearcoat={0.6} clearcoatRoughness={0.2} />
      </instancedMesh>
    </>
  );
};

/* ---------- Defter (kâğıt yığını, çizgili, el yazılı) ve kalem ---------- */
export const Notepad: FC = () => {
  const top = useMemo(getNotepad, []);
  const pages = useMemo(getPages, []);
  return (
    <>
      <mesh position={[0, 0.001, 0]}>
        <boxGeometry args={[0.147, 0.002, 0.202]} />
        <meshStandardMaterial color="#7d6446" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.009, 0]}>
        <boxGeometry args={[0.145, 0.014, 0.2]} />
        <meshStandardMaterial attach="material-0" map={pages} roughness={0.9} />
        <meshStandardMaterial attach="material-1" map={pages} roughness={0.9} />
        <meshStandardMaterial attach="material-2" map={top} roughness={0.85} />
        <meshStandardMaterial attach="material-3" color="#7d6446" />
        <meshStandardMaterial attach="material-4" map={pages} roughness={0.9} />
        <meshStandardMaterial attach="material-5" map={pages} roughness={0.9} />
      </mesh>
    </>
  );
};

export const Pencil: FC = () => {
  const R = 0.0036;
  const L = 0.135;
  return (
    <group position={[0, R, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[R, R, L, 6]} />
        <meshPhysicalMaterial color="#e5b62a" roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[-L / 2 - 0.007, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[R * 1.05, R * 1.05, 0.014, 24]} />
        <meshStandardMaterial color="#b9bcc1" metalness={1} roughness={0.28} />
      </mesh>
      <mesh position={[-L / 2 - 0.0195, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[R * 0.98, R * 0.98, 0.011, 24]} />
        <meshStandardMaterial color="#d8737f" roughness={0.85} />
      </mesh>
      <mesh position={[L / 2 + 0.007, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[R, 0.014, 6]} />
        <meshStandardMaterial color="#e6c79c" roughness={0.8} />
      </mesh>
      <mesh position={[L / 2 + 0.0135, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[R * 0.22, 0.0035, 12]} />
        <meshStandardMaterial color="#26262a" roughness={0.5} />
      </mesh>
    </group>
  );
};

/* ---------- Disketler ve kaset ---------- */
const floppyShape = () => {
  const s = new THREE.Shape();
  const S = 0.09;
  const r = 0.004;
  const c = 0.014; // kesik köşe
  s.moveTo(-S / 2 + r, -S / 2);
  s.lineTo(S / 2 - r, -S / 2);
  s.quadraticCurveTo(S / 2, -S / 2, S / 2, -S / 2 + r);
  s.lineTo(S / 2, S / 2 - c);
  s.lineTo(S / 2 - c, S / 2);
  s.lineTo(-S / 2 + r, S / 2);
  s.quadraticCurveTo(-S / 2, S / 2, -S / 2, S / 2 - r);
  s.lineTo(-S / 2, -S / 2 + r);
  s.quadraticCurveTo(-S / 2, -S / 2, -S / 2 + r, -S / 2);
  return s;
};

export const Floppy: FC<{ kind: "blue" | "black" }> = ({ kind }) => {
  const face = useMemo(() => getFloppy(kind), [kind]);
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(floppyShape(), { depth: 0.0032, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); // yatır: kalınlık +y
    return g;
  }, []);
  return (
    <>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={kind === "blue" ? "#22406f" : "#1a1a1e"} roughness={0.5} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.0033, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ noShadow: true }}>
        <planeGeometry args={[0.09, 0.09]} />
        <meshStandardMaterial map={face} alphaTest={0.5} roughness={0.45} metalness={0.05} />
      </mesh>
    </>
  );
};

export const Cassette: FC = () => {
  const face = useMemo(getCassette, []);
  return (
    <>
      <RoundedBox args={[0.1, 0.0085, 0.064]} radius={0.004} smoothness={4} position={[0, 0.00425, 0]}>
        <meshPhysicalMaterial color="#1d1d21" roughness={0.35} clearcoat={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.00855, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ noShadow: true }}>
        <planeGeometry args={[0.1, 0.064]} />
        <meshPhysicalMaterial map={face} transparent alphaTest={0.4} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
    </>
  );
};

/* ---------- Priz şeridi ---------- */
export const Strip: FC<{ position: V3; rotY?: number }> = ({ position, rotY = 0 }) => {
  const top = useMemo(getStrip, []);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <RoundedBox args={[0.34, 0.03, 0.075]} radius={0.008} smoothness={4} position={[0, 0.015, 0]}>
        <meshPhysicalMaterial color="#e6dfca" roughness={0.5} clearcoat={0.2} />
      </RoundedBox>
      <mesh position={[0, 0.0303, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ noShadow: true, touch: "strip" }}>
        <planeGeometry args={[0.34, 0.075]} />
        <meshStandardMaterial map={top} transparent roughness={0.5} />
      </mesh>
      {/* güç düğmesinin ışığı */}
      <mesh position={[0.1, 0.031, 0]}>
        <boxGeometry args={[0.02, 0.0004, 0.02]} />
        <meshStandardMaterial color="#ff2a1f" emissive="#ff2a1f" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ---------- İtilebilir eşya: parmak dokununca kayar, döner, sürtünmeyle durur ---------- */
// Çocuğun yerel orijini eşyanın merkezi olmalı; konumu bu bileşen yönetir (touch.ts fiziği)
export const Pushable: FC<{
  x: number;
  z: number;
  y?: number;
  rot?: number;
  r: number;
  h: number;
  mass: number;
  layer?: number;
  children: ReactNode;
}> = ({ x, z, y = 0, rot = 0, r, h, mass, layer = 0, children }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    group.position.set(x, y, z);
    group.rotation.y = rot;
    return registerItem({ group, x, z, y, rot, vx: 0, vz: 0, vr: 0, r, h, mass, layer });
    // başlangıç durumu yalnızca bir kez okunur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <group ref={ref}>{children}</group>;
};
