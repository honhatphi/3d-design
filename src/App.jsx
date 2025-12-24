/**
 * @fileoverview Main App Component
 * 3D Warehouse Simulator - Checkpoint 4: Complete Rack Block
 */

import { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import Scene from './components/3D/Scene';
import WarehouseGrid from './components/3D/Warehouse/WarehouseGrid';
import TrackGrid from './components/3D/Warehouse/TrackGrid';
import PalletManager from './components/3D/Warehouse/PalletManager';
import Shuttle from './components/3D/Warehouse/Shuttle';
import Lift from './components/3D/Warehouse/Lift';
import Conveyor from './components/3D/Warehouse/Conveyor';
import ConveyorPallet from './components/3D/Warehouse/ConveyorPallet';
import ShuttleControls from './components/UI/ShuttleControls';
import ActivityLogPanel from './components/UI/ActivityLogPanel';
import { gridToWorld } from './utils/gridHelpers';
import { DIMENSIONS } from './utils/constants';
import { useWarehouseStore } from './store/warehouseStore';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const conveyorPallets = useWarehouseStore((state) => state.conveyorPallets);

  // Calculate positions based on layout (LIFT_LOWER at 2,5 and LIFT_UPPER at 2,19)
  // Note: gridToWorld returns [x, y, z]. We need to adjust for Lift/Conveyor props.
  const liftLowerPos = gridToWorld(2, 5, 1);
  const liftUpperPos = gridToWorld(2, 19, 1);

  // Conveyors feeding into the lifts (approximate positions based on image)
  // Lower Conveyor: Feeds into (2,5) from the left
  const convLowerPos = gridToWorld(0, 6, 1); // Corrected to Rail 6
  // Upper Conveyor: Feeds into (2,19) from the left
  const convUpperPos = gridToWorld(0, 18, 1); // Corrected to Rail 18 (Symmetric)

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      systemStatus={{ health: 'healthy', throughput: 0, alarms: 0 }}
    >
      {/* 3D Scene */}
      <Scene>
        {/* CHECKPOINT 4: Full Warehouse Grid (Parsed from JSON) */}
        <WarehouseGrid />

        {/* Shuttle Tracks (Highways) */}
        <TrackGrid />

        {/* Pallet Inventory */}
        <PalletManager />

        {/* CHECKPOINT 5: Animated Shuttles */}
        <Shuttle id="SHUTTLE_1" />
        <Shuttle id="SHUTTLE_2" />

        {/* CHECKPOINT 8: Vertical Lifts (Corrected Placement) */}
        {/* Lower Lift (Block C/D) - Height matches 4 levels */}
        <Lift id="LIFT_LOWER" position={[liftLowerPos[0], 0, liftLowerPos[2]]} height={DIMENSIONS.cellHeight * 4} />
        {/* Upper Lift (Block A/B) - Height matches 4 levels */}
        <Lift id="LIFT_UPPER" position={[liftUpperPos[0], 0, liftUpperPos[2]]} height={DIMENSIONS.cellHeight * 4} />

        {/* CHECKPOINT 9: Conveyor Systems (Corrected Placement) */}
        {/* Lower Conveyors (Row 6 - Feeding into Lift at Row 5) - INBOUND */}
        <Conveyor position={gridToWorld(0, 6, 1)} length={DIMENSIONS.cellWidth} width={1.2} direction="in" />
        <Conveyor position={gridToWorld(1, 6, 1)} length={DIMENSIONS.cellWidth} width={1.2} direction="in" />
        {/* Last segment rotates to feed Lift at (2,5) */}
        <Conveyor position={gridToWorld(2, 6, 1)} length={DIMENSIONS.cellWidth} width={1.2} direction="in" rotation={[0, 0, 0]} />

        {/* Upper Conveyors (Row 18 - Feeding into Lift at Row 19) - OUTBOUND */}
        <Conveyor position={gridToWorld(0, 18, 1)} length={DIMENSIONS.cellWidth} width={1.2} direction="out" />
        <Conveyor position={gridToWorld(1, 18, 1)} length={DIMENSIONS.cellWidth} width={1.2} direction="out" />
        {/* Last segment rotates to receive from Lift at (2,19) */}
        <Conveyor position={gridToWorld(2, 18, 1)} length={DIMENSIONS.cellWidth} width={1.2} direction="out" rotation={[0, 0, 0]} />

        {/* Render Moving Pallets on Conveyors */}
        {Object.keys(conveyorPallets).map((palletId) => (
          <ConveyorPallet key={palletId} id={palletId} />
        ))}
      </Scene>

      {/* Shuttle Controls UI */}
      <ShuttleControls />

      {/* Activity Log Panel */}
      <ActivityLogPanel />

      {/* Info overlay */}
      <div className="absolute top-20 left-4 bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
          🛑 CHECKPOINT 13: Lift Animation
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>🏗️ Lift Logic Implemented</li>
          <li>⬆️ Use controls to move Lift</li>
          <li>🔄 Smooth interpolation</li>
        </ul>
      </div>
    </MainLayout>
  );
}

export default App;
