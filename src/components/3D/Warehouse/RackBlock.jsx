import RackLevel from './RackLevel';
import { DIMENSIONS } from '@/utils/constants';

/**
 * Rack Block Component - Checkpoint 4
 * Renders a complete rack block with depth (Z-axis rows)
 * 5 cells wide × 4 levels tall × 3 rows deep = 60 cells
 */
export default function RackBlock({
  position = [0, 0, 0],
  cellsPerRow = 5,
  levelCount = 4,
  depthRows = 3
}) {
  const { cellDepth } = DIMENSIONS;

  // Calculate starting Z position to center the block
  const startZ = -((depthRows - 1) * cellDepth) / 2;

  return (
    <group position={position}>
      {Array.from({ length: depthRows }, (_, i) => (
        <RackLevel
          key={`depth-${i}`}
          position={[0, 0, startZ + i * cellDepth]}
          levelCount={levelCount}
          cellsPerRow={cellsPerRow}
        />
      ))}
    </group>
  );
}
