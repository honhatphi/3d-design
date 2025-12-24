import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import { useWarehouseStore } from '../../../store/warehouseStore';
import { DIMENSIONS } from '../../../utils/constants';
import Shuttle from './Shuttle';

/**
 * Lift Component
 * Vertical transport for Shuttle + Pallet
 * Updated to match "Silver Mesh Industrial" reference image
 */
export default function Lift({ id, position = [0, 0, 0], height = 8 }) {
  const carriageRef = useRef();
  const counterweightRef = useRef();
  const liftState = useWarehouseStore((state) => state.lifts[id]);
  const completeLiftMove = useWarehouseStore((state) => state.completeLiftMove);
  const shuttles = useWarehouseStore((state) => state.shuttles);

  // Check if any shuttle is on this lift
  const shuttleOnLiftId = Object.keys(shuttles).find(sId => shuttles[sId].onLift === id);

  // Local state for smooth animation
  // Initial Y matches conveyor height (approx 0.16m) to align with rollers
  const [currentY, setCurrentY] = useState((liftState?.level || 1) * DIMENSIONS.cellHeight + 0.16);

  useFrame((state, delta) => {
    if (!liftState || !carriageRef.current) return;

    // Target Y also needs offset
    const targetY = (liftState.targetLevel - 1) * DIMENSIONS.cellHeight + 0.16;
    const speed = 2.0; // m/s

    if (Math.abs(currentY - targetY) > 0.01) {
      const newY = THREE.MathUtils.lerp(currentY, targetY, speed * delta);
      setCurrentY(newY);
      carriageRef.current.position.y = newY;

      // Update Counterweight Position
      if (counterweightRef.current) {
         const cwAbsoluteY = (height - 1.0) - newY;
         counterweightRef.current.position.y = cwAbsoluteY - (height / 2);
      }
    } else {
      if (liftState.status === 'MOVING') {
        completeLiftMove(id);
      }
    }
  });

  // Dimensions based on single cell (approx 1.6m x 1.4m)
  const liftWidth = 1.5; // X-axis
  const liftDepth = 1.3; // Z-axis

  // Materials
  const silverMaterial = <meshStandardMaterial color="#E5E7EB" metalness={0.8} roughness={0.2} />; // Bright Silver/Galvanized
  const darkMetal = <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.5} />; // Dark Grey for mechanism
  const meshMaterial = <meshStandardMaterial color="#9CA3AF" wireframe transparent opacity={0.6} />; // Silver Mesh
  const counterweightMaterial = <meshStandardMaterial color="#64748B" metalness={0.5} roughness={0.7} />; // Slate Grey Concrete/Steel

  // Helper to create horizontal beams at intervals
  const HorizontalBeams = () => {
    const beams = [];
    const levels = 4; // Number of horizontal divisions
    const step = height / levels;

    for (let i = 1; i < levels; i++) {
      const y = i * step;
      // Side Beams (X-axis)
      beams.push(
        <mesh key={`beam-x-${i}`} position={[0, y, -liftDepth/2]}>
          <boxGeometry args={[liftWidth, 0.05, 0.05]} />
          {silverMaterial}
        </mesh>
      );
      beams.push(
        <mesh key={`beam-x2-${i}`} position={[0, y, liftDepth/2]}>
          <boxGeometry args={[liftWidth, 0.05, 0.05]} />
          {silverMaterial}
        </mesh>
      );
      // Side Beams (Z-axis)
      beams.push(
        <mesh key={`beam-z-${i}`} position={[-liftWidth/2, y, 0]}>
          <boxGeometry args={[0.05, 0.05, liftDepth]} />
          {silverMaterial}
        </mesh>
      );
      beams.push(
        <mesh key={`beam-z2-${i}`} position={[liftWidth/2, y, 0]}>
          <boxGeometry args={[0.05, 0.05, liftDepth]} />
          {silverMaterial}
        </mesh>
      );
    }
    return <group>{beams}</group>;
  };

  return (
    <group position={position}>
      {/* --- STATIC STRUCTURE --- */}

      {/* 4 Main Vertical Pillars (Silver) */}
      <mesh position={[-liftWidth/2, height/2, -liftDepth/2]} castShadow>
        <boxGeometry args={[0.1, height, 0.1]} />
        {silverMaterial}
      </mesh>
      <mesh position={[liftWidth/2, height/2, -liftDepth/2]} castShadow>
        <boxGeometry args={[0.1, height, 0.1]} />
        {silverMaterial}
      </mesh>
      <mesh position={[-liftWidth/2, height/2, liftDepth/2]} castShadow>
        <boxGeometry args={[0.1, height, 0.1]} />
        {silverMaterial}
      </mesh>
      <mesh position={[liftWidth/2, height/2, liftDepth/2]} castShadow>
        <boxGeometry args={[0.1, height, 0.1]} />
        {silverMaterial}
      </mesh>

      {/* Top Frame */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[liftWidth + 0.1, 0.1, liftDepth + 0.1]} />
        {silverMaterial}
      </mesh>

      {/* Horizontal Support Beams */}
      <HorizontalBeams />

      {/* --- MESH PANELS --- */}
      {/* Left Wall (-X) - Full Mesh */}
      <mesh position={[-liftWidth/2, height/2, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[liftDepth, height, 8, 20]} />
        {meshMaterial}
      </mesh>

      {/* Right Wall (+X) - Full Mesh */}
      <mesh position={[liftWidth/2, height/2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[liftDepth, height, 8, 20]} />
        {meshMaterial}
      </mesh>

      {/* Back Wall (+Z) - OPEN (No Mesh) */}
      {/* Removed per user request to match Front side */}

      {/* Front Wall (-Z) - OPEN (No Mesh) */}
      {/* Removed per user request to open aisle side */}

      {/* --- MECHANISM (Counterweight/Motor on Right Side) --- */}
      <group position={[liftWidth/2 - 0.2, height/2, 0]}>
         {/* Vertical Guide Rails */}
         <mesh position={[0, 0, -0.2]}>
            <boxGeometry args={[0.1, height, 0.05]} />
            {darkMetal}
         </mesh>
         <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[0.1, height, 0.05]} />
            {darkMetal}
         </mesh>

         {/* MOVING COUNTERWEIGHT */}
         <mesh ref={counterweightRef} position={[0, height/2 - 1.0, 0]}>
            <boxGeometry args={[0.25, 0.8, 0.5]} />
            {counterweightMaterial}
         </mesh>
      </group>

      {/* --- DOORS (Silver Mesh Style) --- */}
      {/* Exit Door (Z-) - REMOVED */}

      {/* Entry Door (Z+) - REMOVED */}

      {/* --- CARRIAGE --- */}
      <group ref={carriageRef} position={[0, currentY, 0]}>
        {/* Platform Base Frame (Dark Grey) */}
        <mesh position={[0, 0.025, 0]} receiveShadow>
          <boxGeometry args={[liftWidth - 0.1, 0.05, liftDepth - 0.1]} />
          <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* --- CHAIN CONVEYOR SYSTEM ON LIFT --- */}
        {/* Two chain tracks to pull pallets in/out */}
        {[-0.35, 0.35].map((xPos, i) => (
          <group key={i} position={[xPos, 0.08, 0]}>
            {/* Chain Track Support */}
            <mesh position={[0, -0.015, 0]}>
              <boxGeometry args={[0.12, 0.06, liftDepth - 0.15]} />
              <meshStandardMaterial color="#1F2937" />
            </mesh>

            {/* The Chain itself (Black, slightly metallic) */}
            <mesh position={[0, 0.016, 0]}>
              <boxGeometry args={[0.08, 0.01, liftDepth - 0.15]} />
              <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.6} />
            </mesh>

            {/* Sprockets/Gears at ends (Visual only) */}
            <mesh position={[0, 0, (liftDepth - 0.15)/2]} rotation={[0, 0, Math.PI/2]}>
               <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} />
               <meshStandardMaterial color="#4B5563" />
            </mesh>
            <mesh position={[0, 0, -(liftDepth - 0.15)/2]} rotation={[0, 0, Math.PI/2]}>
               <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} />
               <meshStandardMaterial color="#4B5563" />
            </mesh>
          </group>
        ))}

        {/* Carriage Back Panel */}
        <mesh position={[liftWidth/2 - 0.2, DIMENSIONS.cellHeight / 2, 0]}>
          <boxGeometry args={[0.05, DIMENSIONS.cellHeight - 0.05, liftDepth - 0.2]} />
          <meshStandardMaterial color="#1F2937" metalness={0.5} roughness={0.2} />
        </mesh>

        {/* Top Frame */}
        <mesh position={[0, DIMENSIONS.cellHeight - 0.05, 0]}>
           <boxGeometry args={[liftWidth - 0.25, 0.05, liftDepth - 0.2]} />
           <meshStandardMaterial color="#1F2937" metalness={0.5} roughness={0.2} />
        </mesh>

        {/* Render Shuttle component if it's on this lift */}
        {shuttleOnLiftId && <Shuttle id={shuttleOnLiftId} isOnLift={true} localPosition={[0, 0.05, 0]} />}
      </group>

    </group>
  );
}
