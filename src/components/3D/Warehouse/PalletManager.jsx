import React, { useEffect } from 'react';
import { useWarehouseStore } from '@/store/warehouseStore';
import Pallet from './Pallet';
import { gridToWorld } from '@/utils/gridHelpers';

/**
 * PalletManager Component
 * Manages the rendering of all pallets in the warehouse based on the store inventory.
 */
export default function PalletManager() {
  const inventory = useWarehouseStore((state) => state.inventory);
  const initInventory = useWarehouseStore((state) => state.initInventory);

  // Initialize inventory on mount (if empty)
  useEffect(() => {
    if (Object.keys(inventory).length === 0) {
      initInventory();
    }
  }, [initInventory, inventory]);

  return (
    <group>
      {Object.entries(inventory).map(([key, data]) => {
        const [gx, gy, level] = key.split(',').map(Number);
        const position = gridToWorld(gx, gy, level);

        // gridToWorld adds 0.2 for shuttle height.
        // Pallet sits ON the rails, so maybe slightly higher?
        // Pallet height is 0.15. Origin is center.
        // If rail is at 0.2, pallet bottom is at 0.2.
        // Pallet center Y = 0.2 + 0.15/2 = 0.275.
        // gridToWorld returns y = (level-1)*H + 0.2.
        // So we might need to adjust slightly if the origin of Pallet is not bottom.
        // In Pallet.jsx: Base mesh position is [0, height/2, 0].
        // So Pallet origin is at the bottom center.
        // So passing gridToWorld position (y=0.2) puts the pallet bottom at 0.2.
        // This seems correct if rails are at 0.2.

        return (
          <Pallet
            key={key}
            position={position}
            // Colors are now handled internally by Pallet component for realism
          />
        );
      })}
    </group>
  );
}
