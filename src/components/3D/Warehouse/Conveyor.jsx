import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Conveyor Component
 * Modular roller conveyor segment with animation
 */
export default function Conveyor({ position = [0, 0, 0], length = 3, width = 1.2, isMoving = true, direction = 'in', rotation = [0, Math.PI / 2, 0] }) {
  const rollersRef = useRef();

  // Generate rollers
  const rollerCount = Math.floor(length / 0.15); // One roller every 15cm
  const rollers = Array.from({ length: rollerCount }).map((_, i) => {
    const z = -length / 2 + (i * 0.15) + 0.075;
    return (
      <group key={i} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          {/* Low poly (8 segments) + flatShading makes rotation visible without extra markers */}
          <cylinderGeometry args={[0.05, 0.05, width - 0.15, 8]} />
          {/* Green color for rollers to indicate active conveyor */}
          <meshStandardMaterial color="#10B981" metalness={0.5} roughness={0.5} flatShading={true} />
        </mesh>
      </group>
    );
  });

  // Animation for rollers
  useFrame((state, delta) => {
    // Roller animation
    if (isMoving && rollersRef.current) {
      const speed = direction === 'in' ? -5 : 5;
      rollersRef.current.children.forEach(rollerGroup => {
        const cylinder = rollerGroup.children[0];
        if (cylinder) {
          cylinder.rotation.y += delta * speed;
        }
      });
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* --- FRAME --- */}
      {/* Left Rail */}
      <mesh position={[-width / 2 + 0.05, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.15, length]} />
        <meshStandardMaterial color="#1E40AF" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Right Rail */}
      <mesh position={[width / 2 - 0.05, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.15, length]} />
        <meshStandardMaterial color="#1E40AF" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Motor Box (Side) */}
      <mesh position={[width / 2 + 0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.4]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Legs (Supports) */}
      <group position={[0, -0.5, 0]}>
        {[-length/2 + 0.2, length/2 - 0.2].map((z, i) => (
          <group key={i} position={[0, 0, z]}>
             <mesh position={[-width/2 + 0.05, 0, 0]}>
               <boxGeometry args={[0.08, 1.0, 0.08]} />
               <meshStandardMaterial color="#4B5563" />
             </mesh>
             <mesh position={[width/2 - 0.05, 0, 0]}>
               <boxGeometry args={[0.08, 1.0, 0.08]} />
               <meshStandardMaterial color="#4B5563" />
             </mesh>
             {/* Cross bar */}
             <mesh position={[0, -0.2, 0]}>
               <boxGeometry args={[width, 0.05, 0.05]} />
               <meshStandardMaterial color="#4B5563" />
             </mesh>
          </group>
        ))}
      </group>

      {/* --- ROLLERS --- */}
      <group ref={rollersRef} position={[0, 0.02, 0]}>
        {rollers}
      </group>

    </group>
  );
}
