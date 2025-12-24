import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { COLORS, DIMENSIONS } from '@/utils/constants';
import { generateLayout } from '@/utils/layoutParser';
import layoutData from '../../../../docs/warehouse_layout.json';

/**
 * WarehouseGrid - High Performance Instanced Rendering
 * Renders thousands of rack cells using InstancedMesh
 */
export default function WarehouseGrid() {
  const { cellWidth, cellDepth, cellHeight, columnSize, beamSize } = DIMENSIONS;

  // 1. Parse Layout Data
  const racks = useMemo(() => generateLayout(layoutData), []);
  const count = racks.length;

  // 2. Refs for InstancedMeshes
  const columnsRef = useRef();
  const beamsRef = useRef(); // Orange Structural Beams
  const railsRef = useRef(); // Silver Shuttle Rails
  const bracingRef = useRef(); // Orange Diagonal Bracing

  // 3. Update Instances
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    let colIdx = 0;
    let beamIdx = 0;
    let railIdx = 0;
    let braceIdx = 0;

    racks.forEach((rack) => {
      const [x, y, z] = rack.position;

      // --- COLUMNS (4 per cell) ---
      const colOffsets = [
        [-cellWidth / 2, 0, -cellDepth / 2],
        [cellWidth / 2, 0, -cellDepth / 2],
        [-cellWidth / 2, 0, cellDepth / 2],
        [cellWidth / 2, 0, cellDepth / 2],
      ];

      colOffsets.forEach(([ox, oy, oz]) => {
        dummy.position.set(x + ox, y + cellHeight / 2, z + oz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        columnsRef.current.setMatrixAt(colIdx++, dummy.matrix);
      });

      // --- ORANGE STRUCTURAL BEAMS (Front & Back only) ---
      // These connect columns horizontally

      // Front Beam
      dummy.position.set(x, y + cellHeight - beamSize/2, z - cellDepth / 2);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(cellWidth / beamSize, 1, 1);
      dummy.updateMatrix();
      beamsRef.current.setMatrixAt(beamIdx++, dummy.matrix);

      // Back Beam
      dummy.position.set(x, y + cellHeight - beamSize/2, z + cellDepth / 2);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(cellWidth / beamSize, 1, 1);
      dummy.updateMatrix();
      beamsRef.current.setMatrixAt(beamIdx++, dummy.matrix);

      // --- SILVER SHUTTLE RAILS (Left & Right) ---
      // These run along the depth (Z-axis) for the shuttle to drive on
      // Positioned slightly lower than the top beams

      const railHeight = 0.12; // Height of the rail profile
      const railWidth = 0.08;  // Width of the rail surface
      const railYOffset = beamSize / 2 + railHeight / 2; // 0.11

      // Left Rail
      dummy.position.set(x - cellWidth / 2 + columnSize/2 + railWidth/2, y + railYOffset, z);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.set(cellDepth / beamSize, railHeight / beamSize, railWidth / beamSize); // Scale box
      dummy.updateMatrix();
      railsRef.current.setMatrixAt(railIdx++, dummy.matrix);

      // Right Rail
      dummy.position.set(x + cellWidth / 2 - columnSize/2 - railWidth/2, y + railYOffset, z);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.set(cellDepth / beamSize, railHeight / beamSize, railWidth / beamSize);
      dummy.updateMatrix();
      railsRef.current.setMatrixAt(railIdx++, dummy.matrix);

      // --- DIAGONAL BRACING (Orange) ---
      // X-bracing between columns on the sides (Left/Right faces)
      // We'll add one diagonal per side per cell to simulate the look

      const braceLength = Math.sqrt(Math.pow(cellDepth, 2) + Math.pow(cellHeight, 2));
      const angle = Math.atan2(cellHeight, cellDepth);

      // Left Side Diagonal
      dummy.position.set(x - cellWidth / 2, y + cellHeight / 2, z);
      dummy.rotation.set(angle, 0, 0); // Rotate around X axis (side view)
      dummy.scale.set(0.5, 1, braceLength / beamSize); // Thin beam
      dummy.updateMatrix();
      bracingRef.current.setMatrixAt(braceIdx++, dummy.matrix);

      // Right Side Diagonal
      dummy.position.set(x + cellWidth / 2, y + cellHeight / 2, z);
      dummy.rotation.set(-angle, 0, 0); // Opposite angle
      dummy.scale.set(0.5, 1, braceLength / beamSize);
      dummy.updateMatrix();
      bracingRef.current.setMatrixAt(braceIdx++, dummy.matrix);

    });

    columnsRef.current.instanceMatrix.needsUpdate = true;
    beamsRef.current.instanceMatrix.needsUpdate = true;
    railsRef.current.instanceMatrix.needsUpdate = true;
    bracingRef.current.instanceMatrix.needsUpdate = true;
  }, [racks, cellWidth, cellDepth, cellHeight, beamSize, columnSize]);

  return (
    <group>
      {/* COLUMNS INSTANCES */}
      <instancedMesh
        ref={columnsRef}
        args={[null, null, count * 4]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[columnSize, cellHeight, columnSize]} />
        <meshStandardMaterial color={COLORS.rackBlue} metalness={0.6} roughness={0.4} />
      </instancedMesh>

      {/* ORANGE BEAMS INSTANCES */}
      <instancedMesh
        ref={beamsRef}
        args={[null, null, count * 2]} // Reduced count (only front/back)
        castShadow
        receiveShadow
      >
        <boxGeometry args={[beamSize, beamSize, beamSize]} />
        <meshStandardMaterial color={COLORS.rackOrange} metalness={0.6} roughness={0.4} />
      </instancedMesh>

      {/* SILVER RAILS INSTANCES */}
      <instancedMesh
        ref={railsRef}
        args={[null, null, count * 2]} // Left/Right rails
        castShadow
        receiveShadow
      >
        <boxGeometry args={[beamSize, beamSize, beamSize]} />
        <meshStandardMaterial color={COLORS.inoxRail} metalness={0.8} roughness={0.2} />
      </instancedMesh>

      {/* ORANGE BRACING INSTANCES */}
      <instancedMesh
        ref={bracingRef}
        args={[null, null, count * 2]} // Left/Right bracing
        castShadow
        receiveShadow
        visible={false} // Temporarily hidden as per user request
      >
        <boxGeometry args={[beamSize * 0.5, beamSize * 0.5, beamSize]} />
        <meshStandardMaterial color={COLORS.rackOrange} metalness={0.6} roughness={0.4} />
      </instancedMesh>
    </group>
  );
}
