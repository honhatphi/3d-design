import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWarehouseStore } from '../../../store/warehouseStore';
import Pallet from './Pallet';

/**
 * ConveyorPallet Component
 * Renders pallets moving on conveyors using the standard Pallet component
 */
export default function ConveyorPallet({ id }) {
  const palletRef = useRef();
  const palletData = useWarehouseStore((state) => state.conveyorPallets[id]);

  // Set initial position on mount to prevent "flying from center" effect
  useEffect(() => {
    if (palletRef.current && palletData) {
      palletRef.current.position.set(...palletData.position);
    }
  }, []); // Only on mount

  useFrame((state, delta) => {
    if (!palletRef.current || !palletData) return;

    // Smooth interpolation to target position
    const targetPos = new THREE.Vector3(...palletData.position);

    palletRef.current.position.lerp(targetPos, 5 * delta);
  });

  if (!palletData) return null;

  return (
    <group ref={palletRef}>
      <Pallet position={[0, 0, 0]} />
    </group>
  );
}
