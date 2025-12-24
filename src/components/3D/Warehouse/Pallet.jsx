import React, { useMemo } from 'react';

/**
 * Pallet Component
 * Represents a standard wooden pallet with cardboard boxes (cartons)
 * Size: 1.2m (W) x 1.0m (D) standard industrial pallet
 */
export default function Pallet({ position }) {
  const width = 1.2;
  const depth = 1.0;
  const height = 0.144; // Standard Euro pallet height

  // Cardboard box settings
  const boxColor = '#dcb386'; // Cardboard brown
  const tapeColor = '#e8dcc5'; // Lighter tape color

  // Layout: 3 boxes wide (X), 2 boxes deep (Z), 3 layers high (Y)
  const cols = 3;
  const rows = 2;
  const layers = 3;

  const boxWidth = (width / cols) - 0.02; // Gap of 2cm
  const boxDepth = (depth / rows) - 0.02;
  const boxHeight = 0.3; // 30cm height per box

  // Generate box positions
  const boxes = useMemo(() => {
    const items = [];
    for (let y = 0; y < layers; y++) {
      for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
          items.push({
            position: [
              (x - (cols - 1) / 2) * (width / cols),
              height + boxHeight / 2 + y * boxHeight,
              (z - (rows - 1) / 2) * (depth / rows)
            ]
          });
        }
      }
    }
    return items;
  }, [width, depth, height, boxWidth, boxDepth, boxHeight]);

  return (
    <group position={position}>
      {/* --- WOODEN PALLET BASE --- */}
      {/* Top Deck */}
      <mesh position={[0, height - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial color="#e0cda8" roughness={0.8} />
      </mesh>

      {/* 3 Runners (Bottom Skids) */}
      {[-width/2 + 0.07, 0, width/2 - 0.07].map((x, i) => (
        <group key={i} position={[x, height/2 - 0.02, 0]}>
           {/* Blocks */}
           <mesh position={[0, 0, -depth/2 + 0.07]}>
             <boxGeometry args={[0.14, 0.1, 0.14]} />
             <meshStandardMaterial color="#cfb997" />
           </mesh>
           <mesh position={[0, 0, 0]}>
             <boxGeometry args={[0.14, 0.1, 0.14]} />
             <meshStandardMaterial color="#cfb997" />
           </mesh>
           <mesh position={[0, 0, depth/2 - 0.07]}>
             <boxGeometry args={[0.14, 0.1, 0.14]} />
             <meshStandardMaterial color="#cfb997" />
           </mesh>
           {/* Bottom Board */}
           <mesh position={[0, -0.05 + 0.01, 0]}>
             <boxGeometry args={[0.14, 0.02, depth]} />
             <meshStandardMaterial color="#e0cda8" />
           </mesh>
        </group>
      ))}

      {/* --- CARDBOARD BOXES --- */}
      {boxes.map((box, idx) => (
        <group key={idx} position={box.position}>
          {/* Main Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
            <meshStandardMaterial color={boxColor} roughness={0.9} />
          </mesh>

          {/* Tape Strip (Top Center) */}
          <mesh position={[0, boxHeight/2 + 0.001, 0]} rotation={[0, Math.PI/2, 0]}>
            <planeGeometry args={[boxDepth, 0.05]} />
            <meshBasicMaterial color={tapeColor} />
          </mesh>

          {/* Label (Front Face) - Randomize slightly */}
          <mesh position={[0, 0, boxDepth/2 + 0.001]}>
            <planeGeometry args={[0.1, 0.06]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
