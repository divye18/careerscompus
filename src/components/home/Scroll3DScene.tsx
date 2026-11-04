'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense, useSyncExternalStore } from 'react';
import CareerCompassSystem from './CareerCompassSystem';

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
const noopSubscribe = () => () => {};

export function Scroll3DScene() {
  // Without WebGL the 3D layer is skipped; the page content is unaffected.
  const supported = useSyncExternalStore(noopSubscribe, detectWebGL, () => false);
  if (!supported) return null;

  return (
    <div className="w-full h-full">
      {/* dpr capped for integrated GPUs; no shadows (nothing casts or receives any) */}
      {/* Pointer events come from <body> (client coords) because page sections sit above the canvas. */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 45 }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[5, 10, 5]} intensity={1.2} color="#fff6e5" />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#e0f2fe" />
        <Environment preset="city" environmentIntensity={0.4} />

        <Suspense fallback={null}>
          <CareerCompassSystem />
        </Suspense>
      </Canvas>
    </div>
  );
}
