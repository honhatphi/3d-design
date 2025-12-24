# PLAN ĐIỀU CHỈNH LOGIC DI CHUYỂN SHUTTLE

> **Mục tiêu**: Refactor hệ thống di chuyển shuttle để tuân thủ 100% logic trong `logic.md`
> **Ngày bắt đầu**: 25/12/2025
> **Trạng thái**: 🟡 Planning

---

## 📊 TỔNG QUAN

### Vấn Đề Cần Giải Quyết

- [ ] **P1**: Phạm vi Shuttle 1 sai (đang là 1-12, phải là 1-11)
- [ ] **P2**: Logic di chuyển không tuân thủ 3 pha ESCAPE → TRAVEL → APPROACH
- [ ] **P3**: Không có validation cho mode constraints (AISLE/RAIL)
- [ ] **P4**: Sử dụng pathfinder tự do thay vì manual routing
- [ ] **P5**: Logic xử lý level change chưa chuẩn theo logic.md

### Các File Cần Thay Đổi

| File                          | Mức Độ       | Trạng Thái |
| ----------------------------- | ------------ | ---------- |
| `src/store/warehouseStore.js` | ⭐⭐⭐ Major | 🔴 Pending |
| `src/utils/constants.js`      | ⭐ Minor     | 🔴 Pending |

---

## 🎯 ROADMAP IMPLEMENTATION

### PHASE 1: Core Movement Logic ⭐⭐⭐ (Highest Priority)

#### Task 1.1: Sửa Phạm Vi Shuttle 1

- **File**: `src/store/warehouseStore.js`
- **Changes**:
  - Đổi `maxRail: 12` → `maxRail: 11` (line ~36)
  - Update comment: "Lower Block (Rows 1-12)" → "Lower Block (Rows 1-11)"
- **Estimate**: 5 mins
- **Status**: ✅ Complete
- **Priority**: P0 - Critical

#### Task 1.2: Tạo Helper - validateModeConstraint()

- **File**: `src/store/warehouseStore.js`
- **Purpose**: Kiểm tra constraint di chuyển theo mode
- **Logic**:
  ```javascript
  validateModeConstraint: (mode, fromX, fromY, toX, toY) => {
    if (mode === 'AISLE' && fromY !== toY) {
      throw new Error('AISLE mode: Cannot change Y (Rail)');
    }
    if (mode === 'RAIL' && fromX !== toX) {
      throw new Error('RAIL mode: Cannot change X (Depth)');
    }
    return true;
  };
  ```
- **Estimate**: 15 mins
- **Status**: ✅ Complete
- **Priority**: P0 - Critical

#### Task 1.3: Refactor generateMovementSequence() → generateEscapeTravelApproach()

- **File**: `src/store/warehouseStore.js`
- **Purpose**: Implement đúng 3 pha theo logic.md
- **Changes**:
  - Rename function: `generateMovementSequence` → `generateEscapeTravelApproach`
  - Refactor logic theo 3 phases rõ ràng:
    1. **ESCAPE**: Nếu không ở highway và cần đổi X hoặc Y → ra highway (chỉ đổi Y)
    2. **TRAVEL**: Di chuyển X trên highway (chỉ đổi X)
    3. **APPROACH**: Vào đích (chỉ đổi Y)
  - Thêm phase labels vào output
  - Log chi tiết từng phase
- **Test Cases**:
  - ✅ Cùng depth, khác rail: Chỉ APPROACH
  - ✅ Khác depth, cùng rail: ESCAPE → TRAVEL → APPROACH
  - ✅ Khác depth, khác rail: Full 3 phases
  - ✅ Đã ở highway, khác depth: TRAVEL → APPROACH
- **Estimate**: 45 mins
- **Status**: ✅ Complete
- **Priority**: P0 - Critical

---

### PHASE 2: Lift Integration Logic ⭐⭐

#### Task 2.1: Tạo Helper - navigateToLift()

- **File**: `src/store/warehouseStore.js`
- **Purpose**: Generate sequence từ vị trí hiện tại đến Lift
- **Input**: `shuttleId, currentX, currentY`
- **Output**: Array of movement steps
- **Logic**:

  ```javascript
  navigateToLift: (shuttleId, currentX, currentY) => {
    const shuttle = get().shuttles[shuttleId];
    const liftX = 2;
    const liftY = shuttle.assignedLift === 'LIFT_UPPER' ? 19 : 5;

    return get().generateEscapeTravelApproach(currentX, currentY, liftX, liftY, shuttleId);
  };
  ```

- **Estimate**: 20 mins
- **Status**: 🔴 Todo
- **Priority**: P1 - High

#### Task 2.2: Tạo Helper - navigateFromLift()

- **File**: `src/store/warehouseStore.js`
- **Purpose**: Generate sequence từ Lift đến target
- **Input**: `shuttleId, targetX, targetY`
- **Output**: Array of movement steps
- **Logic**: Tương tự navigateToLift nhưng ngược lại
- **Estimate**: 20 mins
- **Status**: ✅ Complete
- **Priority**: P1 - High

---

### PHASE 3: Task Logic Refactor ⭐⭐⭐

#### Task 3.1: Refactor processOutboundRequest()

- **File**: `src/store/warehouseStore.js`
- **Purpose**: Xuất hàng theo logic.md
- **New Logic Flow**:

  ```
  1. Check if level change needed
     YES → Stage 1: Navigate to Lift (current level)
           Stage 2: Use lift to change level
           Stage 3: Navigate from Lift to Pallet
     NO  → Direct: Navigate to Pallet

  2. Pick pallet (SHUTTLE_LIFT + REMOVE_INVENTORY)

  3. Check if level change needed for return
     YES → Stage 1: Navigate to Lift (current level)
           Stage 2: Use lift to level 1
           Stage 3: Navigate from Lift to output
     NO  → Direct: Navigate to Lift output

  4. Drop pallet + Return to highway
  ```

- **Changes**:
  - Loại bỏ tất cả `NAVIGATE_TO` commands
  - Dùng `generateEscapeTravelApproach()` và lift helpers
  - Thêm logging chi tiết cho từng stage
- **Test Scenario**:
  - Shuttle at (25, 4, 1) → Pallet at (5, 6, 1) - Same level
  - Shuttle at (4, 4, 1) → Pallet at (15, 10, 3) - Different level
- **Estimate**: 90 mins
- **Status**: ✅ Complete
- **Priority**: P0 - Critical

#### Task 3.2: Refactor processInboundRequest()

- **File**: `src/store/warehouseStore.js`
- **Purpose**: Nhập hàng theo logic.md
- **New Logic Flow**:
  ```
  1. Retrieve shuttle to Level 1 Lift if needed
  2. Spawn pallet from conveyor
  3. Wait for pallet at Lift
  4. Pick pallet from Lift
  5. Navigate to target location (with level change if needed)
  6. Drop pallet
  7. Return to highway
  ```
- **Changes**: Tương tự processOutboundRequest
- **Estimate**: 90 mins
- **Status**: ✅ Complete
- **Priority**: P1 - High

#### Task 3.3: Refactor processTransferRequest()

- **File**: `src/store/warehouseStore.js`
- **Purpose**: Chuyển hàng giữa 2 vị trí
- **New Logic**: Chia thành 2 sub-tasks
  1. Outbound from source (pick)
  2. Inbound to destination (drop)
- **Estimate**: 60 mins
- **Status**: ✅ Complete
- **Priority**: P2 - Medium

---

### PHASE 4: Sequence Executor Update ⭐

#### Task 4.1: Update SHUTTLE_MOVE Handler

- **File**: `src/store/warehouseStore.js` (executeSequence function)
- **Changes**:
  - Thêm validation trước khi move: `validateModeConstraint()`
  - Thêm logging rõ ràng: mode, from, to
  - Throw error nếu vi phạm constraint
- **Estimate**: 30 mins
- **Status**: ✅ Complete
- **Priority**: P1 - High

#### Task 4.2: Remove NAVIGATE_TO Case

- **File**: `src/store/warehouseStore.js` (executeSequence function)
- **Changes**:
  - Xóa toàn bộ case 'NAVIGATE_TO'
  - Xóa logic check deep rack position trong NAVIGATE_TO
  - Update error handling
- **Estimate**: 15 mins
- **Status**: ✅ Complete
- **Priority**: P2 - Medium

---

### PHASE 5: Constants & Cleanup ⭐

#### Task 5.1: Add Zone Constants

- **File**: `src/utils/constants.js`
- **Changes**:

  ```javascript
  export const SHUTTLE_ZONES = {
    SHUTTLE_1: {
      minRail: 1,
      maxRail: 11,
      highway: 4,
      liftX: 2,
      liftY: 5,
      assignedLift: 'LIFT_LOWER',
    },
    SHUTTLE_2: {
      minRail: 13,
      maxRail: 23,
      highway: 20,
      liftX: 2,
      liftY: 19,
      assignedLift: 'LIFT_UPPER',
    },
  };

  export const HIGHWAYS = {
    HORIZONTAL: [4, 12, 20],
    VERTICAL: 4,
  };
  ```

- **Estimate**: 10 mins
- **Status**: ✅ Complete
- **Priority**: P2 - Medium

#### Task 5.2: Update Shuttle State to Use Constants

- **File**: `src/store/warehouseStore.js`
- **Changes**: Import và sử dụng SHUTTLE_ZONES thay vì hardcode
- **Estimate**: 15 mins
- **Status**: ✅ Complete
- **Priority**: P2 - Medium

#### Task 5.3: Remove Old Helpers

- **File**: `src/store/warehouseStore.js`
- **Functions to remove**:
  - `navigateToSmart()` - Không còn dùng
  - `findRackExitPoint()` - Thay bằng generateEscapeTravelApproach
- **Estimate**: 10 mins
- **Status**: ✅ Complete
- **Priority**: P3 - Low

---

### PHASE 6: Testing & Documentation 🧪

#### Task 6.1: Test Scenario 1 - Same Level Movement

- **Scenario**: Shuttle at (20, 8, 1) → Target (15, 10, 1)
- **Expected**:
  ```
  ESCAPE:   (20,8) → (20,4) [RAIL]
  TRAVEL:   (20,4) → (15,4) [AISLE]
  APPROACH: (15,4) → (15,10) [RAIL]
  ```
- **Status**: 🔴 Todo

#### Task 6.2: Test Scenario 2 - Multi-Level Movement (From logic.md)

- **Scenario**: Shuttle at (20, 8, 1) → Target (15, 10, 3)
- **Expected**:

  ```
  Stage 1 (To Lift at Z=1):
    ESCAPE:   (20,8) → (20,4) [RAIL]
    TRAVEL:   (20,4) → (2,4) [AISLE]
    APPROACH: (2,4) → (2,5) [RAIL]

  Stage 2 (Lift): Z=1 → Z=3

  Stage 3 (From Lift to Target at Z=3):
    ESCAPE:   (2,5) → (2,4) [RAIL]
    TRAVEL:   (2,4) → (15,4) [AISLE]
    APPROACH: (15,4) → (15,10) [RAIL]
  ```

- **Status**: 🔴 Todo

#### Task 6.3: Update Documentation

- **Files**:
  - Update comments trong `warehouseStore.js`
  - Thêm JSDoc cho các helper functions
- **Status**: 🔴 Todo

---

## 📈 PROGRESS TRACKING

### Overall Progress: 13/23 Tasks (57%)

| Phase                        | Tasks | Completed | Progress |
| ---------------------------- | ----- | --------- | -------- |
| Phase 1: Core Movement       | 3     | 3         | ✅ 100%  |
| Phase 2: Lift Integration    | 2     | 2         | ✅ 100%  |
| Phase 3: Task Logic          | 3     | 0         | 🔴 0%    |
| Phase 4: Executor Update     | 2     | 0         | 🔴 0%    |
| Phase 5: Constants & Cleanup | 3     | 0         | 🔴 0%    |
| Phase 6: Testing             | 3     | 0         | 🔴 0%    |

### Time Estimate

- **Total Estimated**: ~7.5 hours
- **Time Spent**: 0 hours
- **Remaining**: ~7.5 hours

---

## 🎯 NEXT STEPS

### Immediate Actions (Bắt đầu ngay)

1. ✅ Task 1.1: Fix Shuttle 1 range (5 mins)
2. ✅ Task 1.2: Create validateModeConstraint helper (15 mins)
3. ✅ Task 1.3: Refactor movement sequence generator (45 mins)

### After Phase 1 Complete

- Review và test movement generation
- Proceed to Phase 2 (Lift integration)

---

## 📝 NOTES & DECISIONS

### Design Decisions

- **Decision 1**: Không dùng pathfinder tự do nữa
  - **Reason**: Pathfinder không đảm bảo tuân thủ mode constraints
  - **Impact**: Phải manual generate toàn bộ movement sequence

- **Decision 2**: Chia level change thành stages riêng biệt
  - **Reason**: Dễ debug, dễ theo dõi, tuân thủ logic.md
  - **Impact**: Code dài hơn nhưng rõ ràng hơn

### Risk Assessment

- **Risk 1**: Breaking existing functionality khi refactor
  - **Mitigation**: Test từng phase trước khi chuyển sang phase tiếp theo

- **Risk 2**: Performance issue với manual routing
  - **Mitigation**: Cache movement sequences nếu cần

---

## ✅ COMPLETION CHECKLIST

Trước khi đánh dấu hoàn thành, đảm bảo:

- [ ] All tasks marked as ✅ Complete
- [ ] All test scenarios passed
- [ ] No console errors during execution
- [ ] Shuttle không đi xuyên tường
- [ ] Movement logs rõ ràng (ESCAPE/TRAVEL/APPROACH)
- [ ] Code được comment đầy đủ
- [ ] Constants được extract properly
- [ ] Old unused code được remove

---

**Last Updated**: 25/12/2025
**Next Review**: After Phase 1 completion
