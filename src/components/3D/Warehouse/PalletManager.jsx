import React, { useEffect, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useWarehouseStore } from '@/store/warehouseStore';
import { gridToWorld } from '@/utils/gridHelpers';

/**
 * PalletManager Component - OPTIMIZED with InstancedMesh
 * Renders all pallets using instancing for high performance
 * Reduces draw calls from thousands to just a few
 */
export default function PalletManager() {
  const inventory = useWarehouseStore((state) => state.inventory);

  // Refs for InstancedMeshes
  const baseRef = useRef(); // Pallet wooden base
  const boxesRef = useRef(); // Cardboard boxes

  // Update instances whenever inventory changes
  useLayoutEffect(() => {
    const pallets = Object.entries(inventory);
    const count = pallets.length;

    if (count === 0) return;

    const dummy = new THREE.Object3D();

    // Pallet dimensions
    const palletHeight = 0.144;
    const boxHeight = 0.3;
    const boxesPerPallet = 18; // 3x2x3 layout

    // Update base instances (one per pallet)
    pallets.forEach(([key], idx) => {
      const [gx, gy, level] = key.split(',').map(Number);
      const pos = gridToWorld(gx, gy, level);

      dummy.position.set(pos[0], pos[1] + palletHeight/2, pos[2]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      baseRef.current.setMatrixAt(idx, dummy.matrix);
    });

    // Update box instances (18 per pallet)
    const width = 1.2;
    const depth = 1.0;
    const cols = 3;
    const rows = 2;
    const layers = 3;

    const boxWidth = (width / cols) - 0.02;
    const boxDepth = (depth / rows) - 0.02;

    let boxIdx = 0;
    pallets.forEach(([key]) => {
      const [gx, gy, level] = key.split(',').map(Number);
      const pos = gridToWorld(gx, gy, level);

      for (let y = 0; y < layers; y++) {
        for (let z = 0; z < rows; z++) {
          for (let x = 0; x < cols; x++) {
            const boxX = pos[0] + (x - (cols - 1) / 2) * (width / cols);
            const boxY = pos[1] + palletHeight + boxHeight / 2 + y * boxHeight;
            const boxZ = pos[2] + (z - (rows - 1) / 2) * (depth / rows);

            dummy.position.set(boxX, boxY, boxZ);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            boxesRef.current.setMatrixAt(boxIdx++, dummy.matrix);
          }
        }
      }
    });

    baseRef.current.instanceMatrix.needsUpdate = true;
    boxesRef.current.instanceMatrix.needsUpdate = true;
  }, [inventory]);

  const count = Object.keys(inventory).length;
  const boxCount = count * 18; // 18 boxes per pallet

  if (count === 0) return null;

  return (
    <group>
      {/* PALLET BASES - Simplified single mesh per pallet */}
      <instancedMesh ref={baseRef} args={[null, null, count]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.144, 1.0]} />
        <meshStandardMaterial color="#e0cda8" roughness={0.8} />
      </instancedMesh>

      {/* CARDBOARD BOXES */}
      <instancedMesh ref={boxesRef} args={[null, null, boxCount]} castShadow receiveShadow>
        <boxGeometry args={[0.37, 0.3, 0.47]} />
        <meshStandardMaterial color="#dcb386" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}
