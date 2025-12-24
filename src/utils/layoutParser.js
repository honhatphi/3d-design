import { DIMENSIONS } from './constants';

/**
 * Parses the warehouse layout JSON and generates 3D coordinates for all rack cells.
 * @param {Object} layoutData - The JSON content of warehouse_layout.json
 * @returns {Array} Array of cell objects { x, y, z, type, gridX, gridY, gridZ }
 */
export const generateLayout = (layoutData) => {
  const { grid_dimensions } = layoutData.project_config;
  const { storage_blocks, shuttle_tracks } = layoutData.layout_structure;

  const racks = [];
  const { x_columns, y_rows, z_levels } = grid_dimensions;
  const { cellWidth, cellDepth, cellHeight } = DIMENSIONS;

  // Helper to check if a column is a vertical highway
  // Updated to respect y_range (e.g., V_TRACK_LINK only exists from Y=4 to Y=20)
  const isVerticalHighway = (x, y) => {
    return shuttle_tracks.vertical_highways.some(h => {
      if (h.x_index !== x) return false;
      // If y_range is defined, check if current y is within it
      if (h.y_range) {
        return y >= h.y_range[0] && y <= h.y_range[1];
      }
      return true; // If no range, assume full length
    });
  };

  // Helper to check if a row is a horizontal highway
  // Note: In this specific layout, horizontal highways might overlap with blocks or be separate.
  // Usually highways are empty of racks.
  const isHorizontalHighway = (y) => {
    return shuttle_tracks.horizontal_highways.some(h => h.y_index === y);
  };

  // Iterate through defined storage blocks
  storage_blocks.forEach(block => {
    const [yStart, yEnd] = block.y_range;

    for (let y = yStart; y <= yEnd; y++) {
      // Skip if this row is strictly a highway (optional, depends on design)
      // For now, we assume blocks define where racks are, even if adjacent to highways.
      if (isHorizontalHighway(y)) continue;

      // Determine X start for this row
      let xStart = block.default_x_start || 1;

      // Check for specific row rules
      if (block.row_rules) {
        const rule = block.row_rules.find(r => r.rows.includes(y));
        if (rule) {
          xStart = rule.x_start;
        }
      }

      // Iterate X columns
      for (let x = xStart; x <= x_columns; x++) {
        // Skip vertical highways (no racks on the main vertical track)
        if (isVerticalHighway(x, y)) continue;

        // Generate racks for all levels
        for (let z = 1; z <= z_levels; z++) {
          // Calculate 3D Position
          // Center the warehouse at (0,0,0)
          const xPos = (x - x_columns / 2) * cellWidth;
          const zPos = (y - y_rows / 2) * cellDepth; // Y in grid is Z in 3D
          const yPos = (z - 1) * cellHeight; // Z in grid is Y in 3D

          racks.push({
            position: [xPos, yPos, zPos],
            grid: { x, y, z },
            blockId: block.id
          });
        }
      }
    }
  });

  return racks;
};

/**
 * Generates 3D coordinates for all shuttle track cells (highways).
 * @param {Object} layoutData - The JSON content of warehouse_layout.json
 * @returns {Array} Array of track objects { position, grid, type }
 */
export const generateTracks = (layoutData) => {
  const { grid_dimensions } = layoutData.project_config;
  const { shuttle_tracks } = layoutData.layout_structure;
  const { x_columns, y_rows, z_levels } = grid_dimensions;
  const { cellWidth, cellDepth, cellHeight } = DIMENSIONS;

  const tracks = [];

  // Helper to check if a column is a vertical highway
  const isVerticalHighway = (x, y) => {
    return shuttle_tracks.vertical_highways.some(h => {
      if (h.x_index !== x) return false;
      if (h.y_range) {
        return y >= h.y_range[0] && y <= h.y_range[1];
      }
      return true;
    });
  };

  // Helper to check if a row is a horizontal highway
  const isHorizontalHighway = (y) => {
    return shuttle_tracks.horizontal_highways.some(h => h.y_index === y);
  };

  // Iterate through the entire grid to find tracks
  for (let y = 1; y <= y_rows; y++) {
    for (let x = 1; x <= x_columns; x++) {
      const isH = isHorizontalHighway(y);
      const isV = isVerticalHighway(x, y);

      // Check for Lift Connectors (Manually added for now based on layout)
      // Lift Lower (2,5) -> Connects to V-Track (4,5) via (3,5)
      // Lift Upper (2,19) -> Connects to V-Track (4,19) via (3,19)
      // Also include the lift position itself as a track for continuity if needed,
      // but usually lift has its own rails.
      // Let's add x=3 at y=5 and y=19 as 'HORIZONTAL' tracks (connecting X)
      const isLiftConnector = (x === 3 && (y === 5 || y === 19));

      if (isH || isV || isLiftConnector) {
        // This is a track cell
        for (let z = 1; z <= z_levels; z++) {
          const xPos = (x - x_columns / 2) * cellWidth;
          const zPos = (y - y_rows / 2) * cellDepth;
          const yPos = (z - 1) * cellHeight;

          tracks.push({
            position: [xPos, yPos, zPos],
            grid: { x, y, z },
            type: (isH && isV) ? 'INTERSECTION' : (isH || isLiftConnector ? 'HORIZONTAL' : 'VERTICAL')
          });
        }
      }
    }
  }

  return tracks;
};
