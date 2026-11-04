'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MotionValue } from 'framer-motion';

interface CareerCompassSystemProps {
  globalProgress: MotionValue<number>;
}

const CAREER_NODES = [
  { id: 1, name: 'Technology', color: '#0EA5E9' },
  { id: 2, name: 'Medicine', color: '#1E3A8A' },
  { id: 3, name: 'Business', color: '#F59E0B' },
  { id: 4, name: 'Data', color: '#10B981' },
  { id: 5, name: 'Architecture', color: '#8B5CF6' },
  { id: 6, name: 'Law', color: '#EF4444' },
];

export default function CareerCompassSystem({ globalProgress }: CareerCompassSystemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const centerSphereRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  useEffect(() => {
    const handleHover = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id) {
        setHoveredNodeId(customEvent.detail.id);
      }
    };
    const handleLeave = () => {
      setHoveredNodeId(null);
    };

    window.addEventListener('career-hover', handleHover);
    window.addEventListener('career-leave', handleLeave);
    
    return () => {
      window.removeEventListener('career-hover', handleHover);
      window.removeEventListener('career-leave', handleLeave);
    };
  }, []);

  // Premium Materials created once
  const [materials] = useState(() => ({
    matteStone: new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.8,
      metalness: 0.1,
    }),
    champagneMetal: new THREE.MeshStandardMaterial({
      color: '#F3E5AB',
      roughness: 0.2,
      metalness: 0.8,
    }),
    royalBlue: new THREE.MeshStandardMaterial({
      color: '#1E3A8A',
      roughness: 0.3,
      metalness: 0.6,
    })
  }));

  useFrame((state, delta) => {
    if (!groupRef.current || !ringsRef.current) return;
    const currentProgress = globalProgress.get();

    // Base continuous slow rotation
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.x += delta * 0.02;

    // Scroll-based position mapping
    // At progress 0: center (0,0,0)
    // By progress 0.2: shifted to right (4,0,0)
    const targetX = THREE.MathUtils.lerp(0, 4, Math.min(Math.max(currentProgress / 0.2, 0), 1));
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 5 * delta);

    // Orbit rings expansion logic
    const ringsScale = THREE.MathUtils.lerp(1, 2.5, Math.min(Math.max(currentProgress / 0.2, 0), 1));
    ringsRef.current.scale.setScalar(THREE.MathUtils.lerp(ringsRef.current.scale.x, ringsScale, 5 * delta));
  });

  return (
    <group ref={groupRef}>
      {/* Central Career Compass Core */}
      <mesh ref={centerSphereRef} material={materials.matteStone}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      {/* Thin Orbital Rings */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.champagneMetal}>
          <torusGeometry args={[1.5, 0.015, 16, 100]} />
        </mesh>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]} material={materials.champagneMetal}>
          <torusGeometry args={[1.8, 0.015, 16, 100]} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, Math.PI / 6, 0]} material={materials.royalBlue}>
          <torusGeometry args={[2.0, 0.01, 16, 100]} />
        </mesh>

        {/* Career Nodes */}
        {CAREER_NODES.map((node, i) => {
          const angle = (i / CAREER_NODES.length) * Math.PI * 2;
          const radius = 2.4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <NodeItem 
              key={node.id} 
              id={node.id}
              position={[x, 0, z]} 
              color={node.color}
              isHovered={hoveredNodeId === node.id}
              globalProgress={globalProgress}
            />
          );
        })}
      </group>
    </group>
  );
}

interface NodeItemProps {
  id: number;
  position: [number, number, number];
  color: string;
  isHovered: boolean;
  globalProgress: MotionValue<number>;
}

function NodeItem({ position, color, isHovered, globalProgress }: NodeItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    const currentProgress = globalProgress.get();
    
    // Appear between progress 0.1 and 0.2
    const progressScale = Math.max(0, Math.min(1, (currentProgress - 0.1) / 0.1));
    
    // Smooth scaling for hover and scroll progress
    const targetScale = isHovered ? 1.5 : 1.0;
    const finalScale = targetScale * progressScale;
    
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, finalScale, 10 * delta));
    
    // Add subtle hover floating effect
    if (isHovered) {
      const floatY = Math.sin(state.clock.elapsedTime * 4) * 0.2;
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, floatY, 5 * delta);
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 5 * delta);
    }

    // Glow effect transition
    const targetEmissiveIntensity = isHovered ? 0.8 : 0.0;
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      materialRef.current.emissiveIntensity, 
      targetEmissiveIntensity, 
      10 * delta
    );
  });

  return (
    <mesh ref={meshRef} position={position} scale={0}>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshStandardMaterial 
        ref={materialRef}
        color={color} 
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0}
      />
    </mesh>
  );
}
