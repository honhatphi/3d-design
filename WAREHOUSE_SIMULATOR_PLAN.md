# 🏭 Trackify - 3D Warehouse Simulator (Customer Demo)

## 📋 Executive Summary

**Mục tiêu:** Xây dựng **3D interactive simulator** cho hệ thống ASRS (Automated Storage and Retrieval System) 4-WAY để demo cho khách hàng. Tập trung vào **visualization và tracking real-time** quy trình nhập/xuất/chuyển kho với shuttle animation.

**Quy mô kho:**

- Grid: 25 columns × 23 rows × 4 levels = 2,300 storage cells
- 4 Storage Blocks: A, B, C, D
- 3 Shuttle highways ngang + 1 highway dọc
- 2 Lift systems + 2 Conveyor groups

**Demo Focus:** 3D Visualization + Shuttle Tracking + Multiple Camera Modes

---

## 🎨 Design Approach - REALISTIC INDUSTRIAL LOOK

**Based on Real Equipment Photos** → See [DESIGN_REFERENCES.md](DESIGN_REFERENCES.md)

### Visual Style:

- ✅ **Realistic:** Dựa trên hình ảnh thực tế của kệ và shuttle
- ✅ **Industrial:** Blue & Orange color scheme từ photos
- ✅ **Professional:** Metal textures, proper lighting, shadows
- ❌ **NO cartoon colors** - Chỉ dùng màu thực tế

### Color Palette (From Real Equipment):

```
Rack Structure:
- Columns: Dark Blue #1E40AF (steel frame)
- Beams: Bright Orange #F97316 (high visibility)
- Metal: Gray #71717A (steel finish)

Shuttle Vehicle:
- Body: Orange #F97316 (main chassis)
- Panels: Blue #3B82F6 (branding)
- Rollers: Cyan #06B6D4 (top surface)
- Wheels: Black #1F2937

Environment:
- Floor: Concrete Gray #E5E7EB
- Safety Lines: Yellow #FCD34D
```

### Development Process - INCREMENTAL WITH REVIEW:

```
Build Component → Preview → Review → Approve → Next Component
      ↓              ↓         ↓         ↓          ↓
   Isolated      Screenshot  Your     Continue   Integrate
   Test Scene                Feedback   or Revise
```

**You will review each component before I continue!** 👀

---

## 🎯 Core Features & Requirements

### 1. **3D WAREHOUSE VISUALIZATION** (Ưu tiên cao nhất)

#### 1.1 3D Scene Rendering

- [ ] **Full 3D Warehouse Model**
  - Render 25×23×4 grid với realistic scale
  - 4 storage blocks với distinct colors/materials
  - Shuttle highways (3 horizontal + 1 vertical) với highlight
  - Lifts và conveyors với 3D models
  - Ground floor, walls, ceiling (warehouse environment)
  - Lighting: Ambient + Directional + Point lights

- [ ] **Storage Racks Visualization**
  - 3D rack structures với metal/industrial materials
  - Individual cells visible và numbered (optional toggle)
  - Empty vs Occupied states (different colors)
  - Pallet 3D models khi có hàng
  - Semi-transparent material cho empty cells

- [ ] **Special Zones**
  - Glass rooms (transparent boxes) cho machine rooms
  - Conveyor belts với animated textures
  - Lift platforms với moving parts
  - Entry/exit gates

#### 1.2 Camera System & View Modes (🎥 Critical for Demo)

**A. Pre-defined Camera Angles**

- [ ] **Overview Mode (Default)**
  - Bird's eye view toàn bộ warehouse
  - Angle: 45° isometric hoặc adjustable
  - Thấy được cả 4 blocks cùng lúc
  - Orbit controls (rotate, pan, zoom)

- [ ] **Block Focus Mode**
  - Click vào block A/B/C/D → Camera zoom + center vào block đó
  - Làm mờ (fade out 30-50% opacity) các blocks khác
  - Highlight block được chọn

- [ ] **Level Focus Mode**
  - Chọn tầng 1/2/3/4 → Slice view
  - Ẩn hoặc ghost (50% transparent) các tầng khác
  - Camera position điều chỉnh để nhìn rõ tầng selected

**B. Follow/Track Camera Modes**

- [ ] **Follow Shuttle Mode** ⭐ (Killer Feature)
  - Click vào shuttle → Camera tự động bám theo
  - Smooth camera transition (2-3s)
  - Maintain optimal distance & angle
  - Option: Third-person view (behind shuttle) hoặc Side view
  - Auto-rotate khi shuttle đổi hướng

- [ ] **Follow Pallet Mode**
  - Click vào pallet → Track toàn bộ journey
  - Từ conveyor → lift → shuttle → cell destination
  - Camera smooth follow từng bước
  - Highlight path đang đi (glowing line)

- [ ] **Path Preview Mode**
  - Khi trigger operation → Show planned path trước
  - Animated dotted line từ origin → destination
  - Camera fly-through path (like cinematic preview)

**C. Visual Focus & Fade Effects**

- [ ] **Fade Non-relevant Objects**
  - Khi follow shuttle/pallet → Fade các racks không liên quan
  - Giữ opacity 100% cho: Active equipment, Current path, Target locations
  - Fade 20-30% cho: Other racks, Other shuttles, Background

- [ ] **Highlight Active Elements**
  - Glowing outline cho selected shuttle
  - Glowing path line cho route đang đi
  - Pulsing light tại target cell
  - Color-coded highlights: Green (start), Blue (path), Red (destination)

- [ ] **Depth of Field (Optional)**
  - Blur background khi focus vào specific area
  - Cinematic effect cho presentation

#### 1.3 Interactive Controls

- [ ] Mouse controls:
  - Left drag: Rotate camera (orbit)
  - Right drag: Pan
  - Scroll: Zoom in/out
  - Double-click object: Focus/Select
- [ ] Keyboard shortcuts:
  - 1-4: Switch levels
  - A/B/C/D: Focus blocks
  - Space: Toggle animation play/pause
  - R: Reset camera
  - F: Follow mode toggle

### 2. **SHUTTLE & EQUIPMENT TRACKING** (Real-time Animation)

#### 2.1 Shuttle Vehicles (⭐ Main Focus)

- [ ] **3D Shuttle Models**
  - Realistic 3D model (box shape với details)
  - Different models cho 4 shuttles (or color-coded)
  - Animated wheels/parts khi di chuyển
  - Direction indicators (arrow, lights)

- [ ] **Smooth Movement Animation**
  - Physics-based movement (acceleration, deceleration)
  - Speed variations: Empty (fast) vs Loaded (slow)
  - Rotation khi đổi hướng
  - Tilt animation khi pick/drop pallet

- [ ] **Status Visualization**
  - 🟢 **Idle:** Static, gentle pulsing glow
  - 🔵 **Moving Empty:** Fast, blue trail effect
  - 🟠 **Moving Loaded:** Slower, orange glow, pallet visible
  - 🔴 **Error:** Red flashing, stop animation
  - ⚙️ **Loading/Unloading:** Lift mechanism animation

- [ ] **Shuttle Info HUD**
  - Floating label above shuttle (toggle on/off)
  - Show: ID, Status, Speed, Current task
  - Follow shuttle khi di chuyển
  - Click shuttle → Show detailed panel (sidebar)

#### 2.2 Lifts & Conveyors

- [ ] **Lift Animation**
  - Platform moving up/down giữa các tầng
  - Pallet on platform visible
  - Speed: realistic timing
  - Door open/close animation (optional)

- [ ] **Conveyor Animation**
  - Belt texture scrolling
  - Pallets moving along conveyor path
  - Entry/exit gates animation
  - Queue visualization (multiple pallets)

#### 2.3 Path Visualization

- [ ] **Route Lines**
  - Animated glowing line từ start → end
  - Color-coded: Green (planned), Blue (in-progress), Gray (completed)
  - Dotted line cho planned path
  - Solid line cho active path

- [ ] **Waypoint Markers**
  - Show key points: Lift pickup, Transfer points, Destination
  - Numbered waypoints (1, 2, 3...)
  - Pulsing animation at current waypoint

### 3. **OPERATION SIMULATION** (Demo Scenarios)

#### 3.1 Manual Trigger Operations

- [ ] **Inbound Operation**
  - Click "New Inbound" button
  - Select entry conveyor (2 options: Lower/Upper)
  - System auto-calculate optimal cell
  - Show planned path visualization
  - Click "Execute" → Trigger animation
  - **Flow:** Conveyor → Lift → Shuttle Highway → Target Cell

- [ ] **Outbound Operation**
  - Click on occupied cell (pallet)
  - Click "Retrieve" button
  - System plan path: Cell → Highway → Lift → Conveyor
  - Execute with animation

- [ ] **Transfer Operation**
  - Click source cell → Click target cell
  - System route qua highways
  - Shuttle animation: Pick → Move → Place

#### 3.2 Demo Scenarios (Pre-programmed)

- [ ] **Scenario 1: Simple Inbound**
  - 1 pallet, Lower conveyor → Block C, Level 2
  - Duration: ~30s

- [ ] **Scenario 2: Simple Outbound**
  - Retrieve from Block B → Upper conveyor

- [ ] **Scenario 3: Complex Transfer**
  - Move pallet from Block D → Block A
  - Cross multiple highways, show routing

- [ ] **Scenario 4: Multi-Operation**
  - 2 shuttles working parallel
  - 1 inbound + 1 outbound simultaneously
  - Show coordination

- [ ] **Scenario 5: Full Demo Sequence** (Auto-play)
  - 5-minute demo showing all operations
  - Camera auto-switch giữa các view modes
  - Narration text/subtitles (optional)

#### 3.3 Simulation Controls

- [ ] Control panel:
  - Play / Pause / Stop / Reset
  - Speed: 0.5x, 1x, 2x, 5x, 10x
  - Skip to next operation
  - Loop scenario
- [ ] Timeline scrubber (optional):
  - Drag to any point in simulation
  - See all operations on timeline
- [ ] Status indicators:
  - 🟢 Idle (đang chờ)
  - 🔵 Moving empty (di chuyển không tải)
  - 🟠 Moving loaded (di chuyển có pallet)
  - 🔴 Error/Maintenance
  - ⚪ Offline
- [ ] Shuttle info panel:
  - ID, current position (x, y, z)
  - Speed, direction
  - Current task
  - Battery level (nếu có)

#### 2.2 Lifts & Conveyors

- [ ] Lift status: Moving up/down, idle, position
- [ ] Conveyor animation: pallet flow direction
- [ ] Queue visualization: số pallet đang chờ

### 3. **SIMULATION CONTROLS** (Mô phỏng quy trình)

#### 3.1 Manual Operations

- [ ] **Inbound (Nhập kho)**
  - Click "New Inbound" → Chọn conveyor entry point
  - Tự động tìm cell trống tối ưu
  - Hiển thị planned path (lift → shuttle → cell)
  - Execute → Animation thực hiện

- [ ] **Outbound (Xuất kho)**
  - Click vào pallet đang trong kho
  - Click "Retrieve" → Tự động plan path
  - Animation lấy pallet ra conveyor

- [ ] **Transfer (Chuyển kho)**
  - Drag & drop pallet từ cell này sang cell khác
  - Hoặc: Click pallet → Click target cell
  - System tự động route qua shuttle highways

#### 3.2 Auto Simulation Mode

- [ ] **Scenario Generator**
  - Random inbound/outbound orders
  - Tốc độ simulation: 1x, 2x, 5x, 10x
  - Pause/Resume/Stop controls

- [ ] **Task Queue Visualization**
  - Danh sách tasks đang chờ execution
  - Priority levels
  - Estimated completion time

### 4. **UI/UX FOR DEMO** (Simple & Professional)

#### 4.1 Main Interface Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] Trackify 3D Simulator          [🌙] [Camera] [Help]  │
└──────────────────────────────────────────────────────────────┘
┌────────┬───────────────────────────────────────────┬─────────┐
│        │                                           │         │
│ CTRL   │          3D WAREHOUSE VIEW                │  INFO   │
│ PANEL  │                                           │  PANEL  │
│        │     [Interactive 3D Scene]                │         │
│ Demo   │                                           │ Active: │
│ Scenes │     Click & Interact with objects         │ Shuttle │
│        │                                           │  S1     │
│ ▶ In1  │     Camera: [Overview] [Follow]           │         │
│ □ Out1 │                                           │ Status: │
│ □ Tra1 │     Zoom: [-] [Reset] [+]                 │ Moving  │
│ □ Mult │                                           │         │
│ □ Full │     [Block A] [B] [C] [D] [All]          │ Speed:  │
│        │     [Level 1] [2] [3] [4] [All]           │ 120m/m  │
│ Speed  │                                           │         │
│ [1x]▼  │                                           │ Path:   │
│        │                                           │ → Cell  │
│ [Play] │                                           │  (12,5) │
│ [Pause]│                                           │         │
└────────┴───────────────────────────────────────────┴─────────┘
┌──────────────────────────────────────────────────────────────┐
│ 📊 Shuttles: 2 Active | Capacity: 245/2300 | Time: 00:23    │
└──────────────────────────────────────────────────────────────┘
```

#### 4.2 Camera Control Panel (Floating/Docked)

- [ ] View mode buttons:
  - 🏠 **Overview** - Default bird's eye
  - 🎯 **Follow Shuttle** - Track active shuttle
  - 📦 **Follow Pallet** - Track pallet journey
  - 🎬 **Cinematic** - Auto camera angles
  - 🎮 **Free Cam** - Manual control

- [ ] Quick filters:
  - [ ] Fade Other Blocks (opacity slider 0-100%)
  - [ ] Show/Hide Pallets
  - [ ] Show/Hide Cell Numbers
  - [ ] Grid Lines On/Off
  - [ ] Path Lines On/Off

#### 4.3 Demo Scenario Selector (Left Panel)

- Pre-built demo buttons:
  - ▶️ **Demo 1:** Simple Inbound (30s)
  - ▶️ **Demo 2:** Simple Outbound (25s)
  - ▶️ **Demo 3:** Cross-Block Transfer (45s)
  - ▶️ **Demo 4:** Parallel Operations (1m)
  - ▶️ **Demo 5:** Full Sequence (5m)

- One-click play
- Auto camera switching
- Voiceover text (optional)

#### 4.4 Info Panel (Right Sidebar - Collapsible)

- **When hovering objects:**
  - Cell info: ID, Status, Block, Level
  - Shuttle info: ID, Status, Speed, Task
  - Pallet info: ID, Weight, Destination

- **When following shuttle:**
  - Real-time metrics
  - Current position (x, y, z)
  - Speed graph
  - Task progress bar

- **Activity Timeline:**
  - Recent operations (last 10)
  - Color-coded by type
  - Click to replay

#### 4.5 Minimal Interactions

- **For customers/viewers:**
  1. Click demo scenario → Auto play
  2. Click shuttle/pallet → Auto follow
  3. Scroll to zoom
  4. Drag to rotate (optional)

- **No complex menus**
- **No manual inputs** (coordinates, etc.)
- **Everything is visual & clickable**

#### 4.6 Status Bar (Bottom)

```
📊 Shuttles: 2 Active | 📦 Pallets: 245/2300 | ⚡ Operations: 12 | ⏱️ Time: 00:23
```

---

## 🏗️ Technical Architecture (3D Focus)

### Frontend Stack (Current)

```
✅ React 19          - UI framework
✅ Tailwind CSS      - Styling system
✅ Lucide Icons      - Icon library
✅ Vite              - Build tool
```

### 3D Libraries (Required)

```
🔧 Three.js          - Core 3D engine
🔧 @react-three/fiber - React renderer for Three.js
🔧 @react-three/drei  - Helper components (OrbitControls, etc.)
🔧 @react-three/postprocessing - Visual effects (bloom, DOF)
```

### Additional Libraries

```
🔧 Zustand           - Global state management
🔧 @use-gesture/react - Enhanced mouse/touch interactions
🔧 gsap              - Advanced animations & tweening
🔧 leva              - Debug GUI (development only)
```

### 3D Scene Architecture

```javascript
<Canvas camera={{ position: [50, 40, 50], fov: 50 }}>
  {/* Lighting */}
  <ambientLight intensity={0.4} />
  <directionalLight position={[50, 50, 25]} intensity={0.8} />
  <pointLight position={[0, 20, 0]} intensity={0.5} />
  {/* Environment */}
  <Environment preset="warehouse" />
  <Grid />
  <Floor />
  <Ceiling />
  {/* Warehouse Structure */}
  <StorageBlocks /> {/* 4 blocks với racks */}
  <ShuttleHighways /> {/* 3H + 1V highways */}
  <SpecialZones /> {/* Rooms, lifts, conveyors */}
  {/* Equipment (Animated) */}
  <Shuttles /> {/* 4 shuttles với animations */}
  <Lifts /> {/* 2 lifts */}
  <Conveyors /> {/* Belt animations */}
  <Pallets /> {/* Dynamic pallets */}
  {/* Visual Effects */}
  <PathLines /> {/* Glowing route lines */}
  <Highlights /> {/* Selected object outlines */}
  <Labels /> {/* Floating text labels */}
  {/* Camera System */}
  <CameraController mode={cameraMode} target={focusTarget} />
  <OrbitControls />
  {/* Post-processing */}
  <EffectComposer>
    <Bloom intensity={0.5} />
    <DepthOfField focusDistance={0.1} />
  </EffectComposer>
</Canvas>
```

### State Management Structure

```javascript
// Zustand store
const useWarehouseStore = create((set) => ({
  // Warehouse Data
  warehouse: {
    grid: Grid[25][23][4],
    blocks: ['A', 'B', 'C', 'D'],
    cells: CellState[]
  },

  // Equipment State
  shuttles: [
    { id: 'S1', position: [x, y, z], status: 'moving', ... },
    { id: 'S2', position: [x, y, z], status: 'idle', ... }
  ],
  lifts: [...],
  conveyors: [...],

  // Simulation Control
  simulation: {
    isRunning: false,
    speed: 1.0,
    currentScenario: null,
    operations: Operation[]
  },

  // Camera Control
  camera: {
    mode: 'overview', // 'overview' | 'follow' | 'free' | 'cinematic'
    target: null,     // shuttle ID or pallet ID to follow
    fadeNonRelevant: false
  },

  // UI State
  ui: {
    selectedObject: null,
    hoveredObject: null,
    showLabels: true,
    showGrid: true,
    showPaths: true
  },

  // Actions
  setShuttlePosition: (id, pos) => ...,
  startSimulation: (scenario) => ...,
  setCameraMode: (mode, target) => ...,
  toggleFade: () => ...
}));
```

### Component Structure

```
src/
├── components/
│   ├── 3D/
│   │   ├── Scene.jsx               # Main 3D canvas wrapper
│   │   ├── Environment/
│   │   │   ├── Floor.jsx
│   │   │   ├── Ceiling.jsx
│   │   │   ├── Lighting.jsx
│   │   │   └── Grid.jsx
│   │   ├── Warehouse/
│   │   │   ├── StorageBlock.jsx    # One block component
│   │   │   ├── RackStructure.jsx
│   │   │   ├── Cell.jsx
│   │   │   └── Pallet.jsx
│   │   ├── Equipment/
│   │   │   ├── Shuttle.jsx         # Animated shuttle model
│   │   │   ├── Lift.jsx
│   │   │   ├── Conveyor.jsx
│   │   │   └── PathLine.jsx
│   │   ├── Effects/
│   │   │   ├── FadeEffect.jsx      # Fade non-relevant objects
│   │   │   ├── Highlight.jsx       # Selection outline
│   │   │   ├── GlowingPath.jsx
│   │   │   └── FloatingLabel.jsx
│   │   └── Camera/
│   │       ├── CameraController.jsx # Smart camera system
│   │       ├── FollowCam.jsx
│   │       └── CinematicCam.jsx
│   ├── UI/
│   │   ├── ControlPanel.jsx        # Left: Demo scenarios
│   │   ├── InfoPanel.jsx           # Right: Object info
│   │   ├── CameraPanel.jsx         # Camera mode switcher
│   │   ├── StatusBar.jsx           # Bottom metrics
│   │   └── SimulationControls.jsx  # Play/Pause/Speed
│   └── Header/
│       └── GlobalHeader.jsx        # Existing header
├── hooks/
│   ├── useSimulation.js            # Simulation logic
│   ├── useShuttleAnimation.js      # Shuttle movement
│   ├── useCameraFollow.js          # Follow camera
│   └── usePathfinding.js           # A* pathfinding
├── store/
│   └── warehouseStore.js           # Zustand store
├── data/
│   ├── warehouseLayout.json        # Your existing JSON
│   └── demoScenarios.js            # Pre-built scenarios
└── utils/
    ├── coordinateSystem.js         # Grid calculations
    ├── pathfinding.js              # Route planning
    └── animationHelpers.js         # Animation utilities
```

    activeOperations: Operation[]

},
metrics: {
occupancy: number,
throughput: number,
alerts: Alert[]
}
}

````

---

---

## 📅 Development Roadmap (3D-First Approach)

### **PHASE 1: 3D FOUNDATION** (Week 1-2) ⭐
**Goal:** Setup 3D scene và hiển thị warehouse cơ bản

**Week 1:**
- [ ] Install Three.js ecosystem
  ```bash
  npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
````

- [ ] Setup basic 3D canvas với lighting
- [ ] Create Grid component (25×23 ground grid)
- [ ] Build Floor, Ceiling, Walls
- [ ] Parse warehouse_layout.json data

**Week 2:**

- [ ] Create StorageBlock component (render 4 blocks A, B, C, D)
- [ ] Build RackStructure với cells
- [ ] Add Highway lanes visualization
- [ ] Place Lifts & Conveyors (static)
- [ ] Basic OrbitControls camera

**Deliverable:** ✅ Static 3D warehouse model với 4 blocks visible

---

### **PHASE 2: CAMERA SYSTEM & VIEWS** (Week 3) 🎥

**Goal:** Implement multiple camera modes

- [ ] **CameraController component:**
  - Overview mode (default bird's eye)
  - Free camera mode (orbit controls)
  - Smooth camera transitions

- [ ] **View filters:**
  - Block focus (A/B/C/D buttons)
  - Level selector (1-4 with fade effect)
  - Fade/Ghost non-selected blocks (opacity control)

- [ ] **UI Integration:**
  - Camera mode switcher panel
  - Block/Level quick buttons
  - Opacity sliders
  - Reset camera button

**Deliverable:** ✅ Multiple view modes working với smooth transitions

---

### **PHASE 3: SHUTTLE MODELS & ANIMATION** (Week 4-5) 🚗

**Goal:** Shuttle 3D models và movement system

**Week 4:**

- [ ] Create Shuttle 3D model (simple box → detailed)
- [ ] Implement shuttle positioning system
- [ ] Add shuttle status colors/materials
- [ ] Basic linear movement animation (A → B)
- [ ] Direction indicators (arrows, lights)

**Week 5:**

- [ ] Smooth animation với GSAP/React Spring
- [ ] Acceleration & deceleration
- [ ] Rotation khi đổi hướng
- [ ] Pick/drop pallet animation (tilt effect)
- [ ] Trail effect cho moving shuttles
- [ ] Floating label above shuttles

**Deliverable:** ✅ Shuttles có thể di chuyển smooth trên highways

---

### **PHASE 4: FOLLOW CAMERA** (Week 6) ⭐⭐

**Goal:** Camera tự động bám theo shuttle/pallet

- [ ] **Follow Shuttle Mode:**
  - Click shuttle → Camera lock on
  - Smooth follow với offset
  - Auto-rotate khi shuttle đổi hướng
  - Third-person / Side view options

- [ ] **Follow Pallet Mode:**
  - Track pallet từ conveyor → cell
  - Camera follow toàn bộ journey

- [ ] **Fade Effect khi Follow:**
  - Fade non-relevant racks (20-30%)
  - Keep active path 100% visible
  - Highlight target cell

**Deliverable:** ✅ Killer feature - Follow mode hoạt động smooth

---

### **PHASE 5: SIMULATION ENGINE** (Week 7-8) ⚙️

**Goal:** Logic mô phỏng operations

**Week 7:**

- [ ] Zustand store setup
- [ ] Pathfinding algorithm (A\* for highways)
- [ ] Task queue system
- [ ] Basic operation logic:
  - Inbound: Conveyor → Lift → Shuttle → Cell
  - Outbound: Cell → Shuttle → Lift → Conveyor
  - Transfer: Cell A → Shuttle → Cell B

**Week 8:**

- [ ] Lift animation (up/down movement)
- [ ] Conveyor belt animation (texture scrolling)
- [ ] Pallet 3D model
- [ ] Pallet attach/detach to shuttle
- [ ] Sync all animations với simulation state

**Deliverable:** ✅ Complete operation flow working

---

### **PHASE 6: PATH VISUALIZATION** (Week 9) 🛣️

**Goal:** Visual feedback cho routes

- [ ] Glowing path lines (from → to)
- [ ] Animated dotted lines
- [ ] Waypoint markers
- [ ] Path preview mode (cinematic fly-through)
- [ ] Color-coded paths:
  - Green: Planned
  - Blue: In-progress
  - Gray: Completed
- [ ] Pulsing light tại target cell

**Deliverable:** ✅ Path visualization complete với effects

---

### **PHASE 7: DEMO SCENARIOS** (Week 10) 🎬

**Goal:** Pre-built demos cho customer

- [ ] Build 5 demo scenarios:
  1. Simple Inbound (30s)
  2. Simple Outbound (25s)
  3. Cross-block Transfer (45s)
  4. Parallel Operations (1m)
  5. Full Sequence (5m)

- [ ] Demo control panel (left sidebar)
- [ ] One-click play per scenario
- [ ] Auto camera switching logic
- [ ] Pause/Resume/Stop controls
- [ ] Speed control (0.5x → 10x)
- [ ] Subtitles/narration text (optional)

**Deliverable:** ✅ 5 working demo scenarios

---

### **PHASE 8: UI POLISH & EFFECTS** (Week 11-12) ✨

**Goal:** Professional finish cho demo

**Week 11:**

- [ ] Info panel (right sidebar):
  - Hover tooltips
  - Selected object details
  - Real-time metrics
  - Activity timeline

- [ ] Status bar (bottom):
  - Live shuttle count
  - Capacity metrics
  - Operation counter
  - Timer

- [ ] Visual effects:
  - Bloom effect (glowing highlights)
  - Depth of field (optional)
  - Particle effects (optional)
  - Shadow improvements

**Week 12:**

- [ ] Performance optimization:
  - LOD (Level of Detail) cho distant objects
  - Frustum culling
  - Instance rendering cho cells
  - FPS target: 60fps

- [ ] Responsive design (desktop focus)
- [ ] Dark mode refinement
- [ ] Loading screen
- [ ] Error handling
- [ ] Help/Tutorial overlay

**Deliverable:** ✅ Production-ready demo app

---

## 🎯 Timeline Summary

| Phase | Duration   | Focus              | Priority |
| ----- | ---------- | ------------------ | -------- |
| 1     | Week 1-2   | 3D Foundation      | ⭐⭐⭐   |
| 2     | Week 3     | Camera System      | ⭐⭐⭐   |
| 3     | Week 4-5   | Shuttle Animation  | ⭐⭐⭐   |
| 4     | Week 6     | Follow Camera      | ⭐⭐⭐   |
| 5     | Week 7-8   | Simulation Engine  | ⭐⭐     |
| 6     | Week 9     | Path Visualization | ⭐⭐     |
| 7     | Week 10    | Demo Scenarios     | ⭐⭐⭐   |
| 8     | Week 11-12 | Polish & Effects   | ⭐⭐     |

**Total:** ~12 weeks (3 months)

---

## 🎨 Visual Design Specifications (3D)

### Material & Color Palette

```javascript
// Storage Racks
const RACK_COLORS = {
  blockA: '#3B82F6', // Blue-500
  blockB: '#10B981', // Green-500
  blockC: '#F59E0B', // Amber-500
  blockD: '#8B5CF6', // Purple-500
  empty: '#E5E7EB', // Gray-200
  occupied: '#6B7280', // Gray-500
  selected: '#EF4444', // Red-500
  faded: 0.2, // Opacity when faded
};

// Shuttles
const SHUTTLE_STATUS = {
  idle: { color: '#10B981', glow: true }, // Green
  movingEmpty: { color: '#3B82F6', trail: true }, // Blue
  movingLoaded: { color: '#F59E0B', trail: true }, // Orange
  error: { color: '#EF4444', flash: true }, // Red
  loading: { color: '#8B5CF6', pulse: true }, // Purple
};

// Paths
const PATH_COLORS = {
  planned: '#34D399', // Green-400
  inProgress: '#60A5FA', // Blue-400
  completed: '#9CA3AF', // Gray-400
};

// Lighting
const LIGHTS = {
  ambient: { intensity: 0.4, color: '#ffffff' },
  directional: { intensity: 0.8, position: [50, 50, 25] },
  warehouse: { intensity: 0.3, color: '#FCD34D' }, // Yellow tint
};
```

### 3D Model Specifications

```
Shuttle:
  Size: 1.2m (W) × 2.0m (L) × 1.5m (H)
  Material: Metallic with company logo
  Animation: Wheels rotate, tilt for pick/drop

Pallet:
  Size: 1.2m × 1.0m × 0.15m (standard)
  Material: Wood texture

Storage Cell:
  Size: 1.2m × 1.2m × 2.0m (per cell)
  Material: Metal frame, semi-transparent when empty

Highway:
  Width: 2.5m
  Material: Reflective yellow stripe

Lift Platform:
  Size: 2.0m × 2.0m
  Material: Industrial metal grating
  Animation: Smooth vertical movement
```

### Animation Timing

```
Camera transitions: 1.5-2.0s (ease-in-out)
Shuttle movement: 0.3-0.8s per grid cell
Lift movement: 2.0s per level
Conveyor: Constant 0.5m/s
Path line animation: 1.0s (loop)
Fade effect: 0.3s
Highlight pulse: 2.0s (loop)
```

---

## ⚙️ Performance Optimization

### Target Metrics

- FPS: 60fps stable
- Initial load: < 3s
- Scene complexity: 2,300 cells + equipment
- Camera transitions: smooth 60fps
- Multiple shuttles: No frame drops

### Optimization Techniques

- [ ] **Instance Rendering** cho cells (reduce draw calls)
- [ ] **LOD (Level of Detail):**
  - Distance < 20m: Full detail
  - Distance 20-50m: Medium detail
  - Distance > 50m: Low poly boxes
- [ ] **Frustum Culling** (hide objects outside camera view)
- [ ] **Texture Atlas** (combine textures)
- [ ] **Simplified Shadows** (baked + dynamic mix)
- [ ] **Object Pooling** cho pallets
- [ ] **Lazy Loading** assets

---

## 🎨 UI/UX Design Specifications

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        GLOBAL HEADER                            │
│  [Logo] Trackify  | Dashboard | Devices | ...  [Dark] [User]   │
│  Capacity: 1234/2300 | Throughput: 24/hr | Alerts: 0           │
└─────────────────────────────────────────────────────────────────┘
┌──────┬──────────────────────────────────────────────┬──────────┐
│      │                                              │          │
│ LEFT │            MAIN WAREHOUSE VIEW               │  RIGHT   │
│ CTRL │                                              │   LOG    │
│      │         [2D Grid Visualization]              │          │
│ New  │                                              │ Activity │
│ In   │  Block A    Block B    Block C    Block D   │  Feed    │
│      │                                              │          │
│ New  │         [Shuttles] [Lifts] [Conveyors]      │ Latest   │
│ Out  │                                              │ Events   │
│      │                                              │          │
│ Sim  │  Level: [1] [2] [3] [4]   Zoom: [-] [+]    │ Filters  │
│ Mode │                                              │          │
│      │                                              │          │
└──────┴──────────────────────────────────────────────┴──────────┘
┌─────────────────────────────────────────────────────────────────┐
│              BOTTOM PANEL (Cell/Equipment Details)              │
│  Cell (12, 5, 2) | Block B | Status: Occupied | Pallet #1234   │
└─────────────────────────────────────────────────────────────────┘
```

### Color Scheme

```
Storage Cell (Empty):     #F3F4F6 (gray-100)
Storage Cell (Occupied):  #3B82F6 (blue-500)
Storage Cell (Selected):  #8B5CF6 (purple-500)
Shuttle Highway:          #FCD34D (yellow-300)
Special Zone (Room):      #10B981 (green-500) + opacity
Lift:                     #F59E0B (amber-500)
Conveyor:                 #06B6D4 (cyan-500)
Block Boundary:           #6B7280 (gray-500) dashed
```

### Animation Timing

- Cell hover: 150ms
- Shuttle movement: 300-800ms (based on distance)
- Panel slide: 200ms
- Notification: 300ms

---

## ⚙️ Configuration & Data Structure

### warehouse_config.json

```json
{
  "grid": {
    "x": 25,
    "y": 23,
    "z": 4,
    "cellSize": 1200, // mm
    "cellUnit": "mm"
  },
  "shuttleSpeed": {
    "empty": 120, // m/min
    "loaded": 80 // m/min
  },
  "liftSpeed": 40, // m/min
  "conveyorSpeed": 30 // m/min
}
```

### Cell State Interface

```typescript
interface Cell {
  x: number;
  y: number;
  z: number;
  block: 'A' | 'B' | 'C' | 'D' | null;
  type: 'storage' | 'highway' | 'special' | 'blocked';
  status: 'empty' | 'occupied' | 'reserved' | 'maintenance';
  pallet?: Pallet;
  lastUpdated: Date;
}

interface Pallet {
  id: string;
  weight: number;
  dimensions: { w: number; h: number; d: number };
  inboundTime: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: any;
}
```

---

## 🎯 Success Criteria (Demo Version)

### Must Have (Critical for Customer Demo)

- ✅ Full 3D warehouse visualization với 4 blocks
- ✅ Multiple camera modes (Overview, Follow, Block/Level focus)
- ✅ Fade effect cho non-relevant objects
- ✅ Smooth shuttle animations trên highways
- ✅ Follow Shuttle mode (camera bám theo)
- ✅ 3-5 pre-built demo scenarios
- ✅ Path visualization (glowing lines)
- ✅ Professional UI (minimal clicks)
- ✅ 60fps performance
- ✅ One-click scenario play

### Should Have

- ✅ Follow Pallet mode (track full journey)
- ✅ Cinematic camera transitions
- ✅ Lift & Conveyor animations
- ✅ Info panel với real-time metrics
- ✅ Speed control (0.5x - 10x)
- ✅ Pause/Resume controls
- ✅ Dark mode support

### Nice to Have (Post-Demo)

- 🔲 Manual operation triggers
- 🔲 Advanced visual effects (particles, bloom)
- 🔲 Multiple warehouse layouts
- 🔲 Export simulation video
- 🔲 VR mode (optional)

---

## 📊 Key Features Summary

| Feature            | Priority | Complexity | Impact       |
| ------------------ | -------- | ---------- | ------------ |
| 3D Warehouse Model | ⭐⭐⭐   | High       | Critical     |
| Follow Camera      | ⭐⭐⭐   | Medium     | Killer       |
| Fade Effects       | ⭐⭐⭐   | Low        | High UX      |
| Shuttle Animation  | ⭐⭐⭐   | Medium     | Critical     |
| Demo Scenarios     | ⭐⭐⭐   | Low        | Essential    |
| Path Visualization | ⭐⭐     | Medium     | Nice         |
| Camera Modes       | ⭐⭐⭐   | Medium     | Critical     |
| Lift/Conveyor Anim | ⭐⭐     | Medium     | Polish       |
| UI Polish          | ⭐⭐     | Low        | Professional |

---

## 🚀 Next Steps

### Immediate Actions:

1. ✅ **Review & Approve** this 3D-focused plan
2. 📦 **Install Dependencies:**
   ```bash
   cd frontend
   npm install three @react-three/fiber @react-three/drei @react-three/postprocessing zustand gsap @use-gesture/react
   ```
3. 🎯 **Start Phase 1:** Setup 3D canvas và warehouse foundation
4. 📐 **Prepare:** Study warehouse_layout.json structure

### Phase 1 Kickoff Tasks:

- [ ] Create `src/components/3D/Scene.jsx` with basic Canvas
- [ ] Setup lighting system
- [ ] Parse warehouse JSON data
- [ ] Create Grid component (25×23)
- [ ] First StorageBlock render test

---

## 💡 Demo Presentation Flow (5 minutes)

**Act 1: Overview (30s)**

- Open app → Full warehouse view
- "This is our ASRS system with 2,300 storage cells across 4 blocks and 4 levels"
- Rotate camera 360° to show scale

**Act 2: Block Focus (30s)**

- Click Block B → Camera zooms, others fade
- "Focus mode lets you isolate specific areas"
- Switch to Level 3 view

**Act 3: Simple Operation (1m)**

- Play Demo 1: Inbound operation
- Camera follows pallet: Conveyor → Lift → Shuttle → Cell
- Highlight path với glowing lines
- "Watch the automated flow in real-time"

**Act 4: Follow Shuttle (1m)**

- Play Demo 2: Transfer operation
- Camera locks on shuttle
- Follow through highways, show routing
- "Our follow camera keeps track of every movement"

**Act 5: Complex Demo (2m)**

- Play Demo 5: Multiple operations
- Show 2-3 shuttles working parallel
- Camera switches between key moments
- Speed control demonstration (2x, 5x)
- "Handle dozens of operations simultaneously"

**Closing (30s)**

- Return to overview
- "Fully interactive, real-time tracking, optimized workflow"
- Q&A

---

## 📞 Ready to Start?

**Quyết định tiếp theo:**

- ✅ Approve plan này?
- 📝 Có điều chỉnh gì không?
- 🚀 Bắt đầu Phase 1 ngay không?
- 📦 Install dependencies trước?

**Estimated Timeline:** 12 weeks to production-ready demo
**Priority Focus:** Follow Camera + Fade Effects = Killer combo cho demo

---

**Document Version:** 2.0 - 3D Focus Edition
**Last Updated:** Dec 23, 2025
**Status:** Ready for Implementation 🚀

---

## 📊 Performance Targets

- Initial load: < 2s
- Cell click response: < 100ms
- Smooth 60fps animation
- Support 50+ concurrent operations
- Handle 2,300 cells without lag

---

## 🚀 Next Steps

1. **Review & Approve** plan này
2. **Chọn Phase** muốn bắt đầu (recommend Phase 1)
3. **Confirm** technical stack
4. **Start coding** foundation

---

**Ready to start? Hãy cho tôi biết:**

- ✅ Approve plan này?
- 📝 Có điều chỉnh gì không?
- 🚀 Bắt đầu Phase nào trước?
