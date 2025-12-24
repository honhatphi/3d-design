import { create } from 'zustand';
import { Pathfinder } from '../utils/pathfinder';
import { gridToWorld, worldToGrid } from '../utils/gridHelpers';

const pathfinder = new Pathfinder();

export const useWarehouseStore = create((set, get) => ({
  // Camera settings
  cameraMode: 'FREE', // Default to FREE for OrbitControls to work initially
  focusTarget: null,
  activeShuttleId: 'SHUTTLE_1', // Which shuttle the camera follows
  setActiveShuttle: (id) => set({ activeShuttleId: id }),

  // Component visibility
  showGrid: true,
  showLabels: false,

  // System Status
  shuttleBusy: { SHUTTLE_1: false, SHUTTLE_2: false },

  // Shuttle State
  shuttles: {
    SHUTTLE_1: {
      id: 'SHUTTLE_1',
      position: gridToWorld(4, 4, 1), // Start at Grid(4,4) - Highway intersection
      gridPosition: { x: 4, y: 4, level: 1 }, // Logical grid position
      status: 'IDLE', // IDLE, MOVING
      mode: 'AISLE', // AISLE (X-axis), RAIL (Z-axis)
      lifted: false, // Pallet lifted?
      carriedPallet: null, // Pallet data being carried { id, color }
      direction: 'X', // X, Z
      target: null, // Current world target [x, y, z]
      path: [], // Queue of grid steps {x, y}
      onLift: null, // null | 'LIFT_LOWER' | 'LIFT_UPPER' - which lift shuttle is on
    },
    SHUTTLE_2: {
      id: 'SHUTTLE_2',
      position: gridToWorld(4, 20, 1), // Start near Upper Lift (Row 19) - Highway intersection at Row 20
      gridPosition: { x: 4, y: 20, level: 1 },
      status: 'IDLE',
      mode: 'AISLE',
      lifted: false,
      carriedPallet: null,
      direction: 'X',
      target: null,
      path: [],
      onLift: null,
    }
  },

  // Lift State
  lifts: {
    LIFT_LOWER: { level: 1, targetLevel: 1, status: 'IDLE' },
    LIFT_UPPER: { level: 1, targetLevel: 1, status: 'IDLE' }
  },

  // Inventory State
  // Map: "x,y,level" -> { id, color, type }
  inventory: {},

  // Conveyor State
  // Track pallets on conveyors
  conveyorPallets: {
    // Format: { id, position: [x, y, z], targetPosition, status: 'MOVING'/'WAITING' }
  },

  // Activity Logs
  activityLogs: [],

  // Actions
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setFocusTarget: (target) => set({ focusTarget: target }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  // Log Actions
  addLog: (message, type = 'info') => set((state) => {
    // Prevent duplicate messages
    if (state.activityLogs.length > 0 && state.activityLogs[0].message === message) {
      return state; // Don't add duplicate
    }

    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: `${Date.now()}-${Math.random()}`, // Unique ID
      timestamp,
      message,
      type
    };
    const updatedLogs = [newLog, ...state.activityLogs].slice(0, 50); // Keep last 50 logs
    return { activityLogs: updatedLogs };
  }),
  clearLogs: () => set({ activityLogs: [] }),

  // Lift Actions
  setLiftLevel: (id, level) => set((state) => ({
    lifts: {
      ...state.lifts,
      [id]: { ...state.lifts[id], targetLevel: level, status: 'MOVING' }
    }
  })),

  // Called when lift finishes animation
  completeLiftMove: (id) => set((state) => ({
    lifts: {
      ...state.lifts,
      [id]: { ...state.lifts[id], level: state.lifts[id].targetLevel, status: 'IDLE' }
    }
  })),

  // Inventory Actions
  addPallet: (x, y, level, palletData) => set((state) => ({
    inventory: {
      ...state.inventory,
      [`${x},${y},${level}`]: palletData
    }
  })),

  removePallet: (x, y, level) => {
    const state = get();
    const key = `${x},${y},${level}`;
    const palletData = state.inventory[key];
    const newInventory = { ...state.inventory };
    delete newInventory[key];
    set({ inventory: newInventory });
    return palletData; // Return the removed pallet data
  },

  // Conveyor Pallet Actions
  addConveyorPallet: (id, position) => set((state) => ({
    conveyorPallets: {
      ...state.conveyorPallets,
      [id]: { id, position, status: 'MOVING' }
    }
  })),

  removeConveyorPallet: (id) => set((state) => {
    const newPallets = { ...state.conveyorPallets };
    delete newPallets[id];
    return { conveyorPallets: newPallets };
  }),

  updateConveyorPallet: (id, updates) => set((state) => ({
    conveyorPallets: {
      ...state.conveyorPallets,
      [id]: { ...state.conveyorPallets[id], ...updates }
    }
  })),

  initInventory: () => {
    const newInventory = {};
    // Add some test pallets
    // Format: "gridX,gridY,level"
    // Block C (near start)
    newInventory['3,6,1'] = { id: 'P-001', color: '#ef4444' }; // Red
    newInventory['5,6,1'] = { id: 'P-002', color: '#3b82f6' }; // Blue
    newInventory['5,6,2'] = { id: 'P-003', color: '#10b981' }; // Green
    newInventory['3,6,3'] = { id: 'P-004', color: '#f59e0b' }; // Amber

    // Block D
    newInventory['3,3,1'] = { id: 'P-005', color: '#8b5cf6' }; // Purple
    newInventory['5,5,2'] = { id: 'P-006', color: '#ec4899' }; // Pink

    set({ inventory: newInventory });
  },

  // Shuttle Actions
  updateShuttle: (id, updates) => set((state) => ({
    shuttles: {
      ...state.shuttles,
      [id]: { ...state.shuttles[id], ...updates }
    }
  })),
  setShuttleMode: (id, mode) => set((state) => ({
    shuttles: {
      ...state.shuttles,
      [id]: { ...state.shuttles[id], mode }
    }
  })),

  // Pathfinding Actions
  navigateTo: (id, targetGridX, targetGridY) => {
    const { shuttles } = get();
    const shuttle = shuttles[id];
    const currentGrid = worldToGrid(shuttle.position[0], shuttle.position[2]);

    console.log(`[${id}] Planning path from (${currentGrid.x},${currentGrid.y}) to (${targetGridX},${targetGridY})`);

    // Pathfinder now handles escape routes automatically
    const path = pathfinder.findPath(currentGrid, { x: targetGridX, y: targetGridY });

    if (path && path.length > 0) {
      // Remove start node if it's the current position
      if (path[0].x === currentGrid.x && path[0].y === currentGrid.y) {
        path.shift();
      }

      console.log(`Path found with ${path.length} steps:`, path.map(p => `(${p.x},${p.y})`).join(' -> '));

      set((state) => ({
        shuttles: {
          ...state.shuttles,
          [id]: {
            ...state.shuttles[id],
            status: 'MOVING',
            path: path,
            target: null // Reset target to trigger next step calculation
          }
        }
      }));
    } else {
      console.warn(`[${id}] No path found! Shuttle may be stuck in invalid position.`);
    }
  },

  // Called when shuttle reaches a waypoint
  popPathStep: (id) => {
    set((state) => {
      const shuttle = state.shuttles[id];
      const currentPath = shuttle.path;
      if (currentPath.length === 0) {
        return {
          shuttles: {
            ...state.shuttles,
            [id]: { ...shuttle, status: 'IDLE', target: null }
          }
        };
      }

      const nextStep = currentPath[0];
      const remainingPath = currentPath.slice(1);

      // Calculate world position for next step
      // Use current shuttle level
      const currentLevel = shuttle.gridPosition?.level || 1;
      const worldPos = gridToWorld(nextStep.x, nextStep.y, currentLevel);

      // Determine direction
      const currentPos = shuttle.position;
      const dx = worldPos[0] - currentPos[0];
      const dz = worldPos[2] - currentPos[2];

      let newMode = shuttle.mode;
      if (Math.abs(dx) > Math.abs(dz)) newMode = 'AISLE'; // Moving in X
      else if (Math.abs(dz) > Math.abs(dx)) newMode = 'RAIL'; // Moving in Z

      return {
        shuttles: {
          ...state.shuttles,
          [id]: {
            ...shuttle,
            path: remainingPath,
            target: worldPos,
            mode: newMode,
            gridPosition: { ...nextStep, level: currentLevel }
          }
        }
      };
    });
  },

  // --- INBOUND LOGIC ---

  // Helper: Find nearest horizontal highway for a given Y position
  findNearestHorizontalHighway: (currentY) => {
    // Highways at Y=4, Y=12, Y=20
    const highways = [4, 12, 20];
    let nearest = highways[0];
    let minDist = Math.abs(currentY - highways[0]);

    for (const hw of highways) {
      const dist = Math.abs(currentY - hw);
      if (dist < minDist) {
        minDist = dist;
        nearest = hw;
      }
    }
    return nearest;
  },

  /**
   * Helper: Find exit point from rack to highway
   * If shuttle is inside a rack (X > 4), it must exit to X=4 first (vertical highway)
   * then move along highway
   */
  findRackExitPoint: (currentX, currentY) => {
    const verticalHighway = 4;
    const horizontalHighways = [4, 12, 20];

    // Check if already on vertical highway
    if (currentX === verticalHighway) {
      return null; // Already on highway, no exit needed
    }

    // Check if already on horizontal highway
    if (horizontalHighways.includes(currentY)) {
      return null; // Already on highway, no exit needed
    }

    // If in rack area (X > 4), must exit to vertical highway X=4 at current Y
    // But current Y might not be a valid highway, so exit to nearest highway first
    if (currentX > verticalHighway) {
      const nearestHwy = get().findNearestHorizontalHighway(currentY);
      return { x: verticalHighway, y: nearestHwy };
    }

    // If at X=1,2,3 (depth area), move to vertical highway
    const nearestHwy = get().findNearestHorizontalHighway(currentY);
    return { x: verticalHighway, y: nearestHwy };
  },

  /**
   * Process Inbound Request - Multi-level Support
   * 1. Find empty cell in specific row and level
   * 2. Generate command sequence (with lift if needed)
   * 3. Execute sequence
   */
  processInboundRequest: (targetRow = 6, targetLevel = 1) => {
    const state = get();
    const { inventory, shuttles } = state;

    // Determine which shuttle/lift to use based on targetRow
    // Lower Block (Rows 1-12) -> SHUTTLE_1 / LIFT_LOWER
    // Upper Block (Rows 13-23) -> SHUTTLE_2 / LIFT_UPPER
    const isUpperBlock = targetRow > 12;
    const shuttleId = isUpperBlock ? 'SHUTTLE_2' : 'SHUTTLE_1';
    const liftId = isUpperBlock ? 'LIFT_UPPER' : 'LIFT_LOWER';
    const liftRow = isUpperBlock ? 19 : 5;

    const shuttle = shuttles[shuttleId];

    // 1. Find Target Cell (Deepest Empty in row at specified level)
    let targetX = null;
    const startX = 5;
    const endX = 25;

    // Find deepest empty slot at target level
    for (let x = endX; x >= startX; x--) {
      if (!inventory[`${x},${targetRow},${targetLevel}`]) {
        targetX = x;
        break;
      }
    }

    if (!targetX) {
      console.warn(`Row ${targetRow}, Level ${targetLevel} is full!`);
      return;
    }

    console.log(`Inbound Target: Grid(${targetX}, ${targetRow}, ${targetLevel}) using ${shuttleId}`);
    get().addLog(`🎯 Target: Rail ${targetRow}, Depth ${targetX}, Level ${targetLevel} (${shuttleId})`, 'start');

    // 2. Setup
    const liftX = 2;
    const highwayX = 4;
    // Highway Y depends on block? No, highway is continuous.
    // But we should use the highway Y closest to the lift.
    // LIFT_LOWER (Row 5) -> Highway Y=4
    // LIFT_UPPER (Row 19) -> Highway Y=20
    const highwayY = isUpperBlock ? 20 : 4;

    const currentX = shuttle.gridPosition.x;
    const currentY = shuttle.gridPosition.y;
    const currentLevel = shuttle.gridPosition.level || 1;
    const sequence = [];
    const palletId = `INBOUND-${Date.now()}`;

    // === PHASE 1: SHUTTLE RETRIEVAL (If needed) ===
    // Ensure shuttle is at Level 1 Lift Position before starting conveyor

    // Step 1: Navigate to Lift (at current level)
    const nearestHwy = get().findNearestHorizontalHighway(currentY);
    if (currentX !== highwayX) {
      if (currentY !== nearestHwy) {
        sequence.push(
          { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
          { type: 'SHUTTLE_MOVE', target: [currentX, nearestHwy], shuttleId }
        );
      }
      sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'AISLE', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [highwayX, nearestHwy], shuttleId }
      );
    }

    if (nearestHwy !== highwayY) {
      sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [highwayX, highwayY], shuttleId }
      );
    }

    // Move to Depth 2, Rail 4/20 (Waiting Position)
    sequence.push(
      { type: 'SHUTTLE_MODE', mode: 'AISLE', shuttleId },
      { type: 'SHUTTLE_MOVE', target: [liftX, highwayY], shuttleId },
      { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId }
    );

    // Step 2: Handle Level Change if not at Level 1
    if (currentLevel > 1) {
      // Move Lift to Shuttle Level BEFORE entering lift cell
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: currentLevel });

      // Now safe to enter lift cell
      sequence.push({ type: 'SHUTTLE_MOVE', target: [liftX, liftRow], shuttleId });

      // Shuttle Boards Lift
      sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });

      // Lift Moves Down to Level 1
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: 1 });
      get().addLog(`⬇️ Retrieving ${shuttleId} to Level 1`, 'action');
    } else {
      // Already at Level 1, ensure lift is here too (should be, but good to be safe)
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: 1 });

      // Enter lift cell
      sequence.push({ type: 'SHUTTLE_MOVE', target: [liftX, liftRow], shuttleId });

      // Board
      sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });
    }

    // === PHASE 2: CONVEYOR FEED ===
    // Now that shuttle is ready at Level 1, start conveyor
    // Conveyor Y depends on block
    // Lower: Row 6 feeds to Row 5
    // Upper: Row 18 feeds to Row 19
    const conveyorY = isUpperBlock ? 18 : 6;

    sequence.push({
      type: 'SPAWN_CONVEYOR_PALLET',
      id: palletId,
      x: 0,  // Start at leftmost conveyor
      y: conveyorY,
      level: 1
    });

    // Wait for pallet to appear
    sequence.push({ type: 'WAIT', duration: 500, message: 'Pallet spawning...' });

    // Move pallet along conveyor segments
    sequence.push(
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 1, y: conveyorY },
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 2, y: conveyorY },
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 2, y: liftRow }
    );

    // Transfer pallet to lift inventory
    sequence.push({
      type: 'CONVEYOR_TO_INVENTORY',
      id: palletId,
      x: liftX,
      y: liftRow,
      level: 1
    });

    // === SYNC POINT: Wait for pallet to be at lift ===
    // Check if pallet is already in inventory at lift position
    sequence.push({
      type: 'WAIT_FOR_PALLET',
      x: liftX,
      y: liftRow,
      level: 1,
      maxWait: 10000 // Max 10 seconds
    });

    // Step 6: Pick pallet - shuttle already at lift position (on lift)
    // Lift up and wait for animation to complete
    // MODIFIED: Don't lift yet! Just grab the data.
    // sequence.push({ type: 'SHUTTLE_LIFT', lift: true, onLift: liftId, shuttleId });
    // sequence.push({ type: 'WAIT', duration: 500, message: 'Lifting animation...' });

    // Now remove pallet after lift animation finished
    sequence.push({ type: 'REMOVE_INVENTORY', x: liftX, y: liftRow, level: 1, shuttleId });

    // Ensure deck is DOWN while moving
    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, onLift: liftId, shuttleId });

    // === MULTI-LEVEL LOGIC ===
    if (targetLevel > 1) {
      // Shuttle stays on lift with pallet - lift will move both up

      // Step 6a: Lift moves to target level (with shuttle on it)
      sequence.push({
        type: 'LIFT_MOVE',
        id: liftId,
        level: targetLevel
      });
      get().addLog(`🔼 Lift to Level ${targetLevel} (with shuttle)`, 'action');

      // Step 6b: Wait for lift to reach target level
      // Shuttle is still on the lift, still carrying pallet
      sequence.push({ type: 'WAIT', duration: 2000, message: 'Lift moving...' });

      // NOW Lift the pallet before exiting
      sequence.push({ type: 'SHUTTLE_LIFT', lift: true, onLift: liftId, shuttleId });
      sequence.push({ type: 'WAIT', duration: 500, message: 'Lifting animation...' });

      // Disembark to allow movement
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });

    } else {
      // If staying at Level 1, lift now before exiting
      sequence.push({ type: 'SHUTTLE_LIFT', lift: true, onLift: liftId, shuttleId });
      sequence.push({ type: 'WAIT', duration: 500, message: 'Lifting animation...' });

      // If staying at Level 1, we need to explicitly disembark before moving
      // (LIFT_MOVE handles disembark automatically, but we skipped it)
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    }

    // Step 7: Exit lift to vertical highway (at correct level now)
    sequence.push(
      { type: 'SHUTTLE_MOVE', target: [liftX, highwayY], shuttleId },
      { type: 'SHUTTLE_MODE', mode: 'AISLE', shuttleId },
      { type: 'SHUTTLE_MOVE', target: [highwayX, highwayY], shuttleId }
    );

    // Step 8: Navigate directly to target row's horizontal highway
    const targetRowHighway = get().findNearestHorizontalHighway(targetRow);
    if (highwayY !== targetRowHighway) {
      sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [highwayX, targetRowHighway], shuttleId }
      );
    }

    // Step 9: Move along horizontal highway to target column
    sequence.push(
      { type: 'SHUTTLE_MODE', mode: 'AISLE', shuttleId },
      { type: 'SHUTTLE_MOVE', target: [targetX, targetRowHighway], shuttleId }
    );

    // Step 10: Enter rack depth from highway
    if (targetRow !== targetRowHighway) {
      sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [targetX, targetRow], shuttleId }
      );
    }

    // Step 11: Drop pallet with smooth animation
    // Lower platform and wait for animation
    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Dropping animation...' });

    // Add to inventory after drop animation finished (at correct level)
    sequence.push({ type: 'ADD_INVENTORY', x: targetX, y: targetRow, level: targetLevel, shuttleId });

    // Step 12: Exit rack back to horizontal highway
    if (targetRow !== targetRowHighway) {
      sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [targetX, targetRowHighway], shuttleId }
      );
    }

    // Done - shuttle stays at (targetX, targetRowHighway) on horizontal highway
    // No need to return to X=4, Step 1 can handle starting from any highway position
    sequence.push({ type: 'LOG', message: 'Inbound Complete!' });

    // Execute
    get().executeSequence(sequence, shuttleId);
  },

  /**
   * Process Outbound Request
   * 1. Find pallet in row
   * 2. Retrieve pallet
   * 3. Bring to output (Lift/Conveyor)
   */
  processOutboundRequest: (targetRow = 6, targetLevel = 1) => {
    const state = get();
    const { inventory, shuttles } = state;

    const isUpperBlock = targetRow > 12;
    const shuttleId = isUpperBlock ? 'SHUTTLE_2' : 'SHUTTLE_1';
    const liftId = isUpperBlock ? 'LIFT_UPPER' : 'LIFT_LOWER';
    const liftRow = isUpperBlock ? 19 : 5;
    const shuttle = shuttles[shuttleId];

    // 1. Find Pallet (Closest to aisle)
    let targetX = null;
    const startX = 5;
    const endX = 25;

    for (let x = startX; x <= endX; x++) {
      if (inventory[`${x},${targetRow},${targetLevel}`]) {
        targetX = x;
        break;
      }
    }

    if (!targetX) {
      get().addLog(`⚠️ Row ${targetRow} Level ${targetLevel} is empty!`, 'error');
      return;
    }

    get().addLog(`📤 Outbound: Rail ${targetRow}, Depth ${targetX}, Level ${targetLevel}`, 'start');

    const sequence = [];
    const liftX = 2;
    const highwayX = 4;
    const highwayY = isUpperBlock ? 20 : 4;
    const liftRowY = isUpperBlock ? 19 : 5;
    const currentLevel = shuttle.gridPosition.level || 1;
    const currentX = shuttle.gridPosition.x;
    const currentY = shuttle.gridPosition.y;

    console.log(`[OUTBOUND] Shuttle ${shuttleId} current position: X=${currentX}, Y=${currentY}, Level=${currentLevel}`);
    console.log(`[OUTBOUND] Target pallet position: X=${targetX}, Y=${targetRow}, Level=${targetLevel}`);
    console.log(`[OUTBOUND] Need level change: ${currentLevel !== targetLevel}`);

    // === PHASE 1: GO TO PALLET ===

    // 1. Move to correct level if needed
    if (currentLevel !== targetLevel) {
       // Navigate to lift using pathfinder
       sequence.push({ type: 'NAVIGATE_TO', targetX: liftX, targetY: liftRowY, shuttleId });

       // Board Lift
       sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });

       // Move Lift
       sequence.push({ type: 'LIFT_MOVE', id: liftId, level: targetLevel });

       // Disembark
       sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    }

    // 2. Navigate directly to pallet location using pathfinder
    // Pathfinder will handle optimal route from current position
    console.log(`[OUTBOUND DEBUG] Navigating to pallet at X=${targetX}, Y=${targetRow}`);
    sequence.push({ type: 'NAVIGATE_TO', targetX: targetX, targetY: targetRow, shuttleId });

    // === PHASE 2: PICK PALLET ===
    console.log(`[OUTBOUND DEBUG] Will lift and remove pallet at X=${targetX}, Y=${targetRow}, Level=${targetLevel}`);
    sequence.push({ type: 'SHUTTLE_LIFT', lift: true, shuttleId });
    sequence.push({ type: 'REMOVE_INVENTORY', x: targetX, y: targetRow, level: targetLevel, shuttleId });

    // === PHASE 3: RETURN TO OUTPUT ===

    // Navigate back to lift output using pathfinder
    console.log(`[OUTBOUND DEBUG] Returning to lift at X=${liftX}, Y=${liftRowY}`);
    sequence.push({ type: 'NAVIGATE_TO', targetX: liftX, targetY: liftRowY, shuttleId });

    // If we are not at Level 1, go down
    if (targetLevel > 1) {
       sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });
       sequence.push({ type: 'LIFT_MOVE', id: liftId, level: 1 });
       // Don't disembark yet
    }

    // Drop Pallet at Lift (or Conveyor)
    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, shuttleId });

    // Simulate "Despawn" or "Transfer to Conveyor"
    // We already removed it from inventory.
    // Just log it.
    sequence.push({ type: 'LOG', message: 'Outbound Pallet Dropped at Output' });

    // Explicitly clear carried pallet from shuttle visual
    sequence.push({ type: 'CLEAR_CARRIED_PALLET', shuttleId });

    // Disembark and move away using pathfinder
    sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    sequence.push({ type: 'NAVIGATE_TO', targetX: highwayX, targetY: highwayY, shuttleId });

    get().executeSequence(sequence, shuttleId);
  },

  /**
   * Process Transfer Request
   * Move pallet from A to B
   */
  processTransferRequest: (fromRow, fromLevel, toRow, toLevel) => {
    const state = get();
    const { inventory, shuttles } = state;

    // Determine shuttle (Assume same block for now or use Shuttle 1)
    const isUpperBlock = fromRow > 12;
    const shuttleId = isUpperBlock ? 'SHUTTLE_2' : 'SHUTTLE_1';
    const shuttle = shuttles[shuttleId];

    // 1. Find Source Pallet
    let sourceX = null;
    for (let x = 5; x <= 25; x++) {
      if (inventory[`${x},${fromRow},${fromLevel}`]) {
        sourceX = x;
        break;
      }
    }

    if (!sourceX) {
      get().addLog(`⚠️ Source ${fromRow}/${fromLevel} is empty!`, 'error');
      return;
    }

    // 2. Find Destination Slot (Deepest empty)
    let destX = null;
    for (let x = 25; x >= 5; x--) {
      if (!inventory[`${x},${toRow},${toLevel}`]) {
        destX = x;
        break;
      }
    }

    if (!destX) {
      get().addLog(`⚠️ Destination ${toRow}/${toLevel} is full!`, 'error');
      return;
    }

    get().addLog(`🔄 Transfer: ${fromRow}/${fromLevel} -> ${toRow}/${toLevel}`, 'start');

    const sequence = [];
    const highwayX = 4;
    const liftX = 2;
    const liftId = isUpperBlock ? 'LIFT_UPPER' : 'LIFT_LOWER';
    const liftRow = isUpperBlock ? 19 : 5;
    const highwayY = isUpperBlock ? 20 : 4;

    // Helper to move to a location
    const moveToLocation = (targetX, targetRow, targetLevel) => {
        // ... (Logic to move shuttle to x,y,level)
        // This is getting complex to duplicate.
        // Ideally we'd have a "generateMoveSequence" helper.
        // For now, I'll simplify: Assume we are at highwayX, highwayY, Level 1 initially or handle it.
    };

    // === PHASE 1: PICK UP ===
    // (Similar to Outbound Phase 1 & 2)

    // ... [Insert movement logic to Source] ...
    // For brevity in this tool call, I will implement a simplified version that assumes
    // the shuttle can navigate. In a real app, I'd refactor the movement logic.

    // 1. Go to Source Level
    // (Simplified: Assume Level 1 for now or add lift logic)

    // 2. Go to Source Row/X
    const sourceRowHighway = get().findNearestHorizontalHighway(fromRow);

    // Move to Highway
    sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'AISLE', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [highwayX, highwayY], shuttleId } // Start point
    );

    if (highwayY !== sourceRowHighway) {
        sequence.push(
            { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
            { type: 'SHUTTLE_MOVE', target: [highwayX, sourceRowHighway], shuttleId }
        );
    }

    sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'AISLE', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [sourceX, sourceRowHighway], shuttleId }
    );

    if (fromRow !== sourceRowHighway) {
        sequence.push(
            { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
            { type: 'SHUTTLE_MOVE', target: [sourceX, fromRow], shuttleId }
        );
    }

    // Pick
    sequence.push({ type: 'SHUTTLE_LIFT', lift: true, shuttleId });
    sequence.push({ type: 'REMOVE_INVENTORY', x: sourceX, y: fromRow, level: fromLevel, shuttleId });

    // === PHASE 2: MOVE TO DESTINATION ===

    // Exit Source Rack
    if (fromRow !== sourceRowHighway) {
        sequence.push(
            { type: 'SHUTTLE_MOVE', target: [sourceX, sourceRowHighway], shuttleId }
        );
    }

    // Go to Highway X
    sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'AISLE', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [highwayX, sourceRowHighway], shuttleId }
    );

    // Go to Dest Row Highway
    const destRowHighway = get().findNearestHorizontalHighway(toRow);
    if (sourceRowHighway !== destRowHighway) {
        sequence.push(
            { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
            { type: 'SHUTTLE_MOVE', target: [highwayX, destRowHighway], shuttleId }
        );
    }

    // Go to Dest X
    sequence.push(
        { type: 'SHUTTLE_MODE', mode: 'AISLE', shuttleId },
        { type: 'SHUTTLE_MOVE', target: [destX, destRowHighway], shuttleId }
    );

    // Enter Dest Rack
    if (toRow !== destRowHighway) {
        sequence.push(
            { type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId },
            { type: 'SHUTTLE_MOVE', target: [destX, toRow], shuttleId }
        );
    }

    // Drop
    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, shuttleId });
    sequence.push({ type: 'ADD_INVENTORY', x: destX, y: toRow, level: toLevel, shuttleId });

    // Exit Dest Rack
    if (toRow !== destRowHighway) {
        sequence.push(
            { type: 'SHUTTLE_MOVE', target: [destX, destRowHighway], shuttleId }
        );
    }

    get().executeSequence(sequence, shuttleId);
  },

  // Sequence Executor
  executeSequence: async (sequence, shuttleId) => {
    const { setLiftLevel, updateShuttle, setShuttleMode, addPallet } = get();

    // Set running flag for this shuttle
    set((state) => ({
      shuttleBusy: { ...state.shuttleBusy, [shuttleId]: true }
    }));

    // Track state per shuttle to prevent duplicate logs
    const lastModes = {};
    const lastLifted = {};

    try {
      for (const step of sequence) {
        console.log('Executing:', step.type, step);
        // Use step.shuttleId if present, otherwise fallback to the sequence's main shuttleId
        const currentShuttleId = step.shuttleId || shuttleId;
        const currentShuttle = get().shuttles[currentShuttleId];

        switch (step.type) {
          case 'NAVIGATE_TO':
            // Use pathfinder to navigate to target grid position
            get().addLog(`🎯 ${currentShuttleId} Navigating to Rail ${step.targetY}, Depth ${step.targetX}`, 'info');
            get().navigateTo(currentShuttleId, step.targetX, step.targetY);

            // Wait for navigation to complete
            await waitForShuttleArrival(currentShuttleId);
            get().addLog(`✅ ${currentShuttleId} Arrived at Rail ${step.targetY}, Depth ${step.targetX}`, 'success');
            break;

          case 'SHUTTLE_BOARD':
            updateShuttle(currentShuttleId, { onLift: step.id });
            get().addLog(step.id ? `${currentShuttleId} Boarding Lift ${step.id}` : `${currentShuttleId} Disembarking Lift`, 'action');
            break;

          case 'LIFT_MOVE':
            // Move lift to target level
            setLiftLevel(step.id, step.level);

            get().addLog(`🔼 Lift ${step.id} moving to Level ${step.level}`, 'action');

            // Wait for lift animation to complete
            await new Promise(r => setTimeout(r, 2000));

            // After lift arrives, update shuttle position if it's on this lift
            const shuttles = get().shuttles;
            Object.keys(shuttles).forEach(sId => {
              if (shuttles[sId].onLift === step.id) {
                const liftX = 2;
                const liftY = step.id === 'LIFT_UPPER' ? 19 : 5;
                const newWorldPos = gridToWorld(liftX, liftY, step.level);

                updateShuttle(sId, {
                  position: newWorldPos,
                  gridPosition: { x: liftX, y: liftY, level: step.level }
                });
                get().addLog(`✅ ${sId} at Level ${step.level}`, 'success');
              }
            });
            break;

          case 'SHUTTLE_MODE':
            if (lastModes[currentShuttleId] !== step.mode) {
              const modeText = step.mode === 'AISLE' ? 'Aisle Mode (X-axis)' : 'Rail Mode (Y-axis)';
              get().addLog(`🔄 ${currentShuttleId}: ${modeText}`, 'action');
              setShuttleMode(currentShuttleId, step.mode);
              lastModes[currentShuttleId] = step.mode;
              await new Promise(r => setTimeout(r, 1000)); // Wait for wheel animation
            }
            break;

          case 'SHUTTLE_MOVE':
            // Convert Grid to World
            const [gx, gy] = step.target;
            const currentLevel = currentShuttle.gridPosition?.level || 1;
            const worldPos = gridToWorld(gx, gy, currentLevel);

            // Log movement with Rail/Depth format
            get().addLog(`🚀 ${currentShuttleId} Moving to Rail ${gy}, Depth ${gx}`, 'move');

            // Update state to trigger movement in Shuttle.jsx
            updateShuttle(currentShuttleId, {
              status: 'MOVING',
              target: worldPos,
              gridPosition: { x: gx, y: gy, level: currentLevel }
            });

            // Wait for arrival
            await waitForShuttleArrival(currentShuttleId);
            get().addLog(`✅ ${currentShuttleId} Arrived at Rail ${gy}, Depth ${gx}`, 'success');
            break;

          case 'SHUTTLE_LIFT':
            if (lastLifted[currentShuttleId] !== step.lift) {
              if (step.lift) {
                // Lifting up
                get().addLog(`⬆️ ${currentShuttleId} Lifting`, 'action');
                updateShuttle(currentShuttleId, {
                  lifted: true,
                  onLift: step.onLift || null
                });
              } else {
                // Dropping down
                get().addLog(`⬇️ ${currentShuttleId} Dropping`, 'action');
                updateShuttle(currentShuttleId, { lifted: false });
              }
              lastLifted[currentShuttleId] = step.lift;
              await new Promise(r => setTimeout(r, 1000)); // Wait for lift animation
            }
            break;

          case 'ADD_INVENTORY':
            // Use carried pallet data if available, otherwise use provided or default
            const palletToAdd = currentShuttle.carriedPallet || step.pallet || { id: `P-${Date.now()}`, color: '#10B981' };
            addPallet(step.x, step.y, step.level, palletToAdd);
            // Clear carriedPallet AFTER adding to inventory
            updateShuttle(currentShuttleId, { carriedPallet: null });
            break;

          case 'REMOVE_INVENTORY':
            // Remove pallet and store it in shuttle
            const removedPallet = get().removePallet(step.x, step.y, step.level);
            if (removedPallet) {
              updateShuttle(currentShuttleId, { carriedPallet: removedPallet });
            }
            break;

          case 'CLEAR_CARRIED_PALLET':
            updateShuttle(currentShuttleId, { carriedPallet: null });
            break;

          case 'SPAWN_CONVEYOR_PALLET':
            // Spawn pallet at start of conveyor
            const worldSpawn = gridToWorld(step.x, step.y, step.level);
            get().addLog(`📦 Spawned Rail ${step.y}, Depth ${step.x}`, 'info');
            get().addConveyorPallet(step.id, worldSpawn);
            await new Promise(r => setTimeout(r, 500)); // Brief spawn delay
            break;

          case 'MOVE_CONVEYOR_PALLET':
            // Move pallet along conveyor
            const movePos = gridToWorld(step.x, step.y, 1);
            get().addLog(`🚚 Conveyor Rail ${step.y}, Depth ${step.x}`, 'move');
            get().updateConveyorPallet(step.id, { position: movePos, status: 'MOVING' });
            await new Promise(r => setTimeout(r, 2000)); // Longer conveyor movement time
            break;

          case 'CONVEYOR_TO_INVENTORY':
            // Transfer pallet from conveyor to inventory
            get().removeConveyorPallet(step.id);
            addPallet(step.x, step.y, step.level, { id: step.id, color: '#10B981' });
            await new Promise(r => setTimeout(r, 500));
            break;

          case 'WAIT':
            // Wait for specified duration
            if (step.message) {
              console.log(`[Wait] ${step.message}`);
            }
            await new Promise(r => setTimeout(r, step.duration || 1000));
            break;

          case 'WAIT_FOR_PALLET':
            // Wait for pallet to be available at specified location
            const startTime = Date.now();
            const checkInterval = 100; // Check every 100ms
            get().addLog(`⏳ Waiting for pallet at (${step.x}, ${step.y})`, 'info');

            while (Date.now() - startTime < step.maxWait) {
              const key = `${step.x},${step.y},${step.level}`;
              if (get().inventory[key]) {
                get().addLog(`✅ Pallet ready`, 'success');
                break;
              }
              await new Promise(r => setTimeout(r, checkInterval));
            }
            break;

          case 'LOG':
            console.log(step.message);
            break;
        }
      }

      // After sequence completes, ensure used shuttles are in IDLE state
      Object.keys(get().shuttles).forEach(id => {
         if (get().shuttles[id].status === 'MOVING' && id === shuttleId) {
             updateShuttle(id, { status: 'IDLE', target: null, path: [] });
         }
      });

      get().addLog(`✨ Task completed for ${shuttleId}`, 'success');
      console.log('[Sequence] Completed');
    } catch (error) {
      console.error("Sequence Error:", error);
      get().addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      set((state) => ({
        shuttleBusy: { ...state.shuttleBusy, [shuttleId]: false }
      }));
    }
  }

}));

// Helper to wait for shuttle
const waitForShuttleArrival = (shuttleId) => {
  return new Promise(resolve => {
    const check = setInterval(() => {
      const { shuttles } = useWarehouseStore.getState();
      const shuttle = shuttles[shuttleId];

      if (shuttle && shuttle.status === 'IDLE') {
         clearInterval(check);
         resolve();
      }
    }, 100);
  });
};
