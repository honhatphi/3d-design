# 🎨 Design References - Real Warehouse Equipment

## 📸 Reference Images

### 1. Storage Racks (Kệ Hàng)

**File:** `rack_reference.jpg`

**Key Features:**

- **Primary Color:** Blue (Steel frame) `#1E40AF` → `#2563EB`
- **Secondary Color:** Orange (Beams) `#EA580C` → `#F97316`
- **Structure:**
  - Vertical columns: Dark blue steel
  - Horizontal beams: Bright orange
  - Cross braces: Diagonal blue supports
  - Multiple levels (4 tiers visible)
  - Industrial metal finish

**Design Notes:**

- Heavy-duty industrial aesthetic
- Orange beams provide high visibility
- Blue creates professional look
- Clear depth perspective

---

### 2. Shuttle Vehicle (Xe Shuttle)

**File:** `shuttle_reference.jpg`

**Key Features:**

- **Body Color:** Orange `#F97316` (Main chassis)
- **Accent Color:** Blue `#2563EB` (Side panels/branding)
- **Top Surface:** Light blue/cyan rollers
- **Wheels:** Black rubber
- **Dimensions (approx):**
  - Length: ~2.0m
  - Width: ~1.2m
  - Height: ~0.4m (low profile)

**Components:**

- Flat top surface with rollers
- 4 wheels (mecanum or omnidirectional)
- Side branding panels
- Safety bumpers
- LED indicators (optional)

**Design Notes:**

- Low-profile design
- Roller top for pallet transfer
- Company branding visible
- Industrial robust look

---

### 3. 3D Rack Model

**File:** `rack_3d_model.jpg`

**Key Features:**

- **Full warehouse perspective**
- **Grid Structure:** Clear cell organization
- **Depth visualization:** Multiple rows visible
- **Color scheme:** Consistent blue-orange
- **Scale reference:** Shows relative sizes

**Technical Details:**

- Cell arrangement in grid
- Support columns spacing
- Beam thickness
- Overall warehouse layout

---

## 🎨 Final Color Palette (Real-World Based)

```javascript
// PRIMARY COLORS (From photos)
const COLORS = {
  // Rack Structure
  rackBlue: '#2563EB', // Blue-600 - Vertical columns
  rackOrange: '#F97316', // Orange-500 - Horizontal beams
  rackDarkBlue: '#1E40AF', // Blue-700 - Dark accents
  rackBrightOrange: '#FB923C', // Orange-400 - Highlights

  // Shuttle
  shuttleOrange: '#F97316', // Orange-500 - Main body
  shuttleBlue: '#3B82F6', // Blue-500 - Side panels
  shuttleCyan: '#06B6D4', // Cyan-500 - Rollers
  shuttleBlack: '#1F2937', // Gray-800 - Wheels

  // Metals & Materials
  steel: '#71717A', // Gray-500 - Steel finish
  chrome: '#D4D4D8', // Gray-300 - Chrome parts
  rubber: '#18181B', // Gray-900 - Rubber

  // Floor & Environment
  concreteFloor: '#E5E7EB', // Gray-200
  warehouseCeiling: '#F3F4F6', // Gray-100
  yellowLine: '#FCD34D', // Yellow-300 - Safety lines

  // Pallets
  woodPallet: '#92400E', // Brown-800 - Wood

  // UI Only (Not equipment)
  highlight: '#EF4444', // Red-500 - Selection
  pathActive: '#10B981', // Green-500 - Active path
};
```

---

## 🏗️ Component Build Priority & Review Points

### Phase 1: Foundation Components (Week 1-2)

#### 1.1 Storage Rack Cell (Individual)

**Build First - Simplest Unit**

**Tasks:**

- [ ] Create single cell frame (blue columns)
- [ ] Add horizontal orange beams (top/bottom)
- [ ] Add diagonal cross braces
- [ ] Add depth (front/back faces)
- [ ] Metal material/texture

**Review Checkpoint 1:**

- ✋ **STOP** → Show single cell to user
- Verify: Colors, proportions, materials
- Approve before continuing

---

#### 1.2 Rack Row (5 cells horizontal)

**Build Second - Test Repetition**

**Tasks:**

- [ ] Duplicate cell 5 times
- [ ] Connect with shared beams
- [ ] Test spacing consistency
- [ ] Add row number label

**Review Checkpoint 2:**

- ✋ **STOP** → Show 5-cell row
- Verify: Spacing, alignment, overall look
- Approve before continuing

---

#### 1.3 Rack Level (Multiple rows)

**Build Third - Vertical Stack**

**Tasks:**

- [ ] Stack 4 levels vertically
- [ ] Connect vertical columns
- [ ] Add level separators
- [ ] Test height proportions

**Review Checkpoint 3:**

- ✋ **STOP** → Show 4-level rack
- Verify: Height, stability, visibility
- Approve before continuing

---

#### 1.4 Complete Block (25x23 grid subset)

**Build Fourth - Full Scale Test**

**Tasks:**

- [ ] Create one complete block (e.g., Block A)
- [ ] All 4 levels
- [ ] Proper grid positioning
- [ ] Performance test

**Review Checkpoint 4:**

- ✋ **STOP** → Show complete Block A
- Verify: Scale, performance, realism
- Approve before continuing to other blocks

---

### Phase 2: Shuttle Component (Week 3-4)

#### 2.1 Shuttle Body (Static)

**Build First - Basic Shape**

**Tasks:**

- [ ] Create base chassis (orange)
- [ ] Add side panels (blue)
- [ ] Add top rollers (cyan)
- [ ] Add wheels (black)
- [ ] Company branding/logo

**Review Checkpoint 5:**

- ✋ **STOP** → Show static shuttle
- Verify: Colors, proportions, details
- Test: Rotate 360° to see all angles
- Approve before animation

---

#### 2.2 Shuttle Animation (Movement)

**Build Second - Motion Test**

**Tasks:**

- [ ] Add wheel rotation
- [ ] Test linear movement
- [ ] Add turning animation
- [ ] Add acceleration/deceleration

**Review Checkpoint 6:**

- ✋ **STOP** → Demo movement
- Verify: Speed, smoothness, realism
- Approve before advanced features

---

### Phase 3: Lift Component (Week 5)

#### 3.1 Lift Structure

**Build - Following same review pattern**

**Tasks:**

- [ ] Platform base
- [ ] Vertical rails
- [ ] Safety barriers
- [ ] Industrial details

**Review Checkpoint 7:**

- ✋ **STOP** → Show lift structure
- Approve before animation

---

### Phase 4: Conveyor Belt (Week 5)

#### 4.1 Conveyor

**Build - Following same review pattern**

**Tasks:**

- [ ] Belt structure
- [ ] Roller system
- [ ] Entry/exit gates
- [ ] Texture animation

**Review Checkpoint 8:**

- ✋ **STOP** → Show conveyor
- Approve before integration

---

## 🔄 Iterative Development Workflow

### Step-by-Step Process:

```
1. START Component
   ↓
2. BUILD in isolation (separate test scene)
   ↓
3. CAPTURE Screenshot/Video
   ↓
4. 🛑 REVIEW with User
   ├─ ✅ Approved → Continue
   └─ ❌ Changes needed → Iterate and re-review
   ↓
5. INTEGRATE into main scene
   ↓
6. NEXT Component
```

### Review Format:

**For each checkpoint, I will provide:**

1. 📸 Screenshot (or live preview link)
2. 📹 Short video (rotating view)
3. ✅ Checklist:
   - [ ] Colors match reference?
   - [ ] Proportions correct?
   - [ ] Details sufficient?
   - [ ] Performance OK?

**You respond:**

- ✅ "Approved - Continue"
- 🔄 "Change: [specific feedback]"

---

## 🎯 Quality Standards

### Visual Accuracy:

- [ ] Colors match reference photos ±5%
- [ ] Proportions match real-world scale
- [ ] Industrial aesthetic maintained
- [ ] No "cartoon" or "toy" look

### Performance:

- [ ] 60fps with single component
- [ ] 45fps+ with full scene
- [ ] No lag on camera movement

### Details:

- [ ] Sharp edges where needed
- [ ] Rounded edges where appropriate
- [ ] Metal texture/reflections
- [ ] Weathering/realism (optional)

---

## 📐 Technical Specifications (From Photos)

### Rack Dimensions (Estimated):

```
Cell Size:
- Width: 1.2m (standard pallet)
- Depth: 1.0m
- Height: 2.0m (per level)

Column:
- Profile: Box section 150mm × 150mm
- Color: Dark Blue #1E40AF
- Material: Powder-coated steel

Beam:
- Profile: Box section 100mm × 80mm
- Color: Bright Orange #F97316
- Material: Powder-coated steel

Spacing:
- Column spacing: 1.2m
- Level spacing: 2.0m
- Cross brace: 45° diagonal
```

### Shuttle Dimensions:

```
Overall:
- Length: 2.0m
- Width: 1.2m
- Height: 0.4m (low profile)

Wheels:
- Diameter: 150mm
- Type: Heavy-duty industrial
- Color: Black

Rollers (top):
- Diameter: 50mm
- Spacing: 100mm
- Color: Light cyan/blue
```

---

## 🚀 Next Steps

1. **Install dependencies** (if not done)
2. **Start with Review Checkpoint 1:** Single rack cell
3. **I will build and show you** each component
4. **You approve or request changes**
5. **Move to next checkpoint**

**Ready to start building the first component (Single Rack Cell)?**
