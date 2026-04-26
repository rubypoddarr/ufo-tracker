import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const UfoShip = () => {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.01;
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={group}>
        {/* Main Saucer Body */}
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[2, 2.5, 0.4, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Saucer Lip/Edge */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <torusGeometry args={[2.2, 0.1, 16, 100]} />
          <meshStandardMaterial color="#1e293b" metalness={1} roughness={0.2} />
        </mesh>

        {/* Glowing Engine Ring */}
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8, 0.05, 16, 100]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>

        {/* Top Dome */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#22d3ee" 
            transparent 
            opacity={0.4} 
            metalness={0.5} 
            roughness={0}
          />
        </mesh>

        {/* Inner Core Pulsing */}
        <mesh ref={core} position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      </group>
    </Float>
  );
};
