import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useWarehouseStore } from '@/store/warehouseStore';
import CameraManager from './CameraManager';
import PathVisualizer from './PathVisualizer';

/**
 * Main 3D Scene Component
 * Contains canvas, lighting, and camera setup
 */
export default function Scene({ children }) {
  const showGrid = useWarehouseStore((state) => state.showGrid);
  const cameraMode = useWarehouseStore((state) => state.cameraMode);

  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{
          position: [0, 40, 20], // High up, looking down (CCTV style)
          fov: 50,
        }}
        shadows
        gl={{ antialias: true, toneMapping: 0 }}
      >
        <CameraManager />
        <OrbitControls makeDefault enabled={cameraMode === 'FREE'} />

        {/* Visualization Tools */}
        <PathVisualizer />

        {/* Lighting - BRIGHT Industrial warehouse style (fixed!) */}
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[0, 20, 0]} intensity={0.6} color="#FCD34D" />

        {/* Ground grid */}
        {showGrid && (
          <Grid
            args={[30, 30]}
            cellSize={1}
            cellColor="#D1D5DB"
            sectionColor="#9CA3AF"
            fadeDistance={50}
            fadeStrength={1}
            position={[0, -0.01, 0]}
          />
        )}

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#E5E7EB" />
        </mesh>

        {/* Camera controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Child components will render here */}
        {children}
      </Canvas>
    </div>
  );
}
