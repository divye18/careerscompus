'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type * as THREE from 'three';
import { useJourney } from '../JourneyContext';
import { DOMAINS } from '@/content/domains';
import { deg2rad, morphAt, rigLayout, spokeState, tipGlow } from '../choreography';
import { makeFaceTexture } from './faceTexture';
import { CompassAssets } from './compassAssets';

const CAM_Z = 10;
const FOV = 38;
const pxPerUnitFor = (H: number) => H / (2 * CAM_Z * Math.tan(deg2rad(FOV / 2)));

/** One needle → meridian. Owns its refs and its frame callback (no shared mutable arrays). */
function Spoke({ i, assets }: { i: number; assets: CompassAssets }) {
  const { progress, hover, selected } = useJourney();
  const group = useRef<THREE.Group>(null);
  const shaft = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Mesh>(null);
  const bead = useRef<THREE.Mesh>(null);
  const tipCore = useRef<THREE.Mesh>(null);
  const tipHalo = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const g = group.current;
    const sh = shaft.current;
    const tl = tail.current;
    const bd = bead.current;
    if (!g || !sh || !tl || !bd) return;
    const W = state.size.width;
    const H = state.size.height;
    if (!W || !H) return;

    const m = morphAt(progress.get());
    const L = rigLayout(W, H, m, 'wide');
    const s = spokeState(i, m, state.clock.elapsedTime, L);
    const emph = hover.get() === i ? 1 : 0;
    const bz = L.bezelPx;

    g.rotation.z = deg2rad(s.angle) - Math.PI / 2;

    const len = s.lengthPx / bz;
    const halfW = (s.widthPx * (1 + emph * 0.9)) / 2 / bz;
    sh.scale.set(halfW, len, halfW);
    sh.position.y = len / 2;

    const tailL = s.tailPx / bz;
    tl.visible = tailL > 0.004;
    tl.scale.set(halfW * 0.85, Math.max(tailL, 0.0001), halfW * 0.85);
    tl.position.y = -tailL / 2;

    const r = (s.beadPx * (1 + emph * 0.45)) / bz;
    bd.visible = r > 0.002;
    bd.scale.setScalar(Math.max(r, 0.0001));
    bd.position.y = len;

    const glow = 0.2 + 0.12 * Math.sin(state.clock.elapsedTime * 1.6 + i * 0.9) + emph * 0.45;
    assets.setSpoke(i, s.color, s.opacity, glow, selected.get() === i, DOMAINS[i].hue);

    // Primary needle only: cyan light at the tip (Arrival), fading as it becomes a meridian.
    const tc = tipCore.current;
    const th = tipHalo.current;
    if (tc && th) {
      const o = tipGlow(m);
      tc.visible = th.visible = o > 0.01;
      const core = 4.2 / bz;
      const halo = (10 + Math.sin(state.clock.elapsedTime * 2.2) * 1.2) / bz;
      tc.scale.setScalar(core);
      th.scale.setScalar(halo);
      tc.position.y = th.position.y = len;
      assets.setTip(o);
    }
  });

  return (
    <group ref={group} position={[0, 0, 0.07 + i * 0.002]}>
      <mesh ref={shaft} geometry={assets.geo.cone} material={assets.spokeMats[i]} />
      <mesh ref={tail} geometry={assets.geo.cone} material={assets.spokeMats[i]} rotation={[Math.PI, 0, 0]} />
      <mesh ref={bead} geometry={assets.geo.sphere} material={assets.beadMats[i]} />
      {i === 0 && (
        <>
          <mesh ref={tipHalo} geometry={assets.geo.sphere} material={assets.tipHalo} position={[0, 0, 0.02]} />
          <mesh ref={tipCore} geometry={assets.geo.sphere} material={assets.tipCore} position={[0, 0, 0.03]} />
        </>
      )}
    </group>
  );
}

/**
 * The Meridian Atlas compass: a brass pocket-instrument with an engraved dial,
 * orbit rings, and seven needles that open out into career meridians.
 * Geometries/materials are shared (CompassAssets); per-frame work only touches refs.
 */
export function CompassRig() {
  const { progress } = useJourney();
  const gl = useThree((s) => s.gl);
  const [assets] = useState(() => new CompassAssets());

  const root = useRef<THREE.Group>(null);
  const ringsGroup = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const tilt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const tex = makeFaceTexture(Math.min(8, gl.capabilities.getMaxAnisotropy()));
    assets.setFaceMap(tex);
    return () => {
      assets.setFaceMap(null);
      tex.dispose();
    };
  }, [assets, gl]);

  useEffect(() => () => assets.dispose(), [assets]);

  // pointer parallax (fine pointers only)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, rawDelta) => {
    const g = root.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 0.05); // clamp: large deltas after stalls overshoot lerps
    const t = state.clock.elapsedTime;
    const W = state.size.width;
    const H = state.size.height;
    if (!W || !H) return;

    const m = morphAt(progress.get());
    const L = rigLayout(W, H, m, 'wide');
    const ppu = pxPerUnitFor(H);

    const pt = pointer.current;
    const k = 1 - Math.exp(-6 * dt);
    pt.x += (pt.tx - pt.x) * k;
    pt.y += (pt.ty - pt.y) * k;

    g.position.set((L.cx - W / 2) / ppu, -(L.cy - H / 2) / ppu + Math.sin(t * 0.8) * 0.018, 0);
    g.scale.setScalar(L.bezelPx / ppu);

    const par = 1 - m * 0.7;
    const tx = L.tiltX + Math.sin(t * 0.5) * 0.03 + pt.y * 0.07 * par;
    const ty = L.tiltY + Math.cos(t * 0.42) * 0.035 + pt.x * 0.09 * par;
    const kt = 1 - Math.exp(-10 * dt);
    tilt.current.x += (tx - tilt.current.x) * kt;
    tilt.current.y += (ty - tilt.current.y) * kt;
    g.rotation.set(tilt.current.x, tilt.current.y, 0);

    const rg = ringsGroup.current;
    if (rg) {
      rg.rotation.z = t * 0.06;
      rg.rotation.x = 1.05 + Math.sin(t * 0.2) * 0.04;
      rg.scale.setScalar(L.ringsScale);
      rg.visible = L.ringsOpacity > 0.01;
      assets.setRingsOpacity(L.ringsOpacity);
    }
  });

  return (
    <group ref={root}>
      {/* body */}
      <mesh geometry={assets.geo.bezel} material={assets.brass} />
      <mesh geometry={assets.geo.lip} material={assets.brassDark} position={[0, 0, 0.012]} />
      <mesh geometry={assets.geo.outerRing} material={assets.champagne} position={[0, 0, -0.02]} />
      <mesh
        geometry={assets.geo.face}
        material={[assets.faceSide, assets.faceTop, assets.faceSide]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.01]}
      />
      {/* crown & suspension loop — sits in the gap between meridians 1 and 7 when settled */}
      <mesh geometry={assets.geo.stem} material={assets.brass} position={[0, 1.16, 0]} />
      <mesh geometry={assets.geo.loop} material={assets.brass} position={[0, 1.34, 0]} />

      {DOMAINS.map((d, i) => (
        <Spoke key={d.id} i={i} assets={assets} />
      ))}

      {/* hub cap */}
      <mesh geometry={assets.geo.sphere} material={assets.brass} position={[0, 0, 0.12]} scale={0.075} />

      {/* orbital rings */}
      <group ref={ringsGroup}>
        <mesh geometry={assets.geo.ring1} material={assets.ringA} />
        <mesh geometry={assets.geo.ring2} material={assets.ringB} rotation={[0.5, 0.3, 0]} />
        <mesh geometry={assets.geo.ring3} material={assets.ringA} rotation={[-0.4, 0.2, 0]} />
      </group>
    </group>
  );
}

export const WORLD_CAMERA = { position: [0, 0, CAM_Z] as [number, number, number], fov: FOV, near: 0.1, far: 50 };
