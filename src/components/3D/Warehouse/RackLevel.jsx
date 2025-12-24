import RackRow from './RackRow';
import { DIMENSIONS } from '@/utils/constants';

/**
 * Rack Level Component - Checkpoint 3
 * Renders 4 rack rows stacked vertically
 * Vertical spacing: 2.0m between levels
 */
export default function RackLevel({ position = [0, 0, 0], levelCount = 4, cellsPerRow = 5 }) {
  const { cellHeight } = DIMENSIONS;

  return (
    <group position={position}>
      {Array.from({ length: levelCount }, (_, i) => (
        <RackRow
          key={`level-${i}`}
          position={[0, i * cellHeight, 0]}
          cellCount={cellsPerRow}
        />
      ))}
    </group>
  );
}
