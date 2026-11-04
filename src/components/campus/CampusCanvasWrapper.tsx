'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useJourney } from '@/components/home/ScrollJourney';
import { CampusEnvironment } from '@/components/campus/CampusEnvironment';

export function CampusCanvasWrapper() {
  const { globalProgress } = useJourney();
  return (
    <Canvas shadows camera={{ position: [0, 2, 10], fov: 50 }}>
      <Suspense fallback={null}>
        <CampusEnvironment scrollProgress={globalProgress} />
      </Suspense>
    </Canvas>
  );
}
