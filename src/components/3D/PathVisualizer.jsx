import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useWarehouseStore } from '../../store/warehouseStore';
import { gridToWorld } from '../../utils/gridHelpers';
import * as THREE from 'three';

/**
 * PathVisualizer Component
 * Renders the planned path of the shuttle as a glowing line
 */
export default function PathVisualizer() {
  const activeShuttleId = useWarehouseStore((state) => state.activeShuttleId);
  const shuttle = useWarehouseStore((state) => state.shuttles[activeShuttleId]);

  const path = shuttle?.path;
  const shuttlePos = shuttle?.position;

  const points = useMemo(() => {
    if (!path || path.length === 0) return null;

    // Start from current shuttle position
    const currentPos = new THREE.Vector3(...shuttlePos);

    // Convert path nodes to world vectors
    const pathPoints = path.map(node => {
      const [x, y, z] = gridToWorld(node.x, node.y, 1); // Assuming level 1 for now
      return new THREE.Vector3(x, y, z);
    });

    return [currentPos, ...pathPoints];
  }, [path, shuttlePos]);

  if (!points || points.length < 2) return null;

  return (
    <group position={[0, 0.1, 0]}> {/* Slightly elevated to avoid z-fighting */}
      <Line
        points={points}
        color="#A855F7" // Purple-500
        lineWidth={4}
        dashed={false}
        opacity={0.8}
        transparent
      />
      {/* Waypoint markers */}
      {points.slice(1).map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#A855F7" />
        </mesh>
      ))}
    </group>
  );
}
