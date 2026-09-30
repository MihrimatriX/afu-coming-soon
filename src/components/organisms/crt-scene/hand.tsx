"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, type FC } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { chain, fingerGeometry, KNUCKLES, palmGeometry, POINTING, THUMB } from "./hand-geometry";
import { getPuff } from "./textures";
import { shock, SHOCK_TIME, stepItems, tagOf, touch } from "./touch";
import { playZap } from "./sfx";

// Fare imleci gerçek bir el: işaret parmağının ucu imleç. Parmak, ışının sahnede çarptığı ilk yüzeye
// konur (ekran, düğme, tuş, eşya, masa); tıklayınca yüzeye basar, sürükleyince eşyaları iter.
// Prize basınca çarpılır.

// El hep aynı yönü gösterir: sağdan sola, hafif aşağı ve içeri. Kameranın arkasından gelseydi
// parmak doğrudan ekranın içine bakar, kısalmış görünürdü; yandan bakınca parmak boyu okunur.
const POINT_DIR = new THREE.Vector3(-0.62, -0.38, -0.68).normalize();
const SCALE = 1.1;
const UP = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);
const SKIN = new THREE.Color("#e8b394");
const CHAR = new THREE.Color("#3a2a24");
const noRay = (o: THREE.Object3D) => o.traverse((c) => void (c.raycast = () => {}));
const rnd = (a: number) => (Math.random() * 2 - 1) * a;

/* ---------- El modeli: avuç + dört parmak + başparmak + tırnaklar ---------- */
const HandModel: FC<{ skin: THREE.MeshStandardMaterial }> = ({ skin }) => {
  const parts = useMemo(() => {
    const fingers = POINTING.map((f) => {
      const [kx, ky, kz] = KNUCKLES[f.knuckle];
      const base = new THREE.Vector3(kx, ky, kz + 0.012);
      return fingerGeometry(chain(base, f.yaw, f.pitch, f.roll ?? 0, f.lens, f.bends), f.radii);
    });
    const thumb = fingerGeometry(THUMB, THUMB.radii);
    return { palm: palmGeometry(), fingers, thumb, tip: fingers[0].tip };
  }, []);
  const nailMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#f3cdbd", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 }),
    [],
  );
  useEffect(
    () => () => {
      parts.palm.dispose();
      [...parts.fingers, parts.thumb].forEach((f) => f.geo.dispose());
      nailMat.dispose();
    },
    [parts, nailMat],
  );

  const all = [...parts.fingers, parts.thumb];
  return (
    // işaret parmağının ucu grubun orijini olsun
    <group scale={SCALE}>
      <group position={parts.tip.clone().negate()}>
        <mesh geometry={parts.palm} material={skin} />
        {all.map((f, i) => (
          <mesh key={i} geometry={f.geo} material={skin} />
        ))}
        {/* tırnaklar yalnızca görünen parmaklarda: kıvrık parmakların tırnakları avuç içinde kalır */}
        {[parts.fingers[0], parts.thumb].map((f, i) => (
          <mesh key={`n${i}`} position={f.nail.pos} quaternion={f.nail.quat} scale={[f.nail.r * 0.8, f.nail.r * 0.2, f.nail.r * 1.2]} material={nailMat}>
            <sphereGeometry args={[1, 20, 12]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ---------- Çarpılma efektleri: kıvılcım, ark, mavi ışık, duman ---------- */
const SPARKS = 70;

const ShockFx: FC = () => {
  const sparks = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const smoke = useRef<(THREE.Mesh | null)[]>([]);
  const puff = useMemo(getPuff, []);
  const s = useMemo(
    () => ({
      p: Array.from({ length: SPARKS }, () => new THREE.Vector3()),
      v: Array.from({ length: SPARKS }, () => new THREE.Vector3()),
      life: new Float32Array(SPARKS),
      next: 0,
      spawn: 0,
      o: new THREE.Object3D(),
      tmp: new THREE.Vector3(),
      smokeAge: [0, 0.8, 1.6, 2.4],
    }),
    [],
  );
  const arcGeos = useMemo(
    () => [0, 1, 2].map(() => new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(30), 3))),
    [],
  );
  const arcMat = useMemo(() => new THREE.LineBasicMaterial({ color: "#d6f2ff", toneMapped: false, transparent: true }), []);
  const arcObjs = useMemo(() => arcGeos.map((g) => new THREE.Line(g, arcMat)), [arcGeos, arcMat]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const on = shock.t > 0;

    // kıvılcımlar: temas noktasından saçılır, yerçekimiyle düşer
    if (on) s.spawn += dt * 110;
    while (s.spawn >= 1) {
      s.spawn -= 1;
      const i = s.next++ % SPARKS;
      s.p[i].copy(shock.at);
      s.v[i]
        .copy(shock.normal)
        .multiplyScalar(0.3 + Math.random() * 0.9)
        .add(s.tmp.set(rnd(0.8), rnd(0.6) + 0.25, rnd(0.8)));
      s.life[i] = 0.25 + Math.random() * 0.45;
    }
    const m = sparks.current;
    if (m) {
      for (let i = 0; i < SPARKS; i++) {
        if (s.life[i] > 0) {
          s.life[i] -= dt;
          s.v[i].y -= 2.6 * dt;
          s.p[i].addScaledVector(s.v[i], dt);
          s.o.position.copy(s.p[i]);
          s.o.lookAt(s.tmp.copy(s.p[i]).add(s.v[i]));
          const k = Math.max(0, s.life[i]) * 2.2;
          s.o.scale.set(0.0011 * k, 0.0011 * k, 0.004 + s.v[i].length() * 0.012 * k);
        } else {
          s.o.scale.setScalar(0);
        }
        s.o.updateMatrix();
        m.setMatrixAt(i, s.o.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }

    // elektrik arkları: prizden parmağa zikzak çizgiler
    arcObjs.forEach((line, a) => {
      line.visible = on && Math.random() < 0.7;
      if (!line.visible) return;
      const end = s.tmp.copy(touch.tip).add(new THREE.Vector3(rnd(0.02), rnd(0.015), rnd(0.02)));
      const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let k = 0; k < 10; k++) {
        const f = k / 9;
        const j = k === 0 || k === 9 ? 0 : 0.008 + a * 0.002;
        attr.setXYZ(
          k,
          THREE.MathUtils.lerp(shock.at.x, end.x, f) + rnd(j),
          THREE.MathUtils.lerp(shock.at.y, end.y, f) + rnd(j),
          THREE.MathUtils.lerp(shock.at.z, end.z, f) + rnd(j),
        );
      }
      attr.needsUpdate = true;
      line.geometry.computeBoundingSphere();
    });

    // mavi flaş: ışık hep sahnede (shader yeniden derlenmesin), sadece şiddeti değişir
    if (light.current) {
      light.current.position.copy(shock.at).addScaledVector(shock.normal, 0.03);
      light.current.intensity = on ? 0.4 + Math.random() * 2.8 : 0;
    }

    // duman: çarpılmadan sonra kararmış parmak ucundan yükselir
    const smoking = !on && shock.char > 0.3;
    smoke.current.forEach((p, i) => {
      if (!p) return;
      const mat = p.material as THREE.MeshBasicMaterial;
      if (!smoking) {
        mat.opacity = 0;
        return;
      }
      s.smokeAge[i] = (s.smokeAge[i] + dt) % 3.2;
      const age = s.smokeAge[i] / 3.2;
      p.position.copy(touch.tip).add(s.tmp.set(Math.sin(age * 7 + i) * 0.012, 0.01 + age * 0.13, 0));
      p.scale.setScalar(0.02 + age * 0.07);
      p.quaternion.copy(state.camera.quaternion);
      mat.opacity = Math.sin(age * Math.PI) * 0.28 * Math.min(1, (shock.char - 0.3) * 2);
    });
  });

  return (
    <group userData={{ noShadow: true }}>
      <instancedMesh ref={sparks} args={[undefined, undefined, SPARKS]} userData={{ noShadow: true }} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffe2a8" toneMapped={false} />
      </instancedMesh>
      {arcObjs.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      <pointLight ref={light} color="#9fdcff" intensity={0} distance={1} decay={2} />
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(o) => void (smoke.current[i] = o)} userData={{ noShadow: true }}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={puff} color="#9a9a9a" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

export const TouchHand: FC = () => {
  const rig = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const rc = useMemo(() => new THREE.Raycaster(), []);
  // Not: sheen + clearcoat'lı fiziksel malzeme Windows/Direct3D'de ~10 sn'de derleniyordu.
  // Standart malzeme + hafif sıcak ışıma (deri altı saçılmasını taklit eder) yeterli.
  const skin = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SKIN,
        vertexColors: true,
        roughness: 0.55,
        emissive: new THREE.Color("#5a1a0c"),
        emissiveIntensity: 0.12,
      }),
    [],
  );
  useEffect(() => () => skin.dispose(), [skin]);

  const s = useMemo(
    () => ({
      hit: new THREE.Vector3(),
      n: new THREE.Vector3(0, 1, 0),
      tag: undefined as string | undefined,
      uvx: 0,
      px: NaN,
      py: NaN,
      target: new THREE.Vector3(),
      d: new THREE.Vector3(),
      back: new THREE.Vector3(),
      prev: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      qr: new THREE.Quaternion(),
      zero: new THREE.Vector3(),
      recoil: 0,
      placed: false,
    }),
    [],
  );

  // elin kendi parçaları ışınları engellemesin
  useLayoutEffect(() => {
    if (root.current) noRay(root.current);
  }, []);

  useEffect(() => {
    const move = () => void (touch.visible = true);
    const down = (e: PointerEvent) => {
      if (e.button === 0) touch.down = true;
    };
    const up = () => void (touch.down = false);
    const leave = () => {
      touch.visible = false;
      touch.down = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      touch.visible = touch.down = false;
      touch.keyIndex = -1;
    };
  }, []);

  useFrame((state, rawDt) => {
    const g = rig.current;
    if (!g) return;
    const dt = Math.min(rawDt, 0.05) || 0.016;
    g.visible = touch.visible;
    touch.pressed += ((touch.down ? 1 : 0) - touch.pressed) * (1 - Math.exp(-22 * dt));
    if (!touch.down) shock.armed = true;

    // imlecin altındaki yüzey: ışın testi pahalı, yalnızca imleç oynayınca yapılır
    if (state.pointer.x !== s.px || state.pointer.y !== s.py) {
      s.px = state.pointer.x;
      s.py = state.pointer.y;
      rc.setFromCamera(state.pointer, state.camera);
      const hit = rc.intersectObjects(state.scene.children, true)[0];
      if (hit) {
        s.n.set(0, 1, 0);
        if (hit.face) s.n.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        if (s.n.dot(rc.ray.direction) > 0) s.n.negate();
        s.hit.copy(hit.point);
        s.tag = tagOf(hit.object);
        s.uvx = hit.uv?.x ?? 0;
        touch.keyIndex = s.tag === "keys" && hit.instanceId !== undefined ? hit.instanceId : -1;
      } else {
        rc.ray.at(1.2, s.hit);
        s.n.set(0, 1, 0);
        s.tag = undefined;
        touch.keyIndex = -1;
      }
    }

    // prize bas → çarpıl (basılı tutunca tekrar tekrar değil: bırakıp yeniden basmak gerekir)
    const onOutlet = s.tag === "outlet" || (s.tag === "strip" && s.uvx < 0.68);
    if (onOutlet && touch.down && touch.pressed > 0.55 && shock.armed && shock.t <= 0) {
      shock.t = SHOCK_TIME;
      shock.armed = false;
      shock.char = 1;
      shock.at.copy(s.hit);
      shock.normal.copy(s.n);
      playZap();
    }
    const wasOn = shock.t > 0;
    if (wasOn) shock.t = Math.max(0, shock.t - dt);
    else shock.char = Math.max(0, shock.char - dt / 7);
    if (wasOn && shock.t === 0) s.recoil = 1; // akım kesilince el irkilip geri çekilir
    s.recoil = Math.max(0, s.recoil - dt * 1.6);

    // havada 3 cm; basınca yüzeye iner
    s.target.copy(s.hit).addScaledVector(s.n, 0.032 * (1 - touch.pressed) + 0.001);
    if (!s.placed) {
      touch.tip.copy(s.target);
      s.placed = true;
    } else {
      touch.tip.lerp(s.target, 1 - Math.exp(-18 * dt));
    }
    touch.vel.x += ((touch.tip.x - s.prev.x) / dt - touch.vel.x) * 0.5;
    touch.vel.y += ((touch.tip.z - s.prev.z) / dt - touch.vel.y) * 0.5;
    s.prev.copy(touch.tip);

    // parmak, dokunduğu yüzeye doğru biraz daha eğilir; hafif yana yatık
    s.d.copy(POINT_DIR).addScaledVector(s.n, -0.35).normalize();
    s.m.lookAt(s.zero, s.d, UP);
    s.q.setFromRotationMatrix(s.m).multiply(s.qr.setFromAxisAngle(AXIS_Z, 0.22));
    g.position.copy(touch.tip);
    g.quaternion.copy(s.q);

    if (shock.t > 0) {
      // akım altında titreme
      g.position.add(s.back.set(rnd(0.005), rnd(0.005), rnd(0.005)));
      g.rotateX(rnd(0.09));
      g.rotateZ(rnd(0.09));
      skin.emissive.set("#7fd0ff");
      skin.emissiveIntensity = Math.random() < 0.5 ? 1.1 : 0.05;
    } else {
      // kısa bir kor parıltısı, sonra kararma yavaşça geçer
      const ember = Math.max(0, shock.char - 0.8) * 1.5;
      skin.emissive.set(ember > 0 ? "#ff5a1f" : "#5a1a0c");
      skin.emissiveIntensity = ember > 0 ? ember : 0.12 * (1 - shock.char);
    }
    if (s.recoil > 0) {
      const k = Math.sin(s.recoil * Math.PI * 0.5) * 0.07;
      g.position.addScaledVector(s.back.copy(state.camera.position).sub(touch.tip).normalize(), k);
    }
    // akım sırasında hafif, kesilince tam kararma
    skin.color.copy(SKIN).lerp(CHAR, shock.char * (shock.t > 0 ? 0.25 : 0.8));

    stepItems(dt, {
      on: touch.down && touch.visible && shock.t <= 0,
      x: touch.tip.x,
      y: touch.tip.y,
      z: touch.tip.z,
      vx: touch.vel.x,
      vz: touch.vel.y,
    });
  });

  return (
    <group ref={root}>
      <group ref={rig} visible={false}>
        <HandModel skin={skin} />
      </group>
      <ShockFx />
    </group>
  );
};
