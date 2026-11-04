'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { MotionValue } from 'framer-motion';
import * as THREE from 'three';

interface CampusEnvironmentProps {
  scrollProgress: MotionValue<number>;
}

const points = [
  new THREE.Vector3(0, 3, 14),
  new THREE.Vector3(0, 2.8, 8),
  new THREE.Vector3(0, 2.5, 3),
  new THREE.Vector3(0, 2.3, -2),
  new THREE.Vector3(0, 2.2, -8),
  new THREE.Vector3(0, 2.4, -14),
];
const cameraPath = new THREE.CatmullRomCurve3(points);

const CampusCamera = ({ scrollProgress }: { scrollProgress: MotionValue<number> }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const targetPos = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!cameraRef.current) return;
    
    // scrollProgress is 0 to 1
    const progress = Math.max(0, Math.min(1, scrollProgress.get()));
    
    // Get point on curve
    cameraPath.getPointAt(progress, targetPos.current);
    
    // Smooth camera movement
    cameraRef.current.position.lerp(targetPos.current, 10 * delta);
    
    // Look ahead on the path or slightly downward
    cameraRef.current.lookAt(0, 2, cameraRef.current.position.z - 10);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 3, 14]} fov={50} />;
};

const CampusLighting = () => {
  return (
    <>
      <ambientLight intensity={0.6} color="#FDFBF7" />
      <directionalLight
        castShadow
        position={[20, 30, 10]}
        intensity={1.0}
        color="#FFF5E6"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-bias={-0.0005}
      />
      <Environment preset="dawn" />
    </>
  );
};

const Tree = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Trunk */}
    <mesh position={[0, 1, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.2, 0.3, 2]} />
      <meshStandardMaterial color="#3E2723" roughness={0.9} />
    </mesh>
    {/* Leaves */}
    <mesh position={[0, 3, 0]} castShadow receiveShadow>
      <coneGeometry args={[1.5, 4, 8]} />
      <meshStandardMaterial color="#228B22" roughness={0.8} />
    </mesh>
  </group>
);

const CampusGate3D = () => {
  return (
    <group position={[0, 0, 3]}>
      {/* Stone Pathway */}
      <mesh position={[0, -0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 30]} />
        <meshStandardMaterial color="#EAE8E3" roughness={0.9} />
      </mesh>

      {/* Left Column */}
      <mesh position={[-5, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 8, 3]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.7} />
      </mesh>
      
      {/* Right Column */}
      <mesh position={[5, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 8, 3]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.7} />
      </mesh>
      
      {/* Horizontal Structure */}
      <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[13, 2, 3.5]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.7} />
      </mesh>

      {/* Royal Blue Accents */}
      <mesh position={[-5, 4, 1.6]} castShadow>
        <boxGeometry args={[0.5, 7, 0.1]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[5, 4, 1.6]} castShadow>
        <boxGeometry args={[0.5, 7, 0.1]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 8.5, 1.8]} castShadow>
        <boxGeometry args={[12, 0.5, 0.1]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Champagne Details */}
      <mesh position={[-5, 7.8, 1.7]} castShadow>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#F7E7CE" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[5, 7.8, 1.7]} castShadow>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#F7E7CE" roughness={0.2} metalness={0.6} />
      </mesh>

      {/* Landscaping */}
      <mesh position={[-9, 0.5, 0]} receiveShadow>
        <boxGeometry args={[5, 1, 6]} />
        <meshStandardMaterial color="#EAE8E3" roughness={0.9} />
      </mesh>
      <mesh position={[9, 0.5, 0]} receiveShadow>
        <boxGeometry args={[5, 1, 6]} />
        <meshStandardMaterial color="#EAE8E3" roughness={0.9} />
      </mesh>
      <Tree position={[-9, 1, -1]} />
      <Tree position={[-8, 1, 1]} />
      <Tree position={[9, 1, -1]} />
      <Tree position={[8, 1, 1]} />
    </group>
  );
};

const Pavilion = ({ position, rotation, color }: { position: [number, number, number], rotation: number, color: string }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Stone Base */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 4]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.8} />
      </mesh>
      
      {/* Glass/Modern Upper Structure */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 3, 3.8]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.4} roughness={0.1} metalness={0.1} />
      </mesh>
      
      {/* Roof Frame */}
      <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.4, 4.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Internal Core Accent */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
};

const CampusCourtyard3D = () => {
  return (
    <group position={[0, 0, -14]}>
      {/* Main circular stone plaza */}
      <mesh position={[0, -0.03, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#EAE8E3" roughness={0.9} />
      </mesh>
      
      {/* Central water/planter feature */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2, 0.4, 32]} />
        <meshStandardMaterial color="#F7E7CE" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 32]} />
        <meshStandardMaterial color="#0EA5E9" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Branching Pathways */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
        <mesh key={i} position={[Math.sin(angle) * 14, -0.04, Math.cos(angle) * 14]} receiveShadow rotation={[-Math.PI / 2, 0, -angle]}>
          <planeGeometry args={[4, 10]} />
          <meshStandardMaterial color="#EAE8E3" roughness={0.9} />
        </mesh>
      ))}

      {/* Pavilions */}
      {/* Technology - Royal Blue */}
      <Pavilion position={[-16, 0, -8]} rotation={Math.PI / 6} color="#1E3A8A" />
      {/* Medicine - Forest Green */}
      <Pavilion position={[-16, 0, 8]} rotation={-Math.PI / 6} color="#228B22" />
      {/* Business - Deep Indigo */}
      <Pavilion position={[16, 0, -8]} rotation={-Math.PI / 6} color="#311432" />
      {/* Architecture - Terracotta */}
      <Pavilion position={[16, 0, 8]} rotation={Math.PI / 6} color="#E2725B" />
      {/* Law - Champagne */}
      <Pavilion position={[-8, 0, -18]} rotation={Math.PI / 4} color="#D4AF37" />
      {/* Data Science - Teal */}
      <Pavilion position={[8, 0, -18]} rotation={-Math.PI / 4} color="#008080" />
      
      {/* Decorative Trees in Courtyard */}
      <Tree position={[-8, 0, 8]} />
      <Tree position={[8, 0, 8]} />
      <Tree position={[-8, 0, -8]} />
      <Tree position={[8, 0, -8]} />
    </group>
  );
};

const Ground = () => {
  return (
    <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#FDFBF7" roughness={1} metalness={0} />
    </mesh>
  );
};

export const CampusEnvironment: React.FC<CampusEnvironmentProps> = ({ scrollProgress }) => {
  return (
    <>
      <color attach="background" args={['#FDFBF7']} />
      <fog attach="fog" args={['#FDFBF7', 15, 60]} />
      
      <CampusCamera scrollProgress={scrollProgress} />
      <CampusLighting />
      
      <group>
        <CampusGate3D />
        <CampusCourtyard3D />
        <Ground />
      </group>
    </>
  );
};

export default CampusEnvironment;
