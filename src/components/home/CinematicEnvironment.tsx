'use client';

import { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Float, Line, Sphere, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const careerNodes = [
  { name: 'Technology',   radius: 2.5, speed: 0.2, phase: 0,   yOffset: 0.5, size: 0.15 },
  { name: 'Engineering',  radius: 3.0, speed: 0.15, phase: 1,  yOffset: -0.8, size: 0.12 },
  { name: 'Medicine',     radius: 2.2, speed: 0.25, phase: 2,  yOffset: 1.2, size: 0.14 },
  { name: 'Business',     radius: 3.5, speed: 0.1, phase: 3,   yOffset: 0.2, size: 0.13 },
  { name: 'Finance',      radius: 2.8, speed: 0.22, phase: 4,  yOffset: -1.0, size: 0.11 },
  { name: 'Law',          radius: 3.2, speed: 0.12, phase: 5,  yOffset: 1.5, size: 0.12 },
  { name: 'Design',       radius: 2.1, speed: 0.3, phase: 6,   yOffset: -0.3, size: 0.14 },
  { name: 'Science',      radius: 3.8, speed: 0.08, phase: 7,  yOffset: 0.8, size: 0.1 },
  { name: 'Architecture', radius: 2.6, speed: 0.18, phase: 8,  yOffset: -1.5, size: 0.13 },
  { name: 'Media',        radius: 3.1, speed: 0.14, phase: 9,  yOffset: 0.4, size: 0.11 },
  { name: 'Psychology',   radius: 2.4, speed: 0.24, phase: 10, yOffset: 1.0, size: 0.12 },
  { name: 'Data Science', radius: 2.9, speed: 0.16, phase: 11, yOffset: -0.5, size: 0.15 },
];

function CareerNode({ data, scroll }: { data: typeof careerNodes[0], scroll: number }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      // Rotate the entire group to create orbit
      groupRef.current.rotation.y = elapsed * data.speed + data.phase;
    }

    if (meshRef.current) {
      // Push nodes forward/back on hover
      const targetX = hovered ? data.radius - 0.5 : data.radius;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
      
      // Brighter & larger on hover
      const scale = hovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connection Line when hovered */}
      {hovered && (
        <Line
          points={[[0, 0, 0], [data.radius - 0.5, data.yOffset, 0]]}
          color="#38bdf8"
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      )}
      
      <mesh
        ref={meshRef}
        position={[data.radius, data.yOffset, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[data.size, 16, 16]} />
        <meshBasicMaterial color={hovered ? "#f5dfa8" : "#5b5ce2"} transparent opacity={hovered ? 1 : 0.6} />
        
        {hovered && (
          <Html center distanceFactor={10} position={[0, data.size + 0.1, 0]}>
            <div className="bg-env-midnight/90 backdrop-blur border border-white/20 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap font-medium pointer-events-none">
              {data.name}
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

function PremiumCompass({ scrollProgress, mountTime }: { scrollProgress: any, mountTime: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const nodesGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const clockTime = state.clock.getElapsedTime();
    const scroll = scrollProgress.get(); 
    
    // Entrance Animation Logic
    const elapsed = clockTime - mountTime;
    const coreScale = THREE.MathUtils.clamp((elapsed - 0.5) * 2, 0, 1); // forms at 0.5s
    const ringsScale = THREE.MathUtils.clamp((elapsed - 0.8) * 2, 0, 1); // forms at 0.8s
    const nodesScale = THREE.MathUtils.clamp((elapsed - 1.0) * 2, 0, 1); // forms at 1.0s

    if (groupRef.current) {
      // Act 1 (Arrival): Centered right.
      const targetX = Math.sin(scroll * Math.PI) * 3 + 2; 
      
      let targetZ = 0;
      if (scroll < 0.3) {
        targetZ = -scroll * 15;
      } else if (scroll < 0.8) {
        targetZ = -50; // Move far away during light UI
      } else {
        targetZ = -(1 - scroll) * 20; // Bring back for Final CTA
      }
      
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);
      
      // Very slow ambient rotation
      groupRef.current.rotation.y = clockTime * 0.05 + (scroll * Math.PI);
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(coreScale);
      coreRef.current.rotation.x = clockTime * 0.2;
      coreRef.current.rotation.y = clockTime * 0.3;
    }

    if (ringsRef.current) {
      ringsRef.current.scale.setScalar(ringsScale);
      ringsRef.current.rotation.x = Math.sin(clockTime * 0.2) * 0.1 + Math.PI / 2.5;
      ringsRef.current.rotation.y = clockTime * -0.1;
    }

    if (nodesGroupRef.current) {
      nodesGroupRef.current.scale.setScalar(nodesScale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={coreRef}>
          <octahedronGeometry args={[1, 2]} />
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={2}
            chromaticAberration={0.8}
            anisotropy={0.5}
            distortion={0.3}
            distortionScale={0.2}
            temporalDistortion={0.1}
            color="#FAF7F0"
            attenuationDistance={2}
            attenuationColor="#D8B86A"
          />
        </mesh>
        
        {/* Glowing Inner Navigational Core */}
        <Sphere args={[0.3, 32, 32]}>
          <meshBasicMaterial color="#3155D9" transparent opacity={0.9} />
        </Sphere>
      </Float>

      {/* Orbital Rings */}
      <group ref={ringsRef}>
        {[1.8, 2.5, 3.2].map((radius, i) => (
          <mesh key={i} rotation-x={Math.PI / 2}>
            <torusGeometry args={[radius, 0.005, 16, 100]} />
            <meshBasicMaterial color="#BFD9FF" transparent opacity={0.5 - (i * 0.1)} />
          </mesh>
        ))}
      </group>

      {/* Organic Career Nodes */}
      <group ref={nodesGroupRef}>
        {careerNodes.map((node, i) => (
          <CareerNode key={i} data={node} scroll={scrollProgress.get()} />
        ))}
      </group>
    </group>
  );
}

function CinematicLighting({ scrollProgress }: { scrollProgress: any }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const scroll = scrollProgress.get();
      lightRef.current.position.y = 5 - scroll * 10;
      lightRef.current.intensity = 2 + scroll; 
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} color="#FAF7F0" />
      <pointLight ref={lightRef} position={[2, 2, 5]} color="#FAF7F0" intensity={2} distance={20} />
      <directionalLight position={[-5, 5, -5]} color="#3155D9" intensity={1.5} />
      {/* Soft Champagne Highlight */}
      <spotLight position={[5, 5, 2]} color="#D8B86A" intensity={1.5} angle={0.5} penumbra={1} />
    </>
  );
}

function CameraController({ scrollProgress }: { scrollProgress: any }) {
  useFrame((state) => {
    const scroll = scrollProgress.get();
    // Move camera slightly as we scroll down
    const targetZ = 8 + scroll * 2;
    const targetY = scroll * 4;
    const targetRotX = -scroll * 0.1;
    
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.05);
  });
  return null;
}

function AnimatedFog({ bgColor }: { bgColor: any }) {
  useFrame((state) => {
    const colorStr = bgColor.get();
    state.scene.fog = new THREE.Fog(new THREE.Color(colorStr), 6, 25);
  });
  return null;
}

function KnowledgeArchive3D({ scrollProgress }: { scrollProgress: any }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const scroll = scrollProgress.get();
    
    // Only visible in the middle section
    const isVisible = scroll > 0.35 && scroll < 0.65;
    groupRef.current.visible = isVisible;
    if (!isVisible) return;
    
    // Parallax and gentle floating
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = (scroll - 0.5) * 10 + Math.sin(t * 0.5) * 0.5;
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      {/* Abstract floating knowledge panels */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[(i % 2 === 0 ? -4 : 4) + (Math.random() - 0.5), (i * 1.5) - 4, -i * 2]}>
          <planeGeometry args={[3, 1]} />
          <meshBasicMaterial color="#3949AB" transparent opacity={0.15} wireframe />
        </mesh>
      ))}
    </group>
  );
}

function UniversityHorizon3D({ scrollProgress }: { scrollProgress: any }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const scroll = scrollProgress.get();
    
    const isVisible = scroll > 0.55 && scroll < 0.85;
    groupRef.current.visible = isVisible;
    if (!isVisible) return;

    groupRef.current.position.y = (scroll - 0.7) * 15 - 5;
    groupRef.current.position.z = -15 + (scroll - 0.7) * 10;
  });

  return (
    <group ref={groupRef}>
      {/* Abstract city silhouette */}
      {[...Array(12)].map((_, i) => {
        const height = 1 + Math.random() * 3;
        return (
          <mesh key={i} position={[-8 + i * 1.5, height / 2, 0]}>
            <boxGeometry args={[0.8, height, 0.8]} />
            <meshStandardMaterial color="#D8B86A" transparent opacity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

function GuidanceLightPath3D({ scrollProgress }: { scrollProgress: any }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const scroll = scrollProgress.get();
    
    const isVisible = scroll > 0.75;
    groupRef.current.visible = isVisible;
    if (!isVisible) return;

    // Path moves forward as we scroll
    groupRef.current.position.z = (scroll - 0.85) * 20;
  });

  return (
    <group ref={groupRef} position={[0, -2, -20]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2, 40]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
      </mesh>
      {/* Center glowing line */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.1, 0]}>
        <planeGeometry args={[0.1, 40]} />
        <meshBasicMaterial color="#f5dfa8" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function AnimatedStars({ scrollProgress, mountTime }: { scrollProgress: any, mountTime: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const scroll = scrollProgress.get();
    
    // Scale down stars to 0 when in the light UI section (0.3 to 0.8)
    let targetScale = 1;
    if (mountTime === 0) {
      targetScale = 0;
    } else if (scroll > 0.25 && scroll < 0.85) {
      targetScale = 0;
    }
    
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group ref={groupRef}>
      <Sparkles count={500} scale={50} size={4} speed={0.3} opacity={0.5} color="#3155D9" />
    </group>
  );
}

export function CinematicEnvironment() {
  const { scrollYProgress } = useScroll();
  const [mountTime, setMountTime] = useState(0);

  useEffect(() => {
    // Record the time the component mounts for entrance sequence
    setMountTime(Date.now() / 1000);
  }, []);

  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.5, 0.65, 0.8, 0.9, 1],
    [
      '#F8F9FC', // Pearl
      '#FAF7F0', // Ivory
      '#FAF7F0', 
      '#FAF7F0', 
      '#F8F9FC', 
      '#FFFFFF', 
      '#EEEFFD', // Lavender
      '#1E2A78'  // Royal Deep
    ]
  );

  return (
    <motion.div 
      className="fixed inset-0 -z-10"
      style={{ backgroundColor: bgColor }}
    >
      {/* Texture overlay for premium feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <AnimatedFog bgColor={bgColor} />
        <CinematicLighting scrollProgress={scrollYProgress} />
        <CameraController scrollProgress={scrollYProgress} />
        
        {mountTime > 0 && (
          <PremiumCompass scrollProgress={scrollYProgress} mountTime={mountTime} />
        )}
        
        <KnowledgeArchive3D scrollProgress={scrollYProgress} />
        <UniversityHorizon3D scrollProgress={scrollYProgress} />
        <GuidanceLightPath3D scrollProgress={scrollYProgress} />
        
        {/* Subtle Stars/Dust appearing early in sequence */}
        <AnimatedStars scrollProgress={scrollYProgress} mountTime={mountTime} />
      </Canvas>
    </motion.div>
  );
}
