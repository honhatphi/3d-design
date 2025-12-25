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
  inventory: (() => {
    const newInventory = {};
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    let palletId = 1;

    // LOWER BLOCK: Rails 1-11 (Shuttle 1, Highway Y=4)
    // Fill from deepest rows FIRST (Row 1, 2, 3...) so they don't get blocked
    // TRUE 2/3 capacity: X from 25 down to 13 (13 positions out of 20 = 65%)

    // Row 1: Deepest - 4 levels, X from 25 to 13
    for (let z = 1; z <= 4; z++) {
      for (let x = 25; x >= 13; x--) {
        newInventory[`${x},1,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 2: 4 levels, X from 25 to 14
    for (let z = 1; z <= 4; z++) {
      for (let x = 25; x >= 14; x--) {
        newInventory[`${x},2,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 3: 3 levels, X from 25 to 15
    for (let z = 1; z <= 3; z++) {
      for (let x = 25; x >= 15; x--) {
        newInventory[`${x},3,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 5: 3 levels, X from 25 to 16 (skip row 4 - it's the highway)
    for (let z = 1; z <= 3; z++) {
      for (let x = 25; x >= 16; x--) {
        newInventory[`${x},5,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 6: 2 levels, X from 25 to 17
    for (let z = 1; z <= 2; z++) {
      for (let x = 25; x >= 17; x--) {
        newInventory[`${x},6,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 7: 2 levels, X from 25 to 18
    for (let z = 1; z <= 2; z++) {
      for (let x = 25; x >= 18; x--) {
        newInventory[`${x},7,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 8: 1 level, X from 25 to 19
    for (let x = 25; x >= 19; x--) {
      newInventory[`${x},8,1`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
    }

    // Row 9: 1 level, X from 25 to 20
    for (let x = 25; x >= 20; x--) {
      newInventory[`${x},9,1`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
    }

    // UPPER BLOCK: Rails 13-23 (Shuttle 2, Highway Y=20)
    // Fill from deepest rows FIRST (Row 23, 22, 21...) so they don't get blocked
    // TRUE 2/3 capacity: X from 25 down to 13 (13 positions out of 20 = 65%)

    // Row 23: Deepest - 4 levels, X from 25 to 13
    for (let z = 1; z <= 4; z++) {
      for (let x = 25; x >= 13; x--) {
        newInventory[`${x},23,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 22: 4 levels, X from 25 to 14
    for (let z = 1; z <= 4; z++) {
      for (let x = 25; x >= 14; x--) {
        newInventory[`${x},22,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 21: 3 levels, X from 25 to 15
    for (let z = 1; z <= 3; z++) {
      for (let x = 25; x >= 15; x--) {
        newInventory[`${x},21,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 19: 3 levels, X from 25 to 16 (skip row 20 - it's the highway)
    for (let z = 1; z <= 3; z++) {
      for (let x = 25; x >= 16; x--) {
        newInventory[`${x},19,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 18: 2 levels, X from 25 to 17
    for (let z = 1; z <= 2; z++) {
      for (let x = 25; x >= 17; x--) {
        newInventory[`${x},18,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 17: 2 levels, X from 25 to 18
    for (let z = 1; z <= 2; z++) {
      for (let x = 25; x >= 18; x--) {
        newInventory[`${x},17,${z}`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
      }
    }

    // Row 16: 1 level, X from 25 to 19
    for (let x = 25; x >= 19; x--) {
      newInventory[`${x},16,1`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
    }

    // Row 15: 1 level, X from 25 to 20
    for (let x = 25; x >= 20; x--) {
      newInventory[`${x},15,1`] = { id: `P-${String(palletId++).padStart(3, '0')}`, color: colors[(palletId-1) % 8] };
    }

    console.log(`[InitInventory] Created ${palletId - 1} pallets filling ~2/3 warehouse (X: 25→13)`);
    return newInventory;
  })(),

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
   * Check if path to target position is blocked by pallets in intermediate rails
   * Shuttle must be able to enter the target rail from highway without collision
   *
   * @param {number} targetX - Target depth position
   * @param {number} targetRow - Target rail/row
   * @param {number} targetLevel - Target level
   * @param {string} shuttleId - Which shuttle is performing the operation
   * @param {Object} inventory - Current inventory state
   * @returns {boolean} - True if path is blocked, false if clear
   */
  isPathBlocked: (targetX, targetRow, targetLevel, shuttleId, inventory) => {
    const shuttle = get().shuttles[shuttleId];
    const { highway } = shuttle;

    // Xác định hướng shuttle đi vào từ highway
    // Nếu targetRow < highway: shuttle đi từ highway xuống (giảm Y)
    // Nếu targetRow > highway: shuttle đi từ highway lên (tăng Y)
    const isGoingDown = targetRow < highway;

    // Shuttle luôn đi từ X=4 (vertical highway) vào đến targetX
    // Cần kiểm tra các rail trung gian giữa highway và targetRow

    if (isGoingDown) {
      // Shuttle đi xuống từ highway: kiểm tra các rail từ highway-1 xuống targetRow+1
      // Ví dụ: highway=4, targetRow=1 → kiểm tra rails 3, 2
      for (let checkRow = highway - 1; checkRow > targetRow; checkRow--) {
        // Kiểm tra vị trí tại depth targetX, cùng level
        if (inventory[`${targetX},${checkRow},${targetLevel}`]) {
          console.log(`[BLOCK CHECK] Blocked: Rail ${checkRow} at depth ${targetX}, level ${targetLevel}`);
          return true; // Bị chắn
        }
      }
    } else {
      // Shuttle đi lên từ highway: kiểm tra các rail từ highway+1 lên targetRow-1
      // Ví dụ: highway=20, targetRow=22 → kiểm tra rail 21
      for (let checkRow = highway + 1; checkRow < targetRow; checkRow++) {
        // Kiểm tra vị trí tại depth targetX, cùng level
        if (inventory[`${targetX},${checkRow},${targetLevel}`]) {
          console.log(`[BLOCK CHECK] Blocked: Rail ${checkRow} at depth ${targetX}, level ${targetLevel}`);
          return true; // Bị chắn
        }
      }
    }

    return false; // Không bị chắn
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

    // 1. Find Target Cell (Deepest Empty & Not Blocked)
    let targetX = null;
    let actualTargetRow = targetRow;
    const startX = 5;
    const endX = 25;

    // Thử tìm ở rail được chỉ định trước
    for (let x = endX; x >= startX; x--) {
      if (!inventory[`${x},${targetRow},${targetLevel}`]) {
        if (!get().isPathBlocked(x, targetRow, targetLevel, shuttleId, inventory)) {
          targetX = x;
          break;
        } else {
          console.log(`[INBOUND] Position (${x}, ${targetRow}, ${targetLevel}) is blocked by intermediate pallets`);
        }
      }
    }

    // Nếu không tìm thấy ở rail được chỉ định, tự động tìm rail khác trong zone
    if (!targetX) {
      console.log(`[INBOUND] Rail ${targetRow} has no accessible empty slots, searching other rails...`);
      const { minRail, maxRail } = shuttle;

      for (let testRow = minRail; testRow <= maxRail; testRow++) {
        if (testRow === targetRow || testRow === highway) continue; // Bỏ qua rail đã thử và highway

        for (let x = endX; x >= startX; x--) {
          if (!inventory[`${x},${testRow},${targetLevel}`]) {
            if (!get().isPathBlocked(x, testRow, targetLevel, shuttleId, inventory)) {
              targetX = x;
              actualTargetRow = testRow;
              console.log(`[INBOUND] Found alternative slot at Rail ${testRow}, Depth ${x}`);
              get().addLog(`ℹ️ Using Rail ${testRow} instead of ${targetRow} (blocked)`, 'info');
              break;
            }
          }
        }
        if (targetX) break;
      }
    }

    if (!targetX) {
      get().addLog(`⚠️ No accessible empty slots found in zone at level ${targetLevel}!`, 'error');
      return;
    }

    console.log(`[INBOUND] Target: X=${targetX}, Y=${actualTargetRow}, Level=${targetLevel} using ${shuttleId}`);
    get().addLog(`📥 Inbound: Rail ${actualTargetRow}, Depth ${targetX}, Level ${targetLevel}`, 'start');

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
    console.log(`[INBOUND] Navigating from lift (${liftX}, ${liftY}) to target (${targetX}, ${actualTargetRow})`);

    try {
      const targetNavSequence = get().navigateFromLift(shuttleId, targetX, actualTargetRow);
      sequence.push(...targetNavSequence);
    } catch (error) {
      get().addLog(`❌ Navigation error: ${error.message}`, 'error');
      return;
    }

    // === STAGE 6: DROP PALLET ===
    console.log(`[INBOUND] Dropping pallet at (${targetX}, ${actualTargetRow}, ${targetLevel})`);

    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Dropping animation...' });
    sequence.push({ type: 'ADD_INVENTORY', x: targetX, y: actualTargetRow, level: targetLevel, shuttleId });

    // === STAGE 7: EXIT TO HIGHWAY ===
    console.log(`[INBOUND] Returning to highway Y=${highway} at current depth X=${targetX}`);

    try {
      // Exit from target back to highway at same depth (targetX, highway)
      const exitSequence = get().generateEscapeTravelApproach(
        targetX, actualTargetRow,
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

    // 1. Find Pallet (Closest to aisle = smallest X & Not Blocked)
    let targetX = null;
    let actualTargetRow = targetRow;
    const startX = 5;
    const endX = 25;

    // Thử tìm ở rail được chỉ định trước
    for (let x = startX; x <= endX; x++) {
      if (inventory[`${x},${targetRow},${targetLevel}`]) {
        if (!get().isPathBlocked(x, targetRow, targetLevel, shuttleId, inventory)) {
          targetX = x;
          break;
        } else {
          console.log(`[OUTBOUND] Pallet at (${x}, ${targetRow}, ${targetLevel}) is blocked by intermediate pallets`);
        }
      }
    }

    // Nếu không tìm thấy ở rail được chỉ định, tự động tìm rail khác trong zone
    if (!targetX) {
      console.log(`[OUTBOUND] Rail ${targetRow} has no accessible pallets, searching other rails...`);
      const { minRail, maxRail } = shuttle;

      for (let testRow = minRail; testRow <= maxRail; testRow++) {
        if (testRow === targetRow || testRow === highway) continue; // Bỏ qua rail đã thử và highway

        for (let x = startX; x <= endX; x++) {
          if (inventory[`${x},${testRow},${targetLevel}`]) {
            if (!get().isPathBlocked(x, testRow, targetLevel, shuttleId, inventory)) {
              targetX = x;
              actualTargetRow = testRow;
              console.log(`[OUTBOUND] Found alternative pallet at Rail ${testRow}, Depth ${x}`);
              get().addLog(`ℹ️ Using Rail ${testRow} instead of ${targetRow} (blocked)`, 'info');
              break;
            }
          }
        }
        if (targetX) break;
      }
    }

    if (!targetX) {
      get().addLog(`⚠️ No accessible pallets found in zone at level ${targetLevel}!`, 'error');
      return;
    }

    get().addLog(`📤 Outbound: Rail ${actualTargetRow}, Depth ${targetX}, Level ${targetLevel}`, 'start');

    const sequence = [];
    const currentLevel = shuttle.gridPosition.level || 1;
    const currentX = shuttle.gridPosition.x;
    const currentY = shuttle.gridPosition.y;

    console.log(`[OUTBOUND] Shuttle ${shuttleId} at X=${currentX}, Y=${currentY}, Level=${currentLevel}`);
    console.log(`[OUTBOUND] Target pallet at X=${targetX}, Y=${actualTargetRow}, Level=${targetLevel}`);

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

    console.log(`[OUTBOUND] Navigating from (${fromX}, ${fromY}) to pallet at (${targetX}, ${actualTargetRow})`);

    try {
      const palletNavSequence = get().generateEscapeTravelApproach(
        fromX, fromY,
        targetX, actualTargetRow,
        shuttleId
      );
      sequence.push(...palletNavSequence);
    } catch (error) {
      get().addLog(`❌ Navigation error: ${error.message}`, 'error');
      return;
    }

    // === STAGE 3: PICK PALLET ===
    console.log(`[OUTBOUND] Picking pallet at (${targetX}, ${actualTargetRow}, ${targetLevel})`);
    sequence.push({ type: 'SHUTTLE_LIFT', lift: true, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Picking pallet...' });
    sequence.push({ type: 'REMOVE_INVENTORY', x: targetX, y: actualTargetRow, level: targetLevel, shuttleId });

    // === STAGE 4: RETURN TO LIFT ===
    console.log(`[OUTBOUND] Returning to lift at (${liftX}, ${liftY})`);

    try {
      const returnNavSequence = get().generateEscapeTravelApproach(
        targetX, actualTargetRow,
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
    } else {
      // Already at Level 1, but need to disembark if still on lift
      console.log(`[OUTBOUND] Already at Level 1, disembarking from lift`);
      sequence.push({ type: 'SHUTTLE_BOARD', id: null, shuttleId });
    }

    // === STAGE 6: DROP PALLET AT OUTPUT ===
    console.log(`[OUTBOUND] Dropping pallet at lift output`);

    // Lower the shuttle deck to drop pallet
    sequence.push({ type: 'SHUTTLE_LIFT', lift: false, shuttleId });
    sequence.push({ type: 'WAIT', duration: 800, message: 'Dropping pallet...' });

    // Get carried pallet info before clearing
    const palletId = `OUTBOUND-${Date.now()}`;

    // Clear shuttle's carried pallet reference (visual update)
    sequence.push({ type: 'CLEAR_CARRIED_PALLET', shuttleId });

    // === STAGE 6b: SHUTTLE MOVES AWAY FROM LIFT ===
    // Shuttle must move away before conveyor animation
    console.log(`[OUTBOUND] Shuttle moving away from lift`);
    sequence.push({ type: 'SHUTTLE_MODE', mode: 'RAIL', shuttleId });
    sequence.push({ type: 'SHUTTLE_MOVE', target: [liftX, highway], shuttleId });

    // === STAGE 6c: TRANSFER TO CONVEYOR ===
    console.log(`[OUTBOUND] Transferring pallet to conveyor`);

    // Spawn pallet directly on conveyor (no inventory step)
    const conveyorY = isUpperBlock ? 18 : 6;
    sequence.push({
      type: 'SPAWN_CONVEYOR_PALLET',
      id: palletId,
      x: 2,  // Lift X position
      y: liftY,
      level: 1
    });

    // Move pallet along conveyor to exit
    sequence.push({ type: 'WAIT', duration: 300, message: 'Loading to conveyor...' });
    sequence.push(
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 2, y: conveyorY },
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 1, y: conveyorY },
      { type: 'MOVE_CONVEYOR_PALLET', id: palletId, x: 0, y: conveyorY }
    );

    // Despawn pallet at exit
    sequence.push({ type: 'REMOVE_CONVEYOR_PALLET', id: palletId });
    sequence.push({ type: 'LOG', message: 'Outbound Pallet Exported!' });

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

    // 1. Find Source Pallet (Closest to aisle & Not Blocked)
    let sourceX = null;
    let actualFromRow = fromRow;

    // Thử tìm ở rail được chỉ định trước
    for (let x = 5; x <= 25; x++) {
      if (inventory[`${x},${fromRow},${fromLevel}`]) {
        if (!get().isPathBlocked(x, fromRow, fromLevel, shuttleId, inventory)) {
          sourceX = x;
          break;
        } else {
          console.log(`[TRANSFER] Source pallet at (${x}, ${fromRow}, ${fromLevel}) is blocked by intermediate pallets`);
        }
      }
    }

    // Nếu không tìm thấy ở rail được chỉ định, tự động tìm rail khác trong zone
    if (!sourceX) {
      console.log(`[TRANSFER] Rail ${fromRow} has no accessible pallets, searching other rails...`);
      const { minRail, maxRail } = shuttle;

      for (let testRow = minRail; testRow <= maxRail; testRow++) {
        if (testRow === fromRow || testRow === highway) continue; // Bỏ qua rail đã thử và highway

        for (let x = 5; x <= 25; x++) {
          if (inventory[`${x},${testRow},${fromLevel}`]) {
            if (!get().isPathBlocked(x, testRow, fromLevel, shuttleId, inventory)) {
              sourceX = x;
              actualFromRow = testRow;
              console.log(`[TRANSFER] Found alternative source at Rail ${testRow}, Depth ${x}`);
              get().addLog(`ℹ️ Using Rail ${testRow} instead of ${fromRow} (blocked)`, 'info');
              break;
            }
          }
        }
        if (sourceX) break;
      }
    }

    if (!sourceX) {
      get().addLog(`⚠️ No accessible pallets found in zone at level ${fromLevel}!`, 'error');
      return;
    }

    // 2. Find Destination Slot (Deepest empty & Not Blocked)
    let destX = null;
    for (let x = 25; x >= 5; x--) {
      if (!inventory[`${x},${toRow},${toLevel}`]) {
        // Kiểm tra xem vị trí này có bị chắn không
        if (!get().isPathBlocked(x, toRow, toLevel, shuttleId, inventory)) {
          destX = x;
          break;
        } else {
          console.log(`[TRANSFER] Position (${x}, ${toRow}, ${toLevel}) is blocked by intermediate pallets`);
        }
      }
    }

    if (!destX) {
      get().addLog(`⚠️ Destination ${toRow}/${toLevel} is full or all positions blocked!`, 'error');
      return;
    }

    get().addLog(`🔄 Transfer: Rail ${actualFromRow}/L${fromLevel} → Rail ${toRow}/L${toLevel}`, 'start');

    const sequence = [];
    const currentLevel = shuttle.gridPosition.level || 1;
    const currentX = shuttle.gridPosition.x;
    const currentY = shuttle.gridPosition.y;

    console.log(`[TRANSFER] Source: (${sourceX}, ${actualFromRow}, ${fromLevel}) → Dest: (${destX}, ${toRow}, ${toLevel})`);

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

    console.log(`[TRANSFER] Navigating to source pallet at (${sourceX}, ${actualFromRow})`);

    try {
      const sourceNavSequence = get().generateEscapeTravelApproach(
        fromX, fromY,
        sourceX, actualFromRow,
        shuttleId
      );
      sequence.push(...sourceNavSequence);
    } catch (error) {
      get().addLog(`❌ Navigation error: ${error.message}`, 'error');
      return;
    }

    // === STAGE 3: PICK PALLET ===
    console.log(`[TRANSFER] Picking pallet from (${sourceX}, ${actualFromRow}, ${fromLevel})`);

    sequence.push({ type: 'SHUTTLE_LIFT', lift: true, shuttleId });
    sequence.push({ type: 'WAIT', duration: 500, message: 'Picking pallet...' });
    sequence.push({ type: 'REMOVE_INVENTORY', x: sourceX, y: actualFromRow, level: fromLevel, shuttleId });

    // === STAGE 4: LEVEL CHANGE TO DESTINATION (if needed) ===
    if (fromLevel !== toLevel) {
      console.log(`[TRANSFER] Level change: ${fromLevel} → ${toLevel}`);

      // Navigate back to lift with pallet
      try {
        const liftReturnSequence = get().generateEscapeTravelApproach(
          sourceX, actualFromRow,
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

          case 'REMOVE_CONVEYOR_PALLET':
            // Remove pallet from conveyor (despawn at exit)
            get().removeConveyorPallet(step.id);
            get().addLog(`📤 Pallet ${step.id} exported`, 'success');
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
  },

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
