"use client";

import React, { useLayoutEffect, useMemo, useRef, type FC } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { getCalendar, getWall, getWood } from "./textures";
import { shock } from "./touch";

// Masa yüzeyi y=0. Duvar z=-0.70'te. Kamera +z tarafında.
export const WALL_Z = -0.7;

/* ---------- Masa: tahta üst, ön kenar, çekmece ---------- */
export const Desk: FC = () => {
  const { map, bump, edge } = useMemo(getWood, []);
  const top = { map, bumpMap: bump, bumpScale: 0.5, roughness: 0.4, clearcoat: 0.75, clearcoatRoughness: 0.2 };
  const dark = { map: edge, color: "#7a5a44", roughness: 0.5, clearcoat: 0.4 };

  return (
    <group>
      {/* üst tabla: 4 tahta; kalın ön kenar */}
      <mesh position={[0, -0.025, -0.175]}>
        <boxGeometry args={[3.4, 0.05, 1.05]} />
        <meshPhysicalMaterial attach="material-0" map={edge} roughness={0.5} />
        <meshPhysicalMaterial attach="material-1" map={edge} roughness={0.5} />
        <meshPhysicalMaterial attach="material-2" {...top} />
        <meshPhysicalMaterial attach="material-3" map={edge} roughness={0.6} />
        <meshPhysicalMaterial attach="material-4" map={edge} roughness={0.45} clearcoat={0.5} />
        <meshPhysicalMaterial attach="material-5" map={edge} roughness={0.6} />
      </mesh>
      {/* etek ve çekmece */}
      <mesh position={[0, -0.105, 0.33]}>
        <boxGeometry args={[3.2, 0.11, 0.02]} />
        <meshPhysicalMaterial {...dark} />
      </mesh>
      <mesh position={[0, -0.105, 0.345]}>
        <boxGeometry args={[0.95, 0.088, 0.016]} />
        <meshPhysicalMaterial map={edge} color="#94705a" roughness={0.42} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, -0.105, 0.362]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.0055, 0.13, 8, 20]} />
        <meshStandardMaterial color="#d8b25a" metalness={1} roughness={0.28} />
      </mesh>
      {[-0.075, 0.075].map((x) => (
        <mesh key={x} position={[x, -0.105, 0.353]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.014, 16]} />
          <meshStandardMaterial color="#c9a04a" metalness={1} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

/* ---------- Duvar ---------- */
export const Wall: FC = () => {
  const map = useMemo(getWall, []);
  return (
    <mesh position={[0, 0.7, WALL_Z]} receiveShadow>
      <planeGeometry args={[7, 3]} />
      <meshStandardMaterial map={map} roughness={0.92} />
    </mesh>
  );
};

/* ---------- Floresan lamba: armatür + tüp + alan ışığı + gölge ışığı, hepsi aynı titremeyle ---------- */
// CSS sürümündeki 9 sn'lik döngüyle aynı: uzun süre sabit, sonra balast teklemesi
export const flicker = (t: number) => {
  const k = (t % 9) / 9;
  if (k > 0.3 && k < 0.33) return [0.2, 0.85, 0.1][Math.min(2, Math.floor((k - 0.3) / 0.01))];
  if (k > 0.71 && k < 0.725) return 0.45;
  return 1;
};

// Armatür kadrajın hemen üstünde durur (monitörün köşelerinden tüp uçları görünmesin);
// ışıklar 0.7'de kalır, masadaki parlama ve duvardaki ışık hâlesi değişmez.
const LAMP_Y = 0.8;

export const Fluorescent: FC = () => {
  const area = useRef<THREE.RectAreaLight>(null);
  const wash = useRef<THREE.RectAreaLight>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const tube = useRef<THREE.MeshStandardMaterial>(null);
  const scene = useThree((s) => s.scene);

  useLayoutEffect(() => {
    const a = area.current;
    const s = spot.current;
    if (a) a.lookAt(0, 0, 0.1);
    wash.current?.lookAt(0, 0.7, WALL_Z - 1);
    if (s) {
      s.target.position.set(0, 0.05, -0.12);
      scene.add(s.target);
      return () => void scene.remove(s.target);
    }
  }, [scene]);

  useFrame((state) => {
    // çarpılma sırasında şebeke dalgalanır: lamba deli gibi titrer
    const f = shock.t > 0 ? (Math.random() < 0.45 ? 0.12 : 0.6 + Math.random() * 0.7) : flicker(state.clock.elapsedTime);
    if (area.current) area.current.intensity = 1.4 * f;
    if (wash.current) wash.current.intensity = 2.4 * f;
    if (spot.current) spot.current.intensity = 3.2 * f;
    if (tube.current) tube.current.emissiveIntensity = 6 * f;
  });

  return (
    <group>
      {/* armatür */}
      <RoundedBox args={[1.0, 0.05, 0.09]} radius={0.01} smoothness={3} position={[0, LAMP_Y, WALL_Z + 0.05]}>
        <meshStandardMaterial color="#2b2d2b" metalness={0.6} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, LAMP_Y, WALL_Z + 0.115]} rotation={[0, 0, Math.PI / 2]} userData={{ noShadow: true }}>
        <cylinderGeometry args={[0.009, 0.009, 0.9, 24]} />
        <meshStandardMaterial ref={tube} color="#ffffff" emissive="#e6ffee" emissiveIntensity={6} toneMapped={false} />
      </mesh>
      {[-0.46, 0.46].map((x) => (
        <mesh key={x} position={[x, LAMP_Y, WALL_Z + 0.115]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 20]} />
          <meshStandardMaterial color="#141414" roughness={0.6} />
        </mesh>
      ))}

      {/* yumuşak alan ışığı: tahtadaki uzun parlak çizgiyi ve camdaki yansımayı verir */}
      <rectAreaLight ref={area} color="#e8ffee" intensity={1.4} width={0.9} height={0.05} position={[0, 0.7, WALL_Z + 0.16]} />
      {/* duvara yayılan ışık: lambanın çevresini aydınlatır */}
      <rectAreaLight ref={wash} color="#dfffe8" intensity={2.4} width={0.9} height={0.05} position={[0, 0.7, WALL_Z + 0.12]} />
      {/* gölge düşüren ışık */}
      <spotLight
        ref={spot}
        color="#eaffef"
        position={[0.08, 0.95, 0.6]}
        angle={0.75}
        penumbra={1}
        intensity={3.2}
        distance={5}
        decay={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
    </group>
  );
};

/* ---------- Duvar takvimi ---------- */
export const Calendar: FC = () => {
  const map = useMemo(getCalendar, []);
  return (
    <group position={[-0.64, 0.42, WALL_Z + 0.004]} rotation={[0, 0, 0.05]}>
      <mesh position={[0, 0, 0.001]}>
        <boxGeometry args={[0.17, 0.22, 0.002]} />
        <meshStandardMaterial color="#d9cfb2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.0022]}>
        <planeGeometry args={[0.17, 0.22]} />
        <meshStandardMaterial map={map} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.118, 0.006]}>
        <sphereGeometry args={[0.004, 16, 12]} />
        <meshStandardMaterial color="#8d8f93" metalness={1} roughness={0.35} />
      </mesh>
    </group>
  );
};

/* ---------- Duvar prizi ---------- */
export const Outlet: FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position} userData={{ touch: "outlet" }}>
    <RoundedBox args={[0.075, 0.115, 0.008]} radius={0.004} smoothness={3}>
      <meshStandardMaterial color="#e2dbc6" roughness={0.6} />
    </RoundedBox>
    {[0.024, -0.024].map((y) => (
      <mesh key={y} position={[0, y, 0.0045]}>
        <circleGeometry args={[0.014, 24]} />
        <meshStandardMaterial color="#d3ccb6" roughness={0.6} />
      </mesh>
    ))}
    {[0.024, -0.024].flatMap((y) =>
      [-0.005, 0.005].map((x) => (
        <mesh key={`${x}${y}`} position={[x, y, 0.0048]}>
          <planeGeometry args={[0.0028, 0.008]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      )),
    )}
  </group>
);
