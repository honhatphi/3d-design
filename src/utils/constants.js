// Real warehouse colors from reference photos - VIVID (with proper lighting)
export const COLORS = {
  // Rack structure - Vivid colors that will render correctly with proper lighting
  rackBlue: '#4169E1',        // Royal blue - vivid blue matching photo
  rackOrange: '#FF6B3D',      // Bright orange-red matching photo beams
  rackDarkBlue: '#2952CC',    // Medium blue for accents

  // Materials
  steel: '#71717A',           // Gray-500 - Steel finish
  holeColor: '#1E40AF',       // Dark blue - Holes on columns
  inoxRail: '#D5D7DD',        // Lighter silver - Stainless steel pallet rails
  gridLine: '#D1D5DB',        // Gray-300
};

// Cell dimensions - realistic warehouse pallet racking
export const DIMENSIONS = {
  cellWidth: 1.6,   // meters (increased from 1.35 to fit lift)
  cellDepth: 1.4,   // meters (increased from 1.0 to fit lift)
  cellHeight: 1.8,  // meters (per level - increased to prevent collision with upper level when shuttle carries pallet)

  columnSize: 0.15, // 150mm box section
  beamSize: 0.10,   // 100mm box section

  // Holes on columns (from reference photo)
  holeSize: 0.04,   // 40mm diameter holes
  holeSpacing: 0.15, // 150mm vertical spacing
};

// Shuttle zone configurations
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

// Highway positions
export const HIGHWAYS = {
  HORIZONTAL: [4, 12, 20],
  VERTICAL: 4,
};
