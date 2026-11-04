'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CAREER_NODES = [
  { id: 1, name: 'Technology', color: '#0EA5E9' },
  { id: 2, name: 'Medicine', color: '#1E3A8A' },
  { id: 3, name: 'Business', color: '#F59E0B' },
  { id: 4, name: 'Data', color: '#10B981' },
  { id: 5, name: 'Architecture', color: '#8B5CF6' },
  { id: 6, name: 'Law', color: '#EF4444' },
];

// Outer radius of the compass in local units (node orbit 2.4 + node radius 0.15).
const COMPASS_RADIUS = 2.6;

export default function CareerCompassSystem() {
  const groupRef = useRef<THREE.Group>(null);
  const placedRef = useRef(false);
  const nodesShownRef = useRef(0);
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

  useFrame((state, rawDelta) => {
    if (!groupRef.current || !ringsRef.current) return;
    const delta = Math.min(rawDelta, 0.05);

    // Base continuous slow rotation
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.x += delta * 0.02;

    // Dock to the most visible [data-compass-anchor] element so the compass
    // sits beside (desktop) or below (mobile) the copy, never behind it, and
    // scrolls away with the page instead of staying fixed over later sections.
    const { width: vw, height: vh } = state.viewport;
    const W = state.size.width;
    const H = state.size.height;
    let anchor: DOMRect | null = null;
    let anchorEl: Element | null = null;
    let bestVisible = 0;
    document.querySelectorAll('[data-compass-anchor]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const visiblePx = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));
      const fraction = visiblePx / Math.min(r.height, H);
      if (fraction > bestVisible) {
        bestVisible = fraction;
        anchor = r;
        anchorEl = el;
      }
    });

    let targetScale = 0;
    const a = anchor as DOMRect | null;
    // Career nodes show only while docked to an anchor flagged data-compass-nodes
    const el = anchorEl as Element | null;
    nodesShownRef.current = a && bestVisible > 0.3 && el?.hasAttribute('data-compass-nodes') ? 1 : 0;
    if (a && bestVisible > 0.3) {
      const sizePx = Math.min(a.width, a.height, H * 0.9);
      targetScale = Math.min(1.4, (sizePx * (vh / H)) / (2 * COMPASS_RADIUS));
      const targetX = ((a.left + a.width / 2 - W / 2) / W) * vw;
      const targetY = (-(a.top + a.height / 2 - H / 2) / H) * vh;
      if (!placedRef.current) {
        groupRef.current.position.set(targetX, targetY, 0);
        placedRef.current = true;
      } else {
        const k = 1 - Math.exp(-6 * delta);
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, k);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, k);
      }
    }
    const nextScale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 1 - Math.exp(-6 * delta));
    groupRef.current.scale.setScalar(Math.max(nextScale, 0.0001));
    groupRef.current.visible = nextScale > 0.01;
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
              shownRef={nodesShownRef}
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
  shownRef: React.RefObject<number>;
}

function NodeItem({ position, color, isHovered, shownRef }: NodeItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame((state, rawDelta) => {
    if (!meshRef.current || !materialRef.current) return;
    // Clamp: after a hidden tab or stalled frame, delta is large and
    // lerp(x, y, k * delta) would overshoot (k * delta > 1).
    const delta = Math.min(rawDelta, 0.05);
    // Nodes appear only while the compass is docked beside the career list
    const progressScale = shownRef.current;
    
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
