import React from 'react';
import { DoubleSide } from 'three';
import { DIMENSIONS } from '@/utils/constants';
import layoutData from '../../../../docs/warehouse_layout.json';

/**
 * WarehouseBuilding Component
 * Renders the warehouse enclosure (Floor, Walls, Ceiling)
 * Size is dynamically calculated based on the grid dimensions.
 */
export default function WarehouseBuilding() {
  const { grid_dimensions } = layoutData.project_config;
  const { x_columns, y_rows, z_levels } = grid_dimensions;
  const { cellWidth, cellDepth, cellHeight } = DIMENSIONS;

  // Calculate total dimensions
  // Add some padding around the racks
  const padding = 4;
  const width = x_columns * cellWidth + padding * 2;
  const depth = y_rows * cellDepth + padding * 2;
  const height = z_levels * cellHeight + 5; // Extra height for lights/cameras

  return (
    <group position={[0, height / 2, 0]}>
      {/* Floor - Concrete */}
      <mesh position={[0, -height / 2, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Walls - Light Grey Industrial */}
      {/* Back Wall */}
      <mesh position={[0, 0, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color="#e5e7eb" side={DoubleSide} />
      </mesh>

      {/* Front Wall (Transparent/Open or just Wall?) - Let's make it a wall but maybe invisible from outside if we want?
          For now, standard wall.
      */}
      <mesh position={[0, 0, depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color="#e5e7eb" side={DoubleSide} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[depth, height, 0.2]} />
        <meshStandardMaterial color="#e5e7eb" side={DoubleSide} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[depth, height, 0.2]} />
        <meshStandardMaterial color="#e5e7eb" side={DoubleSide} />
      </mesh>

      {/* Ceiling - Darker Grey (Optional, maybe open for top-down view?)
          If we put a ceiling, top-down camera needs to be inside or clip through.
          Let's leave ceiling open for now or make it double sided but we are looking from inside?
          The user wants a "CCTV from high up looking down".
          If we have a ceiling, we can't see in unless we are inside.
          Let's omit the ceiling for better visibility, or make it wireframe?
          Let's omit it for now as it blocks the view.
      */}
    </group>
  );
}
