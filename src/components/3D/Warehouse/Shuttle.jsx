import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useWarehouseStore } from '../../../store/warehouseStore';
import Pallet from './Pallet';
import logoImg from '../../../assets/logo.png';

/**
 * 4-Way Shuttle Component - Advanced Animation
 * Supports:
 * - Rail Mode (Z-axis movement)
 * - Aisle Mode (X-axis movement)
 * - Pallet Lifting (Independent mechanism)
 * - Realistic Wheel Switching
 * - Can be rendered standalone or as child of Lift
 */
export default function Shuttle({ id = 'SHUTTLE_1', isOnLift = false, localPosition = [0, 0.05, 0] }) {
  const groupRef = useRef();
  const shuttleState = useWarehouseStore((state) => state.shuttles[id]);
  const updateShuttle = useWarehouseStore((state) => state.updateShuttle);
  const popPathStep = useWarehouseStore((state) => state.popPathStep);
  const logoTexture = useTexture(logoImg);

  // Get initial position from store (only used when not on lift)
  const initialPosition = isOnLift ? localPosition : shuttleState?.position || [0,0,0];

  // Animation States
  const [liftHeight, setLiftHeight] = useState(0); // For Pallet Lifting Plates
  const [modeProgress, setModeProgress] = useState(0); // 0 = AISLE (X), 1 = RAIL (Z)
  const wheelRotationRef = useRef(0); // For wheel rolling animation

  // Sync groupRef position with store on mount
  useEffect(() => {
    if (!isOnLift && groupRef.current && shuttleState?.position) {
      groupRef.current.position.set(...shuttleState.position);
      console.log(`[${id}] Initial position synced:`, shuttleState.position);
    }
  }, []); // Only on mount

  // Dimensions
  const width = 1.2;
  const length = 1.6; // Reduced from 2.0 to make it less long
  const chassisHeight = 0.28;
  const wheelRadius = 0.12; // Increased from 0.08 for bigger wheels
  const wheelWidth = 0.06;
  const clearance = 0.04; // Ground clearance

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Skip movement logic when on lift - lift handles position
    if (isOnLift) {
      // Still update lift height and mode animations
      const targetLift = shuttleState.lifted ? 0.08 : 0;
      const liftSpeed = 3.0;
      if (Math.abs(liftHeight - targetLift) > 0.001) {
        setLiftHeight(THREE.MathUtils.lerp(liftHeight, targetLift, liftSpeed * delta));
      }
      return;
    }

    // 1. Movement Logic
    if (shuttleState.status === 'MOVING') {
      // If we have a target, move towards it
      if (shuttleState.target) {
        const currentPos = new THREE.Vector3(...groupRef.current.position);
        const targetPos = new THREE.Vector3(...shuttleState.target);
        const distance = currentPos.distanceTo(targetPos);
        const speed = 3.0; // Increased from 2.0 for faster movement
        const step = speed * delta;

        // Wheel Rotation Logic
        const omega = speed / wheelRadius;
        wheelRotationRef.current += omega * delta;

        if (distance < step) {
          // Reached target
          groupRef.current.position.copy(targetPos);
          updateShuttle(id, {
            position: shuttleState.target,
            target: null, // Clear target
            status: 'IDLE' // Mark as IDLE so store knows we arrived
          });

          // Trigger next step in path
          popPathStep(id);
        } else {
          // Move towards target
          const direction = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
          groupRef.current.position.add(direction.multiplyScalar(step));

          // Update store position periodically (optional, maybe too frequent)
          // updateShuttle({ position: groupRef.current.position.toArray() });
        }
      } else if (shuttleState.path.length > 0) {
        // No target but have path -> Start next step
        popPathStep(id);
      }
    }

    // 2. Mode Switching Animation (Aisle <-> Rail)
    // Target: 0 for AISLE, 1 for RAIL
    const targetMode = shuttleState.mode === 'RAIL' ? 1 : 0;
    const modeSpeed = 4.0;
    if (Math.abs(modeProgress - targetMode) > 0.001) {
      setModeProgress(THREE.MathUtils.lerp(modeProgress, targetMode, modeSpeed * delta));
    } else {
      setModeProgress(targetMode);
    }

    // 3. Pallet Lifting Animation
    // Target: 0.08m when lifted
    const targetLift = shuttleState.lifted ? 0.08 : 0;
    const liftSpeed = 3.0;
    if (Math.abs(liftHeight - targetLift) > 0.001) {
      setLiftHeight(THREE.MathUtils.lerp(liftHeight, targetLift, liftSpeed * delta));
    } else {
      setLiftHeight(targetLift);
    }
  });

  // Colors
  const colors = {
    bodyOrange: '#F97316',
    topBlue: '#06B6D4',
    silver: '#9CA3AF',
    wheelRim: '#FFFFFF', // White rims
    wheelTire: '#F97316', // Orange tires to match reference
    black: '#111827',
    ledGreen: '#10B981',
    ledRed: '#EF4444',
    ledYellow: '#FBBF24',
  };

  // Wheel Generation
  // Aisle Wheels (X-axis movement) - Fixed to chassis
  const aisleWheels = [];
  const aisleSpacing = length / 3;
  [-1, 1].forEach(side => {
    [-1, 1].forEach(pos => {
      aisleWheels.push([pos * aisleSpacing, wheelRadius, side * (width/2 - wheelWidth/2)]);
    });
  });

  // Rail Wheels (Z-axis movement) - Move vertically
  const railWheels = [];
  const railSpacing = width / 3;
  [-1, 1].forEach(side => {
    [-1, 1].forEach(pos => {
      railWheels.push([side * (length/2 - 0.3), wheelRadius, pos * railSpacing]);
    });
  });

  // Dynamic Height Calculation
  // When in RAIL mode (progress=1), chassis lifts up by 0.02m to clear Aisle wheels
  const chassisLift = modeProgress * 0.03;

  // Rail Wheel Offset relative to Chassis
  // AISLE (0): Retracted up (+0.05)
  // RAIL (1): Extended down (-0.03)
  const railWheelOffset = THREE.MathUtils.lerp(0.05, -0.03, modeProgress);

  // Don't render if shuttle is on a lift (will be rendered by Lift component)
  if (shuttleState.onLift && !isOnLift) {
    return null;
  }

  return (
    <group ref={groupRef} position={initialPosition}>
      {/* Main Body Group - Moves up/down based on mode */}
      <group position={[0, chassisLift, 0]}>

        {/* --- CHASSIS --- */}
        {/* Narrower width to expose wheels and avoid z-fighting */}
        <mesh position={[0, clearance + chassisHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[length, chassisHeight, width * 0.88]} />
          <meshStandardMaterial color={colors.bodyOrange} />
        </mesh>

        {/* Blue Side Panels (Fenders) - Requested by user */}
        {/* Full height to cover the side completely */}
        <mesh position={[0, clearance + chassisHeight / 2, width * 0.44 + 0.01]}>
          <boxGeometry args={[length, chassisHeight - 0.01, 0.02]} />
          <meshStandardMaterial color={colors.topBlue} />
        </mesh>
        <mesh position={[0, clearance + chassisHeight / 2, -width * 0.44 - 0.01]}>
          <boxGeometry args={[length, chassisHeight - 0.01, 0.02]} />
          <meshStandardMaterial color={colors.topBlue} />
        </mesh>

        {/* --- LIFTING DECK (Blue Top + Details) --- */}
        {/* This entire group lifts up to pick up the pallet */}
        <group position={[0, liftHeight, 0]}>

          {/* Render Pallet if shuttle has carriedPallet (show during lift animation) */}
          {shuttleState.carriedPallet && (
            <group position={[0, clearance + chassisHeight + 0.02, 0]}>
              <Pallet position={[0, 0, 0]} />
            </group>
          )}

          {/* Blue Top Surface - Main Flat Part */}
          <mesh position={[0, clearance + chassisHeight + 0.005, 0]}>
            <boxGeometry args={[length * 0.8, 0.01, width * 0.92]} />
            <meshStandardMaterial color={colors.topBlue} />
          </mesh>

          {/* Front Slope (Wedge) */}
          <group position={[-length * 0.4 - 0.05, clearance + chassisHeight - 0.02, 0]}>
             <mesh rotation={[0, 0, -Math.PI / 8]}>
               <boxGeometry args={[0.15, 0.01, width * 0.92]} />
               <meshStandardMaterial color={colors.topBlue} />
             </mesh>
          </group>

          {/* Back Slope (Wedge) */}
          <group position={[length * 0.4 + 0.05, clearance + chassisHeight - 0.02, 0]}>
             <mesh rotation={[0, 0, Math.PI / 8]}>
               <boxGeometry args={[0.15, 0.01, width * 0.92]} />
               <meshStandardMaterial color={colors.topBlue} />
             </mesh>
          </group>

          {/* --- DIAMOND PLATES (Shoulders) --- */}
          {/* Left Strip */}
          <mesh position={[0, clearance + chassisHeight + 0.011, -width * 0.35]}>
            <boxGeometry args={[length * 0.8, 0.005, width * 0.2]} />
            <meshStandardMaterial color={colors.silver} roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Right Strip */}
          <mesh position={[0, clearance + chassisHeight + 0.011, width * 0.35]}>
            <boxGeometry args={[length * 0.8, 0.005, width * 0.2]} />
            <meshStandardMaterial color={colors.silver} roughness={0.3} metalness={0.8} />
          </mesh>

          {/* --- CENTRAL BATTERY/ACCESS PANEL --- */}
          <group position={[0, clearance + chassisHeight + 0.011, 0]}>
            {/* Main Panel Frame (Darker Grey) */}
            <mesh>
              <boxGeometry args={[length * 0.25, 0.005, width * 0.4]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
            {/* Recessed Inner Panel (Black) */}
            <mesh position={[0, 0.001, 0]}>
              <boxGeometry args={[length * 0.2, 0.005, width * 0.3]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
            {/* Handles (Silver) */}
            <mesh position={[-0.08, 0.004, 0]}>
              <boxGeometry args={[0.02, 0.005, 0.1]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.8} />
            </mesh>
            <mesh position={[0.08, 0.004, 0]}>
              <boxGeometry args={[0.02, 0.005, 0.1]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.8} />
            </mesh>
          </group>
        </group>

        {/* --- AISLE WHEELS (X-Axis) --- */}
        {/* Attached to chassis. Lift with chassis. */}
        {aisleWheels.map((pos, i) => (
          <group key={`aisle-${i}`} position={[pos[0], wheelRadius, pos[2]]}>
            {/* Rotate around Z axis for rolling motion */}
            <group rotation={[0, 0, wheelRotationRef.current]}>
              {/* Tire (Orange) */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 32]} />
                <meshStandardMaterial color={colors.wheelTire} />
              </mesh>
              {/* Rim (White Inner Circle) */}
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
                <cylinderGeometry args={[wheelRadius * 0.7, wheelRadius * 0.7, wheelWidth + 0.002, 32]} />
                <meshStandardMaterial color={colors.wheelRim} />
              </mesh>
              {/* Axle/Hub (Grey Center) */}
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.002]}>
                <cylinderGeometry args={[wheelRadius * 0.2, wheelRadius * 0.2, wheelWidth + 0.004, 16]} />
                <meshStandardMaterial color="#9CA3AF" />
              </mesh>
            </group>
          </group>
        ))}

        {/* --- RAIL WHEELS (Z-Axis) --- */}
        {/* Move vertically relative to chassis to extend/retract */}
        <group position={[0, railWheelOffset, 0]}>
          {railWheels.map((pos, i) => (
            <group key={`rail-${i}`} position={[pos[0], wheelRadius, pos[2]]}>
              {/* Rotate around X axis for rolling motion */}
              <group rotation={[wheelRotationRef.current, 0, 0]}>
                {/* Tire (Orange) */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 32]} />
                  <meshStandardMaterial color={colors.wheelTire} />
                </mesh>
                {/* Rim (White Inner Circle) */}
                <mesh rotation={[0, 0, Math.PI / 2]} position={[0.001, 0, 0]}>
                  <cylinderGeometry args={[wheelRadius * 0.7, wheelRadius * 0.7, wheelWidth + 0.002, 32]} />
                  <meshStandardMaterial color={colors.wheelRim} />
                </mesh>
                {/* Axle/Hub (Grey Center) */}
                <mesh rotation={[0, 0, Math.PI / 2]} position={[0.002, 0, 0]}>
                  <cylinderGeometry args={[wheelRadius * 0.2, wheelRadius * 0.2, wheelWidth + 0.004, 16]} />
                  <meshStandardMaterial color="#9CA3AF" />
                </mesh>
              </group>
            </group>
          ))}
        </group>

        {/* --- FRONT FACE DETAILS (Lights, E-Stop) --- */}
        <group position={[-length / 2 - 0.005, clearance + chassisHeight / 2, 0]}>

          {/* Right Side: Company Logo with White Background */}
          <group position={[0, 0.02, width * 0.25]}>
            {/* White Sticker Background */}
            <mesh rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.35, 0.1]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            {/* Logo Texture */}
            <mesh position={[-0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.32, 0.08]} />
              <meshStandardMaterial map={logoTexture} transparent />
            </mesh>
          </group>

          {/* Left Side: Control Panel (Lights & E-Stop) */}
          <group position={[0, 0.02, -width * 0.25]}>
             {/* Black Panel Background */}
             <mesh rotation={[0, -Math.PI/2, 0]}>
               <planeGeometry args={[0.4, 0.12]} />
               <meshStandardMaterial color={colors.black} />
             </mesh>
             {/* Status Lights */}
             <mesh position={[-0.01, 0.02, -0.1]}>
               <sphereGeometry args={[0.015]} />
               <meshStandardMaterial color={colors.ledGreen} emissive={colors.ledGreen} emissiveIntensity={2} />
             </mesh>
             <mesh position={[-0.01, 0.02, 0]}>
               <sphereGeometry args={[0.015]} />
               <meshStandardMaterial color={colors.ledYellow} emissive={colors.ledYellow} emissiveIntensity={2} />
             </mesh>
             <mesh position={[-0.01, 0.02, 0.1]}>
               <sphereGeometry args={[0.015]} />
               <meshStandardMaterial color={colors.ledRed} emissive={colors.ledRed} emissiveIntensity={2} />
             </mesh>
             {/* E-Stop Button */}
             <group position={[-0.02, -0.02, 0.12]}>
               <mesh rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.02, 0.02, 0.02]} />
                 <meshStandardMaterial color="#991B1B" />
               </mesh>
               <mesh position={[-0.015, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.025, 0.025, 0.01]} />
                 <meshStandardMaterial color="#EF4444" />
               </mesh>
             </group>
          </group>

          {/* Bottom Bumpers (Black) */}
          <group position={[0, -0.08, 0]}>
            {/* Left Bumper */}
            <mesh position={[0, 0, -width * 0.25]}>
              <boxGeometry args={[0.02, 0.05, 0.3]} />
              <meshStandardMaterial color={colors.black} />
            </mesh>
            {/* Right Bumper */}
            <mesh position={[0, 0, width * 0.25]}>
              <boxGeometry args={[0.02, 0.05, 0.3]} />
              <meshStandardMaterial color={colors.black} />
            </mesh>
          </group>
        </group>

      </group>
    </group>
  );
}
