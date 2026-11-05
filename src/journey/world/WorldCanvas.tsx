'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CompassRig, WORLD_CAMERA } from './CompassRig';
import { compass } from '@/theme/tokens';

/**
 * The shared WebGL world for the pinned journey. Loaded lazily (next/dynamic, ssr:false)
 * only on the "full" capability tier, after the hero HTML is already visible.
 *
 * - Metals use procedural matcaps; the dial/beads use two lights. No IBL: drei <Environment>
 *   (PMREM) blocked the main thread ~3 s on Windows/ANGLE before the compass could appear.
 * - The render loop pauses when the stage scrolls out of view.
 * - Context loss waits up to 3 s for restoration before calling onFail (SVG fallback).
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
          // Context loss is often transient (GPU reset, driver hiccup). preventDefault lets the
          // browser restore it and three.js re-initialises; only fall back if it stays lost.
          let lostTimer: number | undefined;
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            lostTimer = window.setTimeout(() => onFail?.(), 3000);
          });
          gl.domElement.addEventListener('webglcontextrestored', () => window.clearTimeout(lostTimer));
          // reveal after first frames have rendered
          requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
        }}
      >
        {/* Lights affect only the dial and beads (metals are matcaps): warm key upper-left,
            faint cyan rim lower-right that ties the signal colour to the object. */}
        <ambientLight intensity={0.95} />
        <directionalLight position={[-3, 5, 6]} intensity={1.7} color={compass.keyLight} />
        <directionalLight position={[5, -4, 2]} intensity={0.32} color={compass.rimLight} />
        <Suspense fallback={null}>
          <CompassRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
