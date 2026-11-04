'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { CompassRig, WORLD_CAMERA } from './CompassRig';

/**
 * The shared WebGL world for the pinned journey. Loaded lazily (next/dynamic, ssr:false)
 * only on the "full" capability tier, after the hero HTML is already visible.
 *
 * - Lighting is generated locally (Lightformer rig): no remote HDR fetch.
 * - The render loop pauses when the stage scrolls out of view.
 * - Context loss is handled by calling onFail so the page falls back to the SVG visuals.
 */
export default function WorldCanvas({ onFail }: { onFail?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
      data-world-ready={ready ? 'true' : 'false'}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? 'always' : 'never'}
        camera={WORLD_CAMERA}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            onFail?.();
          });
          // reveal after first frames have rendered
          requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[-3, 5, 6]} intensity={1.3} color="#FFF3DC" />
        <Suspense fallback={null}>
          <Environment frames={1} resolution={256} environmentIntensity={0.95}>
            <Lightformer form="rect" intensity={2.6} color="#FFF4DD" position={[-4, 5, 4]} scale={[9, 4, 1]} />
            <Lightformer form="rect" intensity={1.1} color="#DCE6FF" position={[5, 1, 3]} scale={[5, 8, 1]} />
            <Lightformer form="ring" intensity={1.4} color="#FFFFFF" position={[0, -2, 6]} scale={4} />
            <Lightformer form="rect" intensity={1.8} color="#FFE7B0" position={[0, -5, -2]} scale={[10, 2, 1]} />
          </Environment>
          <CompassRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
