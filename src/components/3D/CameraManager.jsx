import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWarehouseStore } from '../../store/warehouseStore';
import { gridToWorld } from '../../utils/gridHelpers';

// Helper to convert grid to world for camera preview
const gridToWorldPreview = (x, y, currentY) => {
  return gridToWorld(x, y, 1); // Use level 1 for preview
};

/**
 * Determine camera highway Y based on shuttle area
 * SHUTTLE_1 operates in Lower Block (rows 1-12) → Highway Y=4
 * SHUTTLE_2 operates in Upper Block (rows 13-23) → Highway Y=20
 */
const getCameraHighwayY = (shuttleId, shuttleGridY) => {
  // Primary: Use shuttle ID
  if (shuttleId === 'SHUTTLE_2') return 20;
  if (shuttleId === 'SHUTTLE_1') return 4;

  // Fallback: Use shuttle position if ID unknown
  if (shuttleGridY > 12) return 20;
  return 4;
};

/**
 * CameraManager - Handles different camera modes
 * - FREE: Standard OrbitControls (User controlled)
 * - OVERVIEW: High angle view of the whole warehouse
 * - FOLLOW: Fixed highway chase view following shuttle
 */
export default function CameraManager() {
  const { camera, controls } = useThree();
  const cameraMode = useWarehouseStore((state) => state.cameraMode);
  const activeShuttleId = useWarehouseStore((state) => state.activeShuttleId);
  const shuttle = useWarehouseStore((state) => state.shuttles[activeShuttleId]);
  const shuttlePosition = shuttle?.position;
  const shuttleGridPosition = shuttle?.gridPosition; // {x, y, level}
  const shuttlePath = shuttle?.path || []; // Get remaining path
  const shuttleTarget = shuttle?.target; // Current target
  const isCarrying = shuttle?.carriedPallet !== null;
  const shuttleDirection = shuttle?.direction; // 'X' or 'Z'

  // Target vectors for smooth interpolation
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  // State for smooth following
  const lastShuttlePos = useRef(new THREE.Vector3());
  // Axis-locked direction (+X, -X, +Z, -Z) to keep camera on the same line
  const lastAxisDir = useRef(new THREE.Vector3(0, 0, 1));
  // Smoothed direction to avoid hard jumps when shuttle turns
  const smoothAxisDir = useRef(new THREE.Vector3(0, 0, 1));

  useEffect(() => {
    // Initial setup when mode changes
    if (cameraMode === 'OVERVIEW') {
      // Position high up and back to see everything
      targetPos.current.set(20, 30, 20);
      targetLookAt.current.set(0, 0, 0);

      // Apply immediately for responsiveness
      camera.position.copy(targetPos.current);
      if (controls) controls.target.copy(targetLookAt.current);

    } else if (cameraMode === 'FOLLOW' && shuttlePosition && shuttleGridPosition) {
      const [sx, sy, sz] = shuttlePosition;
      lastShuttlePos.current.set(sx, sy, sz);

      // Determine camera highway Y based on shuttle's area
      const cameraHighwayY = getCameraHighwayY(activeShuttleId, shuttleGridPosition.y);
      const cameraZ = gridToWorld(0, cameraHighwayY, 1)[2]; // Convert highway Y to world Z

      // Initialize direction - camera looks from highway toward shuttle
      const dirToShuttle = new THREE.Vector3(sx, 0, sz).sub(new THREE.Vector3(sx, 0, cameraZ));
      if (Math.abs(dirToShuttle.z) > 0.01) {
        lastAxisDir.current.set(0, 0, Math.sign(dirToShuttle.z));
      } else {
        lastAxisDir.current.set(0, 0, 1);
      }
      smoothAxisDir.current.copy(lastAxisDir.current);

      // Position camera on highway, behind shuttle, same level
      const cameraX = sx - 8.0; // Behind shuttle in X direction
      const cameraY = sy + 1.5; // Slightly elevated (consistent with useFrame)

      const startPos = new THREE.Vector3(cameraX, cameraY, cameraZ);
      camera.position.copy(startPos);
      if (controls) controls.target.set(sx, sy + 1.0, sz);
    }
  }, [cameraMode, activeShuttleId]); // Only reset on mode/shuttle change

  useFrame((state, delta) => {
    if (cameraMode === 'FREE') return; // Let OrbitControls handle it

    const lerpSpeedPos = 2.0 * delta; // Slower for "weighty" camera feel
    const lerpSpeedLook = 4.0 * delta; // Faster for keeping target in sight

    if (cameraMode === 'OVERVIEW') {
       camera.position.lerp(targetPos.current, lerpSpeedPos);
       if (controls) controls.target.lerp(targetLookAt.current, lerpSpeedLook);
       if (controls) controls.update();
       return;
    }

    if (cameraMode === 'FOLLOW' && shuttlePosition && shuttleGridPosition) {
      const [sx, sy, sz] = shuttlePosition;
      const currentVec = new THREE.Vector3(sx, sy, sz);
      const currentLevel = shuttleGridPosition.level || 1;

      // 1. Determine Camera Highway (Fixed on Y=4 or Y=20 based on shuttle area)
      const cameraHighwayY = getCameraHighwayY(activeShuttleId, shuttleGridPosition.y);
      const cameraWorldZ = gridToWorld(0, cameraHighwayY, 1)[2]; // Highway Z position in world

      // 2. Camera Position Strategy:
      // - X: Behind shuttle by a fixed distance (chase view)
      // - Y: Same level as shuttle + slight elevation
      // - Z: Fixed on highway (Y=4 or Y=20)

      let distanceBehind = 8.0; // Chase distance in X
      let heightAbove = 1.5;    // Elevation above shuttle (constant for best view)

      // Calculate ideal camera position
      const idealCameraX = sx - distanceBehind; // Behind in X
      const idealCameraY = sy + heightAbove;     // Same level + elevation
      const idealCameraZ = cameraWorldZ;         // Fixed on highway

      const idealPos = new THREE.Vector3(idealCameraX, idealCameraY, idealCameraZ);

      // 3. Smooth Camera Movement
      camera.position.lerp(idealPos, lerpSpeedPos);

      // 4. Look-At Strategy:
      // Calculate shuttle's forward direction to look ahead
      let lookAtPoint = currentVec.clone();

      if (shuttleTarget) {
        // Shuttle moving → look at target
        const [tx, ty, tz] = shuttleTarget;
        lookAtPoint.set(tx, ty + 1.0, tz);
      } else if (shuttlePath.length > 0) {
        // Has path → look at next step
        const nextStep = shuttlePath[0];
        const nextWorldPos = gridToWorldPreview(nextStep.x, nextStep.y, sy);
        lookAtPoint.set(nextWorldPos[0], sy + 1.0, nextWorldPos[2]);
      } else {
        // Idle → look at shuttle itself
        lookAtPoint.set(sx, sy + 1.0, sz);
      }

      // 5. Update Look-At
      if (controls) {
        controls.target.lerp(lookAtPoint, lerpSpeedLook);
        controls.update();
      }

      // Update last position for next frame
      lastShuttlePos.current.copy(currentVec);
    }
  });

  return null; // This component doesn't render anything visible
}
