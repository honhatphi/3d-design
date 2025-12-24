import RackCell from './RackCell';
import { DIMENSIONS } from '@/utils/constants';

/**
 * Rack Row Component - Checkpoint 2
 * Renders 5 rack cells in a horizontal row
 * Spacing: 1.2m between cell centers
 */
export default function RackRow({ position = [0, 0, 0], cellCount = 5 }) {
  const { cellWidth } = DIMENSIONS;

  // Calculate starting X position to center the row
  const startX = -((cellCount - 1) * cellWidth) / 2;

  return (
    <group position={position}>
      {Array.from({ length: cellCount }, (_, i) => (
        <RackCell
          key={`cell-${i}`}
          position={[startX + i * cellWidth, 0, 0]}
        />
      ))}
    </group>
  );
}
