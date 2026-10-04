"use client";

import { useMemo, useRef, useState, type FC } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CrtScreen, type ScreenLink, type ScreenText } from "./crt-screen";
import { playKnob, playPower } from "./sfx";
import { getGrain, getPlate } from "./textures";

// Ölçüler metre. Monitörün ön plakasının önü z≈0, gövde arkaya (-z) doğru uzanır.
const W = 0.4;
const H = 0.35;
const PD = 0.024; // ön plaka kalınlığı
const BEVEL = 0.006;
const HW = 0.35; // ekran açıklığı: plaka genişliğinin %87'si
const HH = 0.2625;
const HY = 0.022; // açıklığın plaka merkezine göre yüksekliği
const DW = 0.33; // eğimli çerçevenin iç kenarı
const DH = 0.2475;
const DEPTH = 0.026; // eğimin derinliği

const roundedRect = <T extends THREE.Path>(p: T, w: number, h: number, r: number, cy = 0): T => {
  const x = -w / 2;
  const y = cy - h / 2;
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  return p;
};

// Yuvarlak dikdörtgen halka: her kenar ve her köşe sabit sayıda noktayla örneklenir.
// Böylece farklı köşe yarıçaplı iki halkanın k. noktaları hep aynı bölgeye düşer; eşit aralıklı
// örneklemede köşelerde kayıp yüzeyi burup ekranın içine taşırıyordu. Köşeler, plakadaki deliğin
// aynısı (quadratic eğri) — aralarında boşluk kalmaz.
const ring = (w: number, h: number, r: number, nEdge = 24, nArc = 16) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, HY - h / 2, HY + h / 2];
  const pts: THREE.Vector2[] = [];
  const line = (ax: number, ay: number, bx: number, by: number) => {
    for (let i = 0; i < nEdge; i++) pts.push(new THREE.Vector2(ax + ((bx - ax) * i) / nEdge, ay + ((by - ay) * i) / nEdge));
  };
  const corner = (ax: number, ay: number, cx: number, cy: number, bx: number, by: number) => {
    for (let i = 0; i < nArc; i++) {
      const t = i / nArc;
      const u = 1 - t;
      pts.push(new THREE.Vector2(u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by));
    }
  };
  line(x0 + r, y0, x1 - r, y0);
  corner(x1 - r, y0, x1, y0, x1, y0 + r);
  line(x1, y0 + r, x1, y1 - r);
  corner(x1, y1 - r, x1, y1, x1 - r, y1);
  line(x1 - r, y1, x0 + r, y1);
  corner(x0 + r, y1, x0, y1, x0, y1 - r);
  line(x0, y1 - r, x0, y0 + r);
  corner(x0, y0 + r, x0, y0, x0 + r, y0);
  pts.push(pts[0].clone());
  return pts;
};

// İki halka arasında yüzey (eğimli çerçeve için)
const loft = (a: THREE.Vector2[], za: number, b: THREE.Vector2[], zb: number) => {
  const n = a.length;
  const pos: number[] = [];
  const idx: number[] = [];
  a.forEach((p) => pos.push(p.x, p.y, za));
  b.forEach((p) => pos.push(p.x, p.y, zb));
  for (let i = 0; i < n - 1; i++) idx.push(i, i + 1, n + i + 1, i, n + i + 1, n + i);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

// Ekranın sayfada okunabilir olması için monitör gerçek boyutundan büyük.
// Değişirse crt-scene'deki konum, ekran ışığı ve touch.ts'teki monitör kutusu da güncellenmeli.
const SCALE = 1.6;

// Düğme seviyeleri 0..4 (2 = ortada, varsayılan): parlaklık ve kontrast
const BRIGHT = [0.55, 0.78, 1, 1.25, 1.55];
const CONTRAST = [0.8, 0.9, 1, 1.15, 1.3];

// Ayar düğmesi: tıklayınca bir kademe döner, gösterge çizgisi yönü belli eder
const Knob: FC<{ x: number; level: number; onClick: () => void }> = ({ x, level, onClick }) => {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.z += ((level - 2) * -0.62 - g.current.rotation.z) * Math.min(1, dt * 12);
  });
  return (
    <group
      ref={g}
      position={[x, -0.142, BEVEL + 0.006]}
      onClick={(e) => {
        e.stopPropagation();
        playKnob();
        onClick();
      }}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0105, 0.0118, 0.009, 40]} />
        <meshPhysicalMaterial color="#efe8d4" roughness={0.35} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.0068, 0.0046]}>
        <boxGeometry args={[0.0015, 0.0062, 0.0007]} />
        <meshStandardMaterial color="#3a352b" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Güç tuşu: basınca içeri gömülüp geri çıkar
const PowerButton: FC<{ x: number; onClick: () => void }> = ({ x, onClick }) => {
  const g = useRef<THREE.Group>(null);
  const dip = useRef(0);
  useFrame((_, dt) => {
    dip.current = Math.max(0, dip.current - dt * 5);
    if (g.current) g.current.position.z = BEVEL + 0.004 - dip.current * 0.003;
  });
  return (
    <group
      ref={g}
      position={[x, -0.142, BEVEL + 0.004]}
      onClick={(e) => {
        e.stopPropagation();
        dip.current = 1;
        onClick();
      }}
    >
      <RoundedBox args={[0.034, 0.016, 0.008]} radius={0.002} smoothness={3}>
        <meshPhysicalMaterial color="#f2ecda" roughness={0.4} clearcoat={0.3} />
      </RoundedBox>
    </group>
  );
};

type Props = {
  links: ScreenLink[];
  text: ScreenText;
  position: [number, number, number];
};

export const Monitor: FC<Props> = ({ links, text, position }) => {
  const [power, setPower] = useState(true);
  const [knobs, setKnobs] = useState<[number, number]>([2, 2]);
  const grain = useMemo(getGrain, []);
  const led = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    if (led.current) led.current.emissiveIntensity += ((power ? 5 : 0.1) - led.current.emissiveIntensity) * Math.min(1, dt * 8);
  });
  const plate = useMemo(() => getPlate("AFU-80"), []);

  const plateGeo = useMemo(() => {
    const s = roundedRect(new THREE.Shape(), W, H, 0.034);
    s.holes.push(roundedRect(new THREE.Path(), HW, HH, 0.036, HY));
    return new THREE.ExtrudeGeometry(s, {
      depth: PD,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 6,
      curveSegments: 24,
    });
  }, []);

  const [dishGeo, lipGeo] = useMemo(() => {
    const outer = ring(HW, HH, 0.036);
    const inner = ring(DW, DH, 0.04);
    const lip = ring(DW - 0.008, DH - 0.008, 0.038);
    return [loft(outer, 0, inner, -DEPTH), loft(inner, -DEPTH, lip, -DEPTH - 0.006)];
  }, []);

  const plastic = { roughness: 0.52, clearcoat: 0.18, clearcoatRoughness: 0.35, bumpMap: grain, bumpScale: 0.6 };
  const front = "#dad1b8";
  const shell = "#cfc6ad";

  return (
    <group position={position} scale={SCALE}>
      {/* ön plaka */}
      <mesh geometry={plateGeo} position={[0, 0, -PD]}>
        <meshPhysicalMaterial color={front} {...plastic} />
      </mesh>
      {/* eğimli çerçeve ve ekranın siyah iç dudağı */}
      <mesh geometry={dishGeo}>
        <meshPhysicalMaterial color="#b9b097" side={THREE.DoubleSide} {...plastic} roughness={0.6} />
      </mesh>
      <mesh geometry={lipGeo}>
        <meshStandardMaterial color="#0b0b0b" side={THREE.DoubleSide} roughness={0.9} />
      </mesh>

      <CrtScreen
        links={links}
        text={text}
        position={[0, HY, -DEPTH - 0.008]}
        size={[0.338, 0.2535]}
        power={power}
        bright={BRIGHT[knobs[0]]}
        contrast={CONTRAST[knobs[1]]}
      />

      {/* arka gövde: iki kademe. Ön yüzü ekran camının arkasında kalmalı: camın köşelerinde bombe
          sıfıra iner, gövde öne taşarsa köşelerden görünür */}
      <RoundedBox args={[W - 0.03, H - 0.03, 0.212]} radius={0.04} smoothness={6} position={[0, -0.004, -PD - BEVEL - 0.114]}>
        <meshPhysicalMaterial color={shell} {...plastic} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.26, 0.15]} radius={0.04} smoothness={6} position={[0, -0.004, -PD - BEVEL - 0.28]}>
        <meshPhysicalMaterial color="#c4bba2" {...plastic} />
      </RoundedBox>

      {/* üstteki havalandırma yarıkları */}
      {Array.from({ length: 19 }, (_, i) => (
        <mesh key={i} position={[(i - 9) * 0.0125, (H - 0.03) / 2 - 0.004 + 0.0006, -0.13]} userData={{ noShadow: true }}>
          <boxGeometry args={[0.0032, 0.0012, 0.09]} />
          <meshStandardMaterial color="#5c5644" roughness={0.9} />
        </mesh>
      ))}

      {/* çene: marka plakası, ızgara, düğmeler, güç tuşu ve LED */}
      <mesh position={[-0.14, -0.142, BEVEL + 0.0004]} userData={{ noShadow: true }}>
        <planeGeometry args={[0.064, 0.016]} />
        <meshStandardMaterial map={plate} roughness={0.5} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={i} position={[-0.09 + i * 0.0048, -0.142, BEVEL - 0.0008]} userData={{ noShadow: true }}>
          <boxGeometry args={[0.0018, 0.014, 0.002]} />
          <meshStandardMaterial color="#8a8269" roughness={0.9} />
        </mesh>
      ))}
      {/* düğmelerin oturduğu çukur panel */}
      <RoundedBox args={[0.118, 0.036, 0.004]} radius={0.004} smoothness={3} position={[0.118, -0.142, BEVEL]}>
        <meshStandardMaterial color="#b9b097" roughness={0.7} />
      </RoundedBox>
      <Knob x={0.087} level={knobs[0]} onClick={() => setKnobs(([b, c]) => [(b + 1) % 5, c])} />
      <Knob x={0.117} level={knobs[1]} onClick={() => setKnobs(([b, c]) => [b, (c + 1) % 5])} />
      <PowerButton
        x={0.154}
        onClick={() => {
          playPower(!power);
          setPower((p) => !p);
        }}
      />
      <mesh position={[0.187, -0.142, BEVEL + 0.002]}>
        <sphereGeometry args={[0.0022, 16, 16]} />
        <meshStandardMaterial ref={led} color="#22c55e" emissive="#4ade80" emissiveIntensity={5} toneMapped={false} />
      </mesh>

      {/* ayak: kısa boyun ve döner taban (tabanın altı y=-0.208) */}
      <RoundedBox args={[0.16, 0.036, 0.13]} radius={0.01} smoothness={4} position={[0, -0.178, -0.17]}>
        <meshPhysicalMaterial color="#bdb49b" {...plastic} />
      </RoundedBox>
      <mesh position={[0, -0.202, -0.17]}>
        <cylinderGeometry args={[0.115, 0.125, 0.012, 64]} />
        <meshPhysicalMaterial color="#cbc2a9" {...plastic} />
      </mesh>
    </group>
  );
};
