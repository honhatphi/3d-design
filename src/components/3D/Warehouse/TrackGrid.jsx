import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { DIMENSIONS } from '@/utils/constants';
import { generateTracks } from '@/utils/layoutParser';
import layoutData from '../../../../docs/warehouse_layout.json';

/**
 * TrackGrid Component
 * Renders the shuttle track system (highways) using InstancedMesh.
 * Includes rails and floor grating.
 */
export default function TrackGrid() {
  const { cellWidth, cellDepth, cellHeight, columnSize, beamSize } = DIMENSIONS;

  // 1. Parse Track Data
  const tracks = useMemo(() => generateTracks(layoutData), []);

  // 2. Refs for InstancedMeshes
  const xRailsRef = useRef(); // Rails running along X-axis
  const zRailsRef = useRef(); // Rails running along Z-axis
  const gratingRef = useRef(); // Floor grating mesh
  const columnsRef = useRef(); // Support columns (Blue)
  const beamsRef = useRef(); // Top Beams (Orange)

  // 3. Update Instances
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    let xRailIdx = 0;
    let zRailIdx = 0;
    let gratingIdx = 0;
    let colIdx = 0;
    let beamIdx = 0;

    const railHeight = 0.12;
    const railWidth = 0.08;
    // Lower rails to sit directly on the beams (beamSize/2 = 0.05, railHeight/2 = 0.06 -> 0.11)
    const railYOffset = beamSize / 2 + railHeight / 2;

    tracks.forEach((track) => {
      const [x, y, z] = track.position;
      const { type } = track;

      // --- SUPPORT COLUMNS (Blue) ---
      // Add columns to all track cells to make them look sturdy
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

      // --- TOP BEAMS (Orange) ---
      // Connect columns at the top to form a frame
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

      // Left Beam
      dummy.position.set(x - cellWidth / 2, y + cellHeight - beamSize/2, z);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.set(cellDepth / beamSize, 1, 1);
      dummy.updateMatrix();
      beamsRef.current.setMatrixAt(beamIdx++, dummy.matrix);

      // Right Beam
      dummy.position.set(x + cellWidth / 2, y + cellHeight - beamSize/2, z);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.set(cellDepth / beamSize, 1, 1);
      dummy.updateMatrix();
      beamsRef.current.setMatrixAt(beamIdx++, dummy.matrix);

      // --- FLOOR GRATING (All Tracks) ---
      // Move grating to sit on top of the beams (beamSize/2 = 0.05)
      dummy.position.set(x, y + beamSize / 2 + 0.01, z);
      dummy.rotation.set(-Math.PI / 2, 0, 0); // Rotate to be flat
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      gratingRef.current.setMatrixAt(gratingIdx++, dummy.matrix);

      // --- Z-RAILS (Vertical Tracks & Intersections) ---
      // Run along Z-axis
      if (type === 'VERTICAL' || type === 'INTERSECTION') {
        // Left Rail
        dummy.position.set(x - cellWidth / 2 + columnSize/2 + railWidth/2, y + railYOffset, z);
        dummy.rotation.set(0, Math.PI / 2, 0); // Rotate to align with Z
        dummy.scale.set(cellDepth / beamSize, railHeight / beamSize, railWidth / beamSize); // Reusing box geometry logic from WarehouseGrid
        dummy.updateMatrix();
        zRailsRef.current.setMatrixAt(zRailIdx++, dummy.matrix);

        // Right Rail
        dummy.position.set(x + cellWidth / 2 - columnSize/2 - railWidth/2, y + railYOffset, z);
        dummy.rotation.set(0, Math.PI / 2, 0);
        dummy.scale.set(cellDepth / beamSize, railHeight / beamSize, railWidth / beamSize);
        dummy.updateMatrix();
        zRailsRef.current.setMatrixAt(zRailIdx++, dummy.matrix);
      }

      // --- X-RAILS (Horizontal Tracks & Intersections) ---
      // Run along X-axis
      // SHORTENED to fit between Z-rails to avoid blocking the Z-path (Rack Entry)
      if (type === 'HORIZONTAL' || type === 'INTERSECTION') {
        const xRailLength = cellWidth - columnSize * 2 - railWidth * 2 - 0.05; // Gap of 5cm

        // Front Rail
        dummy.position.set(x, y + railYOffset, z - cellDepth / 2 + columnSize/2 + railWidth/2);
        dummy.rotation.set(0, 0, 0); // Align with X
        dummy.scale.set(xRailLength / beamSize, railHeight / beamSize, railWidth / beamSize);
        dummy.updateMatrix();
        xRailsRef.current.setMatrixAt(xRailIdx++, dummy.matrix);

        // Back Rail
        dummy.position.set(x, y + railYOffset, z + cellDepth / 2 - columnSize/2 - railWidth/2);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(xRailLength / beamSize, railHeight / beamSize, railWidth / beamSize);
        dummy.updateMatrix();
        xRailsRef.current.setMatrixAt(xRailIdx++, dummy.matrix);
      }
    });

    // Update instance matrices
    if (xRailsRef.current) xRailsRef.current.instanceMatrix.needsUpdate = true;
    if (zRailsRef.current) zRailsRef.current.instanceMatrix.needsUpdate = true;
    if (gratingRef.current) gratingRef.current.instanceMatrix.needsUpdate = true;
    if (columnsRef.current) columnsRef.current.instanceMatrix.needsUpdate = true;
    if (beamsRef.current) beamsRef.current.instanceMatrix.needsUpdate = true;

  }, [tracks, cellWidth, cellDepth, cellHeight, columnSize, beamSize]);

  return (
    <group>
      {/* Support Columns (Blue) */}
      <instancedMesh ref={columnsRef} args={[null, null, tracks.length * 4]} castShadow receiveShadow>
        <boxGeometry args={[columnSize, cellHeight, columnSize]} />
        <meshStandardMaterial color="#4169E1" metalness={0.7} roughness={0.3} />
      </instancedMesh>

      {/* Top Beams (Orange) */}
      <instancedMesh ref={beamsRef} args={[null, null, tracks.length * 4]} castShadow receiveShadow>
        <boxGeometry args={[beamSize, beamSize, beamSize]} />
        <meshStandardMaterial color="#FF6B3D" metalness={0.6} roughness={0.4} />
      </instancedMesh>

      {/* X-Rails (Silver) */}
      <instancedMesh ref={xRailsRef} args={[null, null, tracks.length * 2]} castShadow receiveShadow>
        <boxGeometry args={[beamSize, beamSize, beamSize]} /> {/* Base geometry scaled up */}
        <meshStandardMaterial color="#D5D7DD" metalness={0.8} roughness={0.2} />
      </instancedMesh>

      {/* Z-Rails (Silver) */}
      <instancedMesh ref={zRailsRef} args={[null, null, tracks.length * 2]} castShadow receiveShadow>
        <boxGeometry args={[beamSize, beamSize, beamSize]} />
        <meshStandardMaterial color="#D5D7DD" metalness={0.8} roughness={0.2} />
      </instancedMesh>

      {/* Floor Grating (Wireframe Mesh) */}
      <instancedMesh ref={gratingRef} args={[null, null, tracks.length]} receiveShadow>
        <planeGeometry args={[cellWidth - 0.1, cellDepth - 0.1, 8, 8]} />
        <meshBasicMaterial
          color="#4b5563"
          wireframe={true}
          transparent
          opacity={0.4}
        />
      </instancedMesh>
    </group>
  );
}
