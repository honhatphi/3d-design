import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { COLORS, DIMENSIONS } from '@/utils/constants';

/**
 * Single Rack Cell Component - REVISED v2
 * Blue columns with REAL 3D holes (cylinder cutouts)
 * Size: 1.2m (W) × 1.0m (D) × 2.0m (H)
 */
export default function RackCell({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const { cellWidth, cellDepth, cellHeight, columnSize, beamSize, holeSize, holeSpacing } = DIMENSIONS;

  // Generate hole positions along column height
  const holePositions = useMemo(() => {
    const positions = [];
    for (let y = holeSpacing; y < cellHeight; y += holeSpacing) {
      positions.push(y - cellHeight / 2);
    }
    return positions;
  }, [cellHeight, holeSpacing]);

  return (
    <group ref={groupRef} position={position}>
      {/* VERTICAL COLUMNS (4 corners) - BLUE with REAL 3D HOLES */}
      {[
        [-cellWidth / 2, 0, -cellDepth / 2], // Front-left
        [cellWidth / 2, 0, -cellDepth / 2],  // Front-right
        [-cellWidth / 2, 0, cellDepth / 2],  // Back-left
        [cellWidth / 2, 0, cellDepth / 2],   // Back-right
      ].map((pos, i) => (
        <group key={`col-${i}`} position={[pos[0], cellHeight / 2, pos[2]]}>
          {/* Main column box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[columnSize, cellHeight, columnSize]} />
            <meshStandardMaterial
              color={COLORS.rackBlue}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* OPTIMIZATION: 3D Holes disabled for performance at scale (Rule 7)
              To re-enable for close-ups, we can add a 'detailed' prop later.
          */}
          {/*
          {holePositions.map((holeY, idx) => (
            <mesh
              key={`hole-front-${idx}`}
              position={[0, holeY, -columnSize / 2]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[holeSize / 2, holeSize / 2, columnSize * 0.3, 8]} />
              <meshStandardMaterial color={COLORS.holeColor} />
            </mesh>
          ))}
          */}
        </group>
      ))}

      {/* HORIZONTAL BEAMS (Top) - BRIGHTER ORANGE */}
      {/* Front beam */}
      <mesh position={[0, cellHeight, -cellDepth / 2]} castShadow>
        <boxGeometry args={[cellWidth, beamSize, beamSize]} />
        <meshStandardMaterial
          color={COLORS.rackOrange}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Back beam */}
      <mesh position={[0, cellHeight, cellDepth / 2]} castShadow>
        <boxGeometry args={[cellWidth, beamSize, beamSize]} />
        <meshStandardMaterial
          color={COLORS.rackOrange}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Left beam */}
      <mesh position={[-cellWidth / 2, cellHeight, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[cellDepth, beamSize, beamSize]} />
        <meshStandardMaterial
          color={COLORS.rackOrange}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Right beam */}
      <mesh position={[cellWidth / 2, cellHeight, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[cellDepth, beamSize, beamSize]} />
        <meshStandardMaterial
          color={COLORS.rackOrange}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* BOTTOM BEAMS - BRIGHTER ORANGE */}
      <mesh position={[0, 0, -cellDepth / 2]} castShadow>
        <boxGeometry args={[cellWidth, beamSize, beamSize]} />
        <meshStandardMaterial
          color={COLORS.rackOrange}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0, cellDepth / 2]} castShadow>
        <boxGeometry args={[cellWidth, beamSize, beamSize]} />
        <meshStandardMaterial
          color={COLORS.rackOrange}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* PALLET LANES (Máng Z) - INOX Stainless Steel Rails with side walls + slots */}
      {[
        -cellWidth / 2 + 0.15, // Left rail X
        cellWidth / 2 - 0.15,  // Right rail X
      ].map((railX, railIdx) => (
        <group key={`rail-${railIdx}`} position={[railX, beamSize / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          {/* Base flange */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[cellDepth, 0.05, 0.08]} />
            <meshStandardMaterial
              color={COLORS.inoxRail}
              metalness={0.7}
              roughness={0.25}
              emissive={COLORS.inoxRail}
              emissiveIntensity={0.1}
            />
          </mesh>

          {/* Side walls (C-channel) */}
          <mesh position={[0, 0.06, 0.05]} castShadow>
            <boxGeometry args={[cellDepth, 0.10, 0.02]} />
            <meshStandardMaterial
              color={COLORS.inoxRail}
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0, 0.06, -0.05]} castShadow>
            <boxGeometry args={[cellDepth, 0.10, 0.02]} />
            <meshStandardMaterial
              color={COLORS.inoxRail}
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>

          {/* Slots / perforations along the rail sides */}
          {Array.from({ length: 8 }, (_, i) => -cellDepth / 2 + 0.2 + i * (cellDepth / 8)).map((zPos, slotIdx) => (
            <group key={`slot-${slotIdx}`} position={[zPos, 0.06, 0]}>
              {/* Left wall slot */}
              <mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[0.08, 0.04, 0.005]} />
                <meshStandardMaterial color={COLORS.inoxRail} emissive={COLORS.inoxRail} emissiveIntensity={0.12} />
              </mesh>
              {/* Right wall slot */}
              <mesh position={[0, 0, -0.05]}>
                <boxGeometry args={[0.08, 0.04, 0.005]} />
                <meshStandardMaterial color={COLORS.inoxRail} emissive={COLORS.inoxRail} emissiveIntensity={0.12} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* DIAGONAL CROSS BRACES - X PATTERN (like reference photo) */}
      {/* Front face - X pattern (2 diagonal braces crossing) */}
      {/* Diagonal 1: Bottom-left to top-right */}
      <mesh
        position={[0, cellHeight / 2, -cellDepth / 2 - beamSize / 2]}
        rotation={[0, 0, Math.atan2(cellHeight, cellWidth)]}
        castShadow
      >
        <boxGeometry args={[Math.sqrt(cellWidth ** 2 + cellHeight ** 2), 0.04, 0.04]} />
        <meshStandardMaterial
          color={COLORS.rackBlue}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Diagonal 2: Bottom-right to top-left */}
      <mesh
        position={[0, cellHeight / 2, -cellDepth / 2 - beamSize / 2]}
        rotation={[0, 0, -Math.atan2(cellHeight, cellWidth)]}
        castShadow
      >
        <boxGeometry args={[Math.sqrt(cellWidth ** 2 + cellHeight ** 2), 0.04, 0.04]} />
        <meshStandardMaterial
          color={COLORS.rackBlue}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Back face - X pattern (2 diagonal braces crossing) */}
      {/* Diagonal 1: Bottom-left to top-right */}
      <mesh
        position={[0, cellHeight / 2, cellDepth / 2 + beamSize / 2]}
        rotation={[0, 0, Math.atan2(cellHeight, cellWidth)]}
        castShadow
      >
        <boxGeometry args={[Math.sqrt(cellWidth ** 2 + cellHeight ** 2), 0.04, 0.04]} />
        <meshStandardMaterial
          color={COLORS.rackBlue}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Diagonal 2: Bottom-right to top-left */}
      <mesh
        position={[0, cellHeight / 2, cellDepth / 2 + beamSize / 2]}
        rotation={[0, 0, -Math.atan2(cellHeight, cellWidth)]}
        castShadow
      >
        <boxGeometry args={[Math.sqrt(cellWidth ** 2 + cellHeight ** 2), 0.04, 0.04]} />
        <meshStandardMaterial
          color={COLORS.rackBlue}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}
