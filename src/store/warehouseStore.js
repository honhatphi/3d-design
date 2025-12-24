import { create } from 'zustand';
import { Pathfinder } from '../utils/pathfinder';
import { gridToWorld, worldToGrid } from '../utils/gridHelpers';
import { SHUTTLE_ZONES } from '../utils/constants';

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
      ...SHUTTLE_ZONES.SHUTTLE_1, // Zone constraints from constants
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
      ...SHUTTLE_ZONES.SHUTTLE_2, // Zone constraints from constants
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

  /**
   * Task 1.2: Validate Mode Constraint
   * Ensures shuttle movement respects AISLE/RAIL mode rules
   * @throws Error if constraint is violated
   */
  validateModeConstraint: (mode, fromX, fromY, toX, toY) => {
    if (mode === 'AISLE') {
      if (fromY !== toY) {
        throw new Error(`[Mode Violation] AISLE mode: Cannot change Y (Rail). Attempted: Y ${fromY} → ${toY}`);
      }
    }
    if (mode === 'RAIL') {
      if (fromX !== toX) {
        throw new Error(`[Mode Violation] RAIL mode: Cannot change X (Depth). Attempted: X ${fromX} → ${toX}`);
      }
    }
    return true;
  },

  /**
   * Task 1.3: Generate Movement Sequence (3-Phase Logic)
   * Implements ESCAPE → TRAVEL → APPROACH pattern from logic.md
   *
   * @param {number} fromX - Current X (Depth)
   * @param {number} fromY - Current Y (Rail)
   * @param {number} toX - Target X (Depth)
   * @param {number} toY - Target Y (Rail)
   * @param {string} shuttleId - Shuttle identifier
   * @returns {Array} Array of movement steps with phase labels
   */
  generateEscapeTravelApproach: (fromX, fromY, toX, toY, shuttleId) => {
    const { shuttles } = get();
    const shuttle = shuttles[shuttleId];
    const steps = [];
    const highway = shuttle.highway; // 4 for Shuttle 1, 20 for Shuttle 2
    const highwayX = 4; // Vertical highway

    console.log(`\n[3-Phase Movement] ${shuttleId}: (${fromX},${fromY}) → (${toX},${toY})`);
    console.log(`  Highway: Y=${highway}`);

    let currentX = fromX;
    let currentY = fromY;

    // PHASE 1: ESCAPE - Exit to Highway (if not already on highway and movement needed)
    if (currentY !== highway && (currentX !== toX || currentY !== toY)) {
      console.log(`  ✈️ ESCAPE: (${currentX},${currentY}) → (${currentX},${highway}) [RAIL mode]`);
      steps.push({
        phase: 'ESCAPE',
        mode: 'RAIL',
        fromX: currentX,
        fromY: currentY,
        toX: currentX,
        toY: highway,
        description: `Exit to highway Y=${highway}`
      });
      currentY = highway;
    }

    // PHASE 2: TRAVEL - Move along Highway (if depth change needed)
    if (currentX !== toX) {
      console.log(`  🚗 TRAVEL: (${currentX},${currentY}) → (${toX},${currentY}) [AISLE mode]`);
      steps.push({
        phase: 'TRAVEL',
        mode: 'AISLE',
        fromX: currentX,
        fromY: currentY,
        toX: toX,
        toY: currentY,
        description: `Travel on highway from X=${currentX} to X=${toX}`
      });
      currentX = toX;
    }

    // PHASE 3: APPROACH - Enter to Target (if not already there)
    if (currentY !== toY) {
      console.log(`  🎯 APPROACH: (${currentX},${currentY}) → (${currentX},${toY}) [RAIL mode]`);
      steps.push({
        phase: 'APPROACH',
        mode: 'RAIL',
        fromX: currentX,
        fromY: currentY,
        toX: currentX,
        toY: toY,
        description: `Enter target at Y=${toY}`
      });
      currentY = toY;
    }

    // Validate all steps
    steps.forEach((step, idx) => {
      try {
        get().validateModeConstraint(step.mode, step.fromX, step.fromY, step.toX, step.toY);
      } catch (error) {
        console.error(`[Validation Failed] Step ${idx + 1} (${step.phase}):`, error.message);
        throw error;
      }
    });

    console.log(`  ✅ Generated ${steps.length} valid movement steps\n`);

    // Convert metadata steps to actual sequence commands
    const sequence = [];
    steps.forEach(step => {
      sequence.push({ type: 'SHUTTLE_MODE', mode: step.mode, shuttleId });
      sequence.push({ type: 'SHUTTLE_MOVE', target: [step.toX, step.toY], shuttleId });
    });

    return sequence;
  },

  /**
   * Task 2.1: Navigate To Lift
   * Generate movement sequence from current position to assigned lift
   * @param {string} shuttleId - Shuttle identifier
   * @param {number} currentX - Current X position
   * @param {number} currentY - Current Y position
   * @returns {Array} Movement steps to reach lift
   */
  navigateToLift: (shuttleId, currentX, currentY) => {
    const { shuttles } = get();
    const shuttle = shuttles[shuttleId];
    const liftX = shuttle.liftX; // 2
    const liftY = shuttle.liftY; // 5 for SHUTTLE_1, 19 for SHUTTLE_2

    console.log(`[Navigate To Lift] ${shuttleId}: (${currentX},${currentY}) → Lift at (${liftX},${liftY})`);

    return get().generateEscapeTravelApproach(currentX, currentY, liftX, liftY, shuttleId);
  },

  /**
   * Task 2.2: Navigate From Lift
   * Generate movement sequence from lift to target position
   * @param {string} shuttleId - Shuttle identifier
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @returns {Array} Movement steps from lift to target
   */
  navigateFromLift: (shuttleId, targetX, targetY) => {
    const { shuttles } = get();
    const shuttle = shuttles[shuttleId];
    const liftX = shuttle.liftX; // 2
    const liftY = shuttle.liftY; // 5 for SHUTTLE_1, 19 for SHUTTLE_2

    console.log(`[Navigate From Lift] ${shuttleId}: Lift at (${liftX},${liftY}) → (${targetX},${targetY})`);

    return get().generateEscapeTravelApproach(liftX, liftY, targetX, targetY, shuttleId);
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
   * Process Inbound Request (Refactored for logic.md compliance)
   *
   * Flow:
   * 1. Find deepest empty slot in target row/level
   * 2. Retrieve shuttle to Level 1 if needed (navigate to lift → board → down → disembark)
   * 3. Spawn pallet on conveyor and move to lift position
   * 4. Shuttle picks pallet from lift position
   * 5. If target level > 1: board lift → go up → disembark
   * 6. Navigate to target position using 3-phase movement
   * 7. Drop pallet
   * 8. Exit to highway
   */
  processInboundRequest: (targetRow = 6, targetLevel = 1) => {
    const state = get();
    const { inventory, shuttles } = state;

    const isUpperBlock = targetRow > 12;
    const shuttleId = isUpperBlock ? 'SHUTTLE_2' : 'SHUTTLE_1';
    const liftId = isUpperBlock ? 'LIFT_UPPER' : 'LIFT_LOWER';
    const shuttle = shuttles[shuttleId];
    const { liftX, liftY, highway } = shuttle;

    // 1. Find Target Cell (Deepest Empty)
    let targetX = null;
    const startX = 5;
    const endX = 25;

    for (let x = endX; x >= startX; x--) {
      if (!inventory[`${x},${targetRow},${targetLevel}`]) {
        targetX = x;
        break;
      }
    }

    if (!targetX) {
      get().addLog(`⚠️ Row ${targetRow} Level ${targetLevel} is full!`, 'error');
      return;
    }

    console.log(`[INBOUND] Target: X=${targetX}, Y=${targetRow}, Level=${targetLevel} using ${shuttleId}`);
    get().addLog(`📥 Inbound: Rail ${targetRow}, Depth ${targetX}, Level ${targetLevel}`, 'start');

    const sequence = [];
    const currentLevel = shuttle.gridPosition.level || 1;
    const currentX = shuttle.gridPosition.x;
    const currentY = shuttle.gridPosition.y;
    const palletId = `INBOUND-${Date.now()}`;

    // === STAGE 1: RETRIEVE SHUTTLE TO LEVEL 1 (if not already there) ===
    if (currentLevel > 1) {
      console.log(`[INBOUND] Retrieving shuttle from Level ${currentLevel} to Level 1`);

      // Navigate to lift using helper
      const liftNavSequence = get().navigateToLift(shuttleId, currentX, currentY);
      sequence.push(...liftNavSequence);

      // Move lift to shuttle's level first (safety)
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: currentLevel });

      // Board lift
      sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });

      // Move down to Level 1
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: 1 });
      get().addLog(`⬇️ Retrieving ${shuttleId} to Level 1`, 'action');

      // Disembark
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });

      console.log(`[INBOUND] Shuttle now at Level 1, position (${liftX}, ${liftY})`);
    } else {
      // Already at Level 1, navigate to lift position
      console.log(`[INBOUND] Already at Level 1, moving to lift position`);

      try {
        const liftNavSequence = get().navigateToLift(shuttleId, currentX, currentY);
        sequence.push(...liftNavSequence);
      } catch (error) {
        get().addLog(`❌ Navigation error: ${error.message}`, 'error');
        return;
      }

      // Ensure lift is at Level 1
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: 1 });

      // Board lift (to wait for pallet)
      sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });
    }

    // === STAGE 2: CONVEYOR FEED ===
    // Conveyor Y depends on block
    const conveyorY = isUpperBlock ? 18 : 6;

    console.log(`[INBOUND] Spawning pallet on conveyor at Y=${conveyorY}`);

    sequence.push({
      type: 'SPAWN_CONVEYOR_PALLET',
      id: palletId,
      x: 0,
      y: conveyorY,
      level: 1
    });

    sequence.push({ type: 'WAIT', duration: 500, message: 'Pallet spawning...' });

    // Move pallet along conveyor to lift
    sequence.push(
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 1, y: conveyorY },
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 2, y: conveyorY },
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 2, y: liftY }
    );

    // Transfer to inventory at lift position
    sequence.push({
      type: 'CONVEYOR_TO_INVENTORY',
      id: palletId,
      x: liftX,
      y: liftY,
      level: 1
    });

    // Wait for pallet to arrive
    sequence.push({
      type: 'WAIT_FOR_PALLET',
      x: liftX,
      y: liftY,
      level: 1,
      maxWait: 10000
    });

    // === STAGE 3: PICK PALLET ===
    console.log(`[INBOUND] Picking pallet from lift position`);

    // Remove from inventory (shuttle grabs it)
    sequence.push({ type: 'REMOVE_INVENTORY', x: liftX, y: liftY, level: 1, shuttleId });

    // Keep deck down while moving
    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, onLift: liftId, shuttleId });

    // === STAGE 4: LEVEL UP (if needed) ===
    if (targetLevel > 1) {
      console.log(`[INBOUND] Moving to Level ${targetLevel}`);

      // Shuttle stays on lift, lift moves up with shuttle
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: targetLevel });
      get().addLog(`🔼 Lift to Level ${targetLevel} (with shuttle)`, 'action');

      sequence.push({ type: 'WAIT', duration: 2000, message: 'Lift moving...' });

      // Lift pallet before exiting
      sequence.push({ type: 'SHUTTLE_LIFT', lift: true, onLift: liftId, shuttleId });
      sequence.push({ type: 'WAIT', duration: 500, message: 'Lifting animation...' });

      // Disembark
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    } else {
      // Staying at Level 1
      console.log(`[INBOUND] Staying at Level 1`);

      // Lift pallet
      sequence.push({ type: 'SHUTTLE_LIFT', lift: true, onLift: liftId, shuttleId });
      sequence.push({ type: 'WAIT', duration: 500, message: 'Lifting animation...' });

      // Disembark
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    }

    // === STAGE 5: NAVIGATE TO TARGET ===
    console.log(`[INBOUND] Navigating from lift (${liftX}, ${liftY}) to target (${targetX}, ${targetRow})`);

    try {
      const targetNavSequence = get().navigateFromLift(shuttleId, targetX, targetRow);
      sequence.push(...targetNavSequence);
    } catch (error) {
      get().addLog(`❌ Navigation error: ${error.message}`, 'error');
      return;
    }

    // === STAGE 6: DROP PALLET ===
    console.log(`[INBOUND] Dropping pallet at (${targetX}, ${targetRow}, ${targetLevel})`);

    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Dropping animation...' });
    sequence.push({ type: 'ADD_INVENTORY', x: targetX, y: targetRow, level: targetLevel, shuttleId });

    // === STAGE 7: EXIT TO HIGHWAY ===
    console.log(`[INBOUND] Returning to highway Y=${highway} at current depth X=${targetX}`);

    try {
      // Exit from target back to highway at same depth (targetX, highway)
      const exitSequence = get().generateEscapeTravelApproach(
        targetX, targetRow,
        targetX, highway,  // Keep X, return to highway Y
        shuttleId
      );
      sequence.push(...exitSequence);
    } catch (error) {
      get().addLog(`❌ Exit navigation error: ${error.message}`, 'error');
      // Don't return, pallet already dropped
    }

    sequence.push({ type: 'LOG', message: 'Inbound Complete!' });

    // Execute sequence
    get().executeSequence(sequence, shuttleId);
  },

  /**
   * Process Outbound Request (Refactored for logic.md compliance)
   *
   * Flow:
   * 1. Find pallet in target row/level (closest to aisle, X=5)
   * 2. If level change needed: navigate to lift → board → move → disembark
   * 3. Navigate to pallet using 3-phase ESCAPE→TRAVEL→APPROACH
   * 4. Pick pallet (lift + remove from inventory)
   * 5. Navigate to lift using 3-phase movement
   * 6. If level > 1: board lift → go to level 1 → disembark
   * 7. Drop pallet at lift output
   * 8. Move away to highway position
   */
  processOutboundRequest: (targetRow = 6, targetLevel = 1) => {
    const state = get();
    const { inventory, shuttles } = state;

    const isUpperBlock = targetRow > 12;
    const shuttleId = isUpperBlock ? 'SHUTTLE_2' : 'SHUTTLE_1';
    const liftId = isUpperBlock ? 'LIFT_UPPER' : 'LIFT_LOWER';
    const shuttle = shuttles[shuttleId];
    const { liftX, liftY, highway } = shuttle;

    // 1. Find Pallet (Closest to aisle = smallest X)
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
    const currentLevel = shuttle.gridPosition.level || 1;
    const currentX = shuttle.gridPosition.x;
    const currentY = shuttle.gridPosition.y;

    console.log(`[OUTBOUND] Shuttle ${shuttleId} at X=${currentX}, Y=${currentY}, Level=${currentLevel}`);
    console.log(`[OUTBOUND] Target pallet at X=${targetX}, Y=${targetRow}, Level=${targetLevel}`);

    // === STAGE 1: LEVEL CHANGE (if needed) ===
    if (currentLevel !== targetLevel) {
      console.log(`[OUTBOUND] Level change required: ${currentLevel} → ${targetLevel}`);

      // Navigate to lift using helper (handles 3-phase movement)
      const liftNavSequence = get().navigateToLift(shuttleId, currentX, currentY);
      sequence.push(...liftNavSequence);

      // Board, move lift, disembark
      sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: targetLevel });
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });

      // After disembark, shuttle is at (liftX, liftY, targetLevel)
      console.log(`[OUTBOUND] Disembarked at lift position: X=${liftX}, Y=${liftY}, Level=${targetLevel}`);
    }

    // === STAGE 2: NAVIGATE TO PALLET ===
    // Current position after level change (or initial if no change needed)
    const fromX = currentLevel !== targetLevel ? liftX : currentX;
    const fromY = currentLevel !== targetLevel ? liftY : currentY;

    console.log(`[OUTBOUND] Navigating from (${fromX}, ${fromY}) to pallet at (${targetX}, ${targetRow})`);

    try {
      const palletNavSequence = get().generateEscapeTravelApproach(
        fromX, fromY,
        targetX, targetRow,
        shuttleId
      );
      sequence.push(...palletNavSequence);
    } catch (error) {
      get().addLog(`❌ Navigation error: ${error.message}`, 'error');
      return;
    }

    // === STAGE 3: PICK PALLET ===
    console.log(`[OUTBOUND] Picking pallet at (${targetX}, ${targetRow}, ${targetLevel})`);
    sequence.push({ type: 'SHUTTLE_LIFT', lift: true, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Picking pallet...' });
    sequence.push({ type: 'REMOVE_INVENTORY', x: targetX, y: targetRow, level: targetLevel, shuttleId });

    // === STAGE 4: RETURN TO LIFT ===
    console.log(`[OUTBOUND] Returning to lift at (${liftX}, ${liftY})`);

    try {
      const returnNavSequence = get().generateEscapeTravelApproach(
        targetX, targetRow,
        liftX, liftY,
        shuttleId
      );
      sequence.push(...returnNavSequence);
    } catch (error) {
      get().addLog(`❌ Return navigation error: ${error.message}`, 'error');
      return;
    }

    // === STAGE 5: LEVEL DOWN (if not at Level 1) ===
    if (targetLevel > 1) {
      console.log(`[OUTBOUND] Returning to Level 1 from Level ${targetLevel}`);
      sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: 1 });
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    }

    // === STAGE 6: DROP PALLET AT OUTPUT ===
    console.log(`[OUTBOUND] Dropping pallet at lift output`);
    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Dropping pallet...' });
    sequence.push({ type: 'LOG', message: 'Outbound Pallet Dropped at Output' });
    sequence.push({ type: 'CLEAR_CARRIED_PALLET', shuttleId });

    // === STAGE 7: MOVE TO HIGHWAY ===
    console.log(`[OUTBOUND] Returning to highway Y=${highway} at current depth X=${liftX}`);
    try {
      const highwayNavSequence = get().generateEscapeTravelApproach(
        liftX, liftY,
        liftX, highway,  // Keep X, return to highway Y
        shuttleId
      );
      sequence.push(...highwayNavSequence);
    } catch (error) {
      get().addLog(`❌ Highway navigation error: ${error.message}`, 'error');
      // Don't return, pallet already dropped - this is just positioning
    }

    sequence.push({ type: 'LOG', message: 'Outbound Complete!' });

    // Execute sequence
    get().executeSequence(sequence, shuttleId);
  },

  /**
   * Process Transfer Request (Refactored for logic.md compliance)
   *
   * Flow:
   * 1. Find source pallet (closest to aisle) and destination slot (deepest)
   * 2. If source level != current: navigate to lift → board → move → disembark
   * 3. Navigate to source pallet using 3-phase movement
   * 4. Pick pallet
   * 5. If source level != dest level: navigate to lift → board → move → disembark
   * 6. Navigate to destination using 3-phase movement
   * 7. Drop pallet
   * 8. Exit to highway
   */
  processTransferRequest: (fromRow, fromLevel, toRow, toLevel) => {
    const state = get();
    const { inventory, shuttles } = state;

    // Determine shuttle based on source row
    const isUpperBlock = fromRow > 12;
    const shuttleId = isUpperBlock ? 'SHUTTLE_2' : 'SHUTTLE_1';
    const liftId = isUpperBlock ? 'LIFT_UPPER' : 'LIFT_LOWER';
    const shuttle = shuttles[shuttleId];
    const { liftX, liftY, highway } = shuttle;

    // 1. Find Source Pallet (Closest to aisle)
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

    get().addLog(`🔄 Transfer: Rail ${fromRow}/L${fromLevel} → Rail ${toRow}/L${toLevel}`, 'start');

    const sequence = [];
    const currentLevel = shuttle.gridPosition.level || 1;
    const currentX = shuttle.gridPosition.x;
    const currentY = shuttle.gridPosition.y;

    console.log(`[TRANSFER] Source: (${sourceX}, ${fromRow}, ${fromLevel}) → Dest: (${destX}, ${toRow}, ${toLevel})`);

    // === STAGE 1: LEVEL CHANGE TO SOURCE (if needed) ===
    if (currentLevel !== fromLevel) {
      console.log(`[TRANSFER] Level change: ${currentLevel} → ${fromLevel}`);

      // Navigate to lift
      const liftNavSequence = get().navigateToLift(shuttleId, currentX, currentY);
      sequence.push(...liftNavSequence);

      // Board, move, disembark
      sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: fromLevel });
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    }

    // === STAGE 2: NAVIGATE TO SOURCE PALLET ===
    const fromX = currentLevel !== fromLevel ? liftX : currentX;
    const fromY = currentLevel !== fromLevel ? liftY : currentY;

    console.log(`[TRANSFER] Navigating to source pallet at (${sourceX}, ${fromRow})`);

    try {
      const sourceNavSequence = get().generateEscapeTravelApproach(
        fromX, fromY,
        sourceX, fromRow,
        shuttleId
      );
      sequence.push(...sourceNavSequence);
    } catch (error) {
      get().addLog(`❌ Navigation error: ${error.message}`, 'error');
      return;
    }

    // === STAGE 3: PICK PALLET ===
    console.log(`[TRANSFER] Picking pallet from (${sourceX}, ${fromRow}, ${fromLevel})`);

    sequence.push({ type: 'SHUTTLE_LIFT', lift: true, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Picking pallet...' });
    sequence.push({ type: 'REMOVE_INVENTORY', x: sourceX, y: fromRow, level: fromLevel, shuttleId });

    // === STAGE 4: LEVEL CHANGE TO DESTINATION (if needed) ===
    if (fromLevel !== toLevel) {
      console.log(`[TRANSFER] Level change: ${fromLevel} → ${toLevel}`);

      // Navigate back to lift with pallet
      try {
        const liftReturnSequence = get().generateEscapeTravelApproach(
          sourceX, fromRow,
          liftX, liftY,
          shuttleId
        );
        sequence.push(...liftReturnSequence);
      } catch (error) {
        get().addLog(`❌ Lift navigation error: ${error.message}`, 'error');
        return;
      }

      // Board lift
      sequence.push({ type: 'SHUTTLE_BOARD', id: liftId, shuttleId });

      // Move to destination level
      sequence.push({ type: 'LIFT_MOVE', id: liftId, level: toLevel });
      sequence.push({ type: 'WAIT', duration: 2000, message: 'Lift moving...' });

      // Disembark
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    }

    // === STAGE 5: NAVIGATE TO DESTINATION ===
    const startX = fromLevel !== toLevel ? liftX : sourceX;
    const startY = fromLevel !== toLevel ? liftY : fromRow;

    console.log(`[TRANSFER] Navigating to destination (${destX}, ${toRow})`);

    try {
      const destNavSequence = get().generateEscapeTravelApproach(
        startX, startY,
        destX, toRow,
        shuttleId
      );
      sequence.push(...destNavSequence);
    } catch (error) {
      get().addLog(`❌ Destination navigation error: ${error.message}`, 'error');
      return;
    }

    // === STAGE 6: DROP PALLET ===
    console.log(`[TRANSFER] Dropping pallet at (${destX}, ${toRow}, ${toLevel})`);

    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Dropping pallet...' });
    sequence.push({ type: 'ADD_INVENTORY', x: destX, y: toRow, level: toLevel, shuttleId });

    // === STAGE 7: EXIT TO HIGHWAY ===
    console.log(`[TRANSFER] Returning to highway Y=${highway} at current depth X=${destX}`);

    try {
      const exitSequence = get().generateEscapeTravelApproach(
        destX, toRow,
        destX, highway,  // Keep X, return to highway Y
        shuttleId
      );
      sequence.push(...exitSequence);
    } catch (error) {
      get().addLog(`❌ Exit navigation error: ${error.message}`, 'error');
      // Don't return, pallet already dropped
    }

    sequence.push({ type: 'LOG', message: 'Transfer Complete!' });

    // Execute sequence
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
            const fromX = currentShuttle.gridPosition?.x || gx;
            const fromY = currentShuttle.gridPosition?.y || gy;

            // VALIDATION: Check mode constraint before moving
            const currentMode = currentShuttle.mode || 'AISLE';
            try {
              get().validateModeConstraint(currentMode, fromX, fromY, gx, gy);
            } catch (error) {
              get().addLog(`❌ ${currentShuttleId} Movement BLOCKED: ${error.message}`, 'error');
              console.error(`[SHUTTLE_MOVE] Validation failed:`, {
                mode: currentMode,
                from: [fromX, fromY],
                to: [gx, gy],
                error: error.message
              });
              throw error; // Stop sequence execution
            }

            const worldPos = gridToWorld(gx, gy, currentLevel);

            // Log movement with mode info
            const moveType = fromX !== gx ? 'Depth' : 'Rail';
            get().addLog(`🚀 ${currentShuttleId} [${currentMode}] Moving to Rail ${gy}, Depth ${gx}`, 'move');
            console.log(`[SHUTTLE_MOVE] ${currentShuttleId} ${moveType}: (${fromX},${fromY}) → (${gx},${gy})`);

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
