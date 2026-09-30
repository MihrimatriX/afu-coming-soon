"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, type FC, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { bootProgress } from "@/components/organisms/boot-screen/boot-progress";
import { useFluorescentHum } from "@/hooks/use-fluorescent-hum";
import type { ScreenLink } from "./crt-screen";
import { TouchHand } from "./hand";
import { Monitor } from "./monitor";
import { Book, Books, Cable, Cactus, Cassette, Floppy, Keyboard, MouseAndPad, Mug, Notepad, Pencil, Pushable, Rubik, Shelf, Strip } from "./props";
import * as tex from "./textures";
import { crt, shock, SHOCK_TIME } from "./touch";
import { Calendar, Desk, Fluorescent, Outlet, Wall, WALL_Z } from "./room";
import styles from "./crt-scene.module.css";

RectAreaLightUniformsLib.init();
// bu paket indi ve çalıştı: yükleme ekranına haber ver
bootProgress.set({ kernel: true });

// Sahnenin kullandığı bütün dokular; önceden, kareler arasında tek tek üretilir
const TEXTURES = [
  tex.getWood,
  tex.getWall,
  tex.getCalendar,
  tex.getGrain,
  () => tex.getPlate("AFU-80"),
  tex.getPages,
  tex.getPad,
  tex.getNotepad,
  tex.getLegends,
  tex.getPuff,
  tex.getMugLabel,
  tex.getCassette,
  tex.getStrip,
  ...[
    "COMPUTER GRAPHICS",
    "PASCAL",
    "ALGORITHMS",
    "THE C LANGUAGE",
    "UNIX",
    "ASSEMBLER",
    "BASIC",
    "FORTRAN 77",
    "ELECTRONICS",
    "NETWORKS",
  ].map((s) => () => tex.getSpine(s)),
  () => tex.getCover("PASCAL"),
  () => tex.getFloppy("blue"),
  () => tex.getFloppy("black"),
];
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

const LOOK = new THREE.Vector3(0, 0.27, -0.05);

// Kamera sabit ve karşıdan bakar. Dar pencerelerde sahne kadraja sığsın diye geri çekilir.
const Rig: FC = () => {
  const { camera, size } = useThree();
  const base = useMemo(() => new THREE.Vector3(), []);
  useLayoutEffect(() => {
    const k = Math.max(1, 1.5 / (size.width / size.height));
    base.set(0, 0.42 * k, 1.1 * k);
    camera.position.copy(base);
    camera.lookAt(LOOK);
  }, [camera, size.width, size.height, base]);
  // çarpılınca kamera sarsılır
  useFrame(() => {
    const a = shock.t > 0 ? 0.005 * (shock.t / SHOCK_TIME) : 0;
    if (!a && camera.position.equals(base)) return;
    camera.position.set(base.x + (Math.random() - 0.5) * a, base.y + (Math.random() - 0.5) * a, base.z);
    camera.lookAt(LOOK);
  });
  return null;
};

// Shader'ları arka planda, paralel derle (KHR_parallel_shader_compile). Bitene kadar sahne çizilmez;
// yoksa ilk kare hepsini tek seferde ister ve sayfa saniyelerce donar.
const Warmup: FC<{ onDone: () => void }> = ({ onDone }) => {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let alive = true;
    const report = () => {
      const progs = gl.info.programs ?? [];
      const ready = progs.filter((p) => (p as unknown as { isReady?: () => boolean }).isReady?.() ?? true).length;
      bootProgress.set({ shaders: [ready, Math.max(1, progs.length)] });
    };
    const timer = setInterval(report, 100);
    // Efekt katmanı sahneyi ekran dışı bir tampona çizer; three.js tampon için ton eşleme/renk uzayı
    // farklı olan shader varyantı kullanır. Aynı varyant derlensin diye derleme sırasında bir tampon bağlı.
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(rt);
    const compiling = gl.compileAsync(scene, camera); // derleme isteği burada, senkron verilir
    gl.setRenderTarget(prev);
    compiling
      .catch(() => undefined)
      .then(() => {
        clearInterval(timer);
        rt.dispose();
        if (!alive) return;
        const n = Math.max(1, gl.info.programs?.length ?? 1);
        bootProgress.set({ shaders: [n, n] });
        onDone();
      });
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [gl, scene, camera, onDone]);
  return null;
};

// Birkaç kare çizildikten sonra (son efekt shader'ları da derlenmiş olur) yükleme ekranını kapat
const ReadyAfterFrames: FC = () => {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 4) bootProgress.set({ ready: true });
  });
  return null;
};

// Çocuk mesh'lerin hepsi gölge düşürür ve gölge alır (userData.noShadow hariç)
const Shadowed: FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && !m.userData.noShadow) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  });
  return <group ref={ref}>{children}</group>;
};

// Ekranın yeşil ışığı: monitörün önündeki eşyaları ve masayı hafifçe boyar
const ScreenGlow: FC = () => {
  const light = useRef<THREE.RectAreaLight>(null);
  useFrame((state) => {
    if (light.current) // ekran kapalıyken ışığı da söner
    light.current.intensity = (0.8 + Math.sin(state.clock.elapsedTime * 47) * 0.04) * crt.boot;
  });
  return <rectAreaLight ref={light} position={[0, 0.371, -0.035]} width={0.54} height={0.41} color="#4ade80" intensity={0.8} />;
};

// postprocessing, gl.autoClear'ı kapatır. ContactShadows kendi tamponunu temizlemeden çizdiği için
// önceki karelerin gölgesi silinmiyor, hareket eden el ve eşyalar masada iz bırakıyordu.
// Temas gölgesi (öncelik 0) çizilirken temizlemeyi aç, efekt katmanından (öncelik 1) önce kapat.
const ClearContactShadows: FC = () => {
  const gl = useThree((s) => s.gl);
  useFrame(() => void (gl.autoClear = true), -1);
  useFrame(() => void (gl.autoClear = false), 0.5);
  return null;
};

const KEYBOARD_CABLE: [number, number, number][] = [
  [0, 0.01, 0.05],
  [0.03, 0.004, -0.05],
  [0.15, 0.004, -0.16],
  [0.21, 0.004, -0.3],
  [0.19, 0.004, -0.45],
];
const MOUSE_CABLE: [number, number, number][] = [
  [0.277, 0.008, 0.084],
  [0.27, 0.004, 0.03],
  [0.24, 0.004, -0.03],
  [0.22, 0.004, -0.14],
  [0.24, 0.004, -0.3],
  [0.2, 0.004, -0.46],
];
const POWER_CABLE: [number, number, number][] = [
  [0, 0.15, -0.66],
  [0, 0.02, -0.685],
  [0.12, 0.004, -0.62],
  [0.28, 0.02, -0.52],
];
// priz duvarda masanın biraz üstünde: kablo şeritten duvara, oradan yukarı alt yuvaya
const OUTLET_CABLE: [number, number, number][] = [
  [0.58, 0.02, -0.54],
  [0.6, 0.02, -0.64],
  [0.62, 0.07, -0.688],
  [0.62, 0.2, -0.688],
];

const Scene: FC<{ links: ScreenLink[]; onCompiled: () => void }> = ({ links, onCompiled }) => {
  const [power, setPower] = useState(true);
  const [knobs, setKnobs] = useState<[number, number]>([2, 2]);

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <Rig />
      <hemisphereLight args={["#9fb8a8", "#1a1008", 0.14]} />
      <ScreenGlow />
      <Fluorescent />

      {/* yansımalar: gerçek HDR yerine kod ile kurulan ışık levhaları (floresan + hafif dolgu) */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#040504"]} />
        <Lightformer form="rect" intensity={9} color="#eaffef" position={[0, 1.4, -0.5]} rotation-x={Math.PI / 2} scale={[2.4, 0.16, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#eaffef" position={[0.3, 1.25, 1.7]} rotation-x={Math.PI / 2} scale={[1.5, 0.22, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#9fc4a8" position={[-2, 0.6, 1]} rotation-y={Math.PI / 2} scale={[2, 1, 1]} />
      </Environment>

      <Wall />
      <Calendar />
      <Outlet position={[0.62, 0.23, WALL_Z + 0.005]} />

      <Shadowed>
        <Desk />
        <Monitor
          links={links}
          position={[0, 0.336, -0.07]}
          power={power}
          onPower={() => setPower((p) => !p)}
          knobs={knobs}
          onKnob={(i) => setKnobs((k) => (i === 0 ? [(k[0] + 1) % 5, k[1]] : [k[0], (k[1] + 1) % 5]))}
        />
        <Keyboard position={[0, 0.0185, 0.13]} />
        <MouseAndPad position={[0.27, 0, 0.11]} />
        <Pushable x={-0.25} z={0.03} r={0.048} h={0.094} mass={1.2}>
          <Mug position={[0, 0, 0]} />
        </Pushable>
        <Books position={[-0.48, 0, -0.33]} />
        <Shelf position={[-0.76, 0, -0.49]} />
        {/* sağ arka: iki kitap, üstünde kaktüs */}
        <Book position={[0.48, 0.016, -0.3]} rotY={-0.08} size={[0.21, 0.032, 0.15]} cover="#1f3a5a" spine="ELECTRONICS" />
        <Book position={[0.475, 0.045, -0.303]} rotY={0.06} size={[0.19, 0.026, 0.135]} cover="#7a2e3a" spine="NETWORKS" />
        <Cactus position={[0.47, 0.058, -0.31]} />
        <Pushable x={0.47} z={0.03} rot={0.5} r={0.04} h={0.056} mass={0.5}>
          <Rubik position={[0, 0, 0]} />
        </Pushable>
        <Pushable x={-0.35} z={0.16} rot={0.14} r={0.1} h={0.02} mass={1.6}>
          <Notepad position={[0, 0, 0]} />
        </Pushable>
        <Pushable x={-0.15} z={0.25} rot={0.5} r={0.06} h={0.01} mass={0.25}>
          <Pencil position={[0, 0, 0]} />
        </Pushable>
        <Pushable x={0.39} z={-0.12} rot={-0.3} r={0.05} h={0.007} mass={0.4}>
          <Floppy position={[0, 0, 0]} kind="blue" />
        </Pushable>
        <Pushable x={0.395} z={-0.12} y={0.0033} rot={0.25} r={0.05} h={0.007} mass={0.4} layer={1}>
          <Floppy position={[0, 0, 0]} kind="black" />
        </Pushable>
        <Pushable x={0.32} z={-0.005} rot={0.3} r={0.055} h={0.009} mass={0.5}>
          <Cassette position={[0, 0, 0]} />
        </Pushable>
        <Strip position={[0.46, 0, -0.5]} rotY={-0.06} />
        <Cable points={KEYBOARD_CABLE} />
        <Cable points={MOUSE_CABLE} />
        <Cable points={POWER_CABLE} radius={0.0026} />
        <Cable points={OUTLET_CABLE} radius={0.0026} />
        <TouchHand />
      </Shadowed>

      {/* eşyaların altındaki yumuşak temas gölgesi (ışık haritası gölgesine ek) */}
      <ContactShadows position={[0, 0.0006, -0.1]} opacity={0.55} scale={[1.6, 1.1]} blur={2.4} far={0.3} resolution={1024} color="#000000" />

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.4} luminanceThreshold={0.95} luminanceSmoothing={0.2} radius={0.6} />
        <Noise opacity={0.03} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette offset={0.3} darkness={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
      <ClearContactShadows />
      <Warmup onDone={onCompiled} />
      <ReadyAfterFrames />
    </>
  );
};

export const CrtScene: FC<{ links: ScreenLink[] }> = ({ links }) => {
  const hum = useFluorescentHum();
  const [texturesReady, setTexturesReady] = useState(false);
  const [live, setLive] = useState(false);
  const onCompiled = useMemo(() => () => setLive(true), []);

  // dokular: her biri ayrı bir karede üretilir, yükleme ekranı akıcı kalır
  useEffect(() => {
    let alive = true;
    (async () => {
      for (let i = 0; i < TEXTURES.length; i++) {
        TEXTURES[i]();
        bootProgress.set({ textures: [i + 1, TEXTURES.length] });
        await nextFrame();
        if (!alive) return;
      }
      setTexturesReady(true);
    })();
    return () => void (alive = false);
  }, []);

  // Sayfa geneli 'blur(0.2px)' filtresi canvas'ı bulanıklaştırır ve position:fixed'i bozar
  useEffect(() => {
    const prev = document.body.style.filter;
    document.body.style.filter = "none";
    return () => void (document.body.style.filter = prev);
  }, []);

  return (
    <div className={styles.stage}>
      {texturesReady && (
      <Canvas
        frameloop={live ? "always" : "never"}
        // "soft" (PCFSoftShadowMap) bu three sürümünde kaldırıldı; ilk karede sessizce PCF'ye döner ve
        // önceden derlenen bütün shader'ları geçersiz kılar. Baştan PCF veriyoruz.
        shadows="percentage"
        dpr={[1, 1.5]}
        camera={{ fov: 36, near: 0.05, far: 20, position: [0, 0.42, 1.1] }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Scene links={links} onCompiled={onCompiled} />
      </Canvas>
      )}
      <button type="button" className={styles.sound} onClick={hum.toggle} aria-pressed={hum.on}>
        <i className={`fas ${hum.on ? "fa-volume-high" : "fa-volume-xmark"}`} aria-hidden="true" />
        ORTAM SESİ: {hum.on ? "AÇIK" : "KAPALI"}
      </button>
    </div>
  );
};
