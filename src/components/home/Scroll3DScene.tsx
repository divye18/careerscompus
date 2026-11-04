'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, SoftShadows } from '@react-three/drei';
import { Suspense } from 'react';
import CareerCompassSystem from './CareerCompassSystem';
import { useJourney } from '@/components/home/ScrollJourney';

export function Scroll3DScene() {
  const { globalProgress } = useJourney();

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
        <SoftShadows size={25} samples={16} focus={0.5} />
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight 
          castShadow 
          position={[5, 10, 5]} 
          intensity={1.2} 
          color="#fff6e5" 
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.4} 
          color="#e0f2fe" 
        />
        <Environment preset="city" environmentIntensity={0.4} />

        <Suspense fallback={null}>
          <CareerCompassSystem globalProgress={globalProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
