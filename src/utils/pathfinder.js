import layoutData from '../../docs/warehouse_layout.json';

/**
 * Simple Grid-based A* Pathfinder
 */
export class Pathfinder {
  constructor() {
    this.config = layoutData.project_config.grid_dimensions;
    this.tracks = layoutData.layout_structure.shuttle_tracks;
    this.width = this.config.x_columns + 2; // Add padding
    this.depth = this.config.y_rows + 2;
  }

  /**
   * Check if a cell is walkable (Highway or Rack)
   * @param {number} x - Grid X
   * @param {number} y - Grid Y (Z in 3D)
   */
  isWalkable(x, y) {
    // Check boundaries
    if (x < 1 || x > this.config.x_columns || y < 1 || y > this.config.y_rows) {
      return false;
    }

    // Check Horizontal Highways (Y=4, Y=12, Y=20) - Always walkable
    const isHorizontalHighway = this.tracks.horizontal_highways.some(h => h.y_index === y);

    // Check Vertical Highway (X=4) - Always walkable
    const isVerticalHighway = this.tracks.vertical_highways.some(v => v.x_index === x);

    if (isHorizontalHighway || isVerticalHighway) return true;

    // Allow access to all rack/lift/conveyor areas
    // X range: 1 (conveyor) to 25 (deepest rack)
    // Y range: 1-23 (all storage blocks + lift rows)
    // This includes:
    // - Lift rows (Y=5, Y=19)
    // - Conveyor rows (Y=6, Y=18)
    // - All rack storage rows
    if (x >= 1 && x <= 25 && y >= 1 && y <= 23) {
      return true;
    }

    // Outside valid area
    return false;
  }

  /**
   * Check if a cell is walkable WITH escape route support
   * When shuttle is in rack, it needs to exit to nearest highway first
   * Strategy:
   * 1. If not on highway, can move toward nearest highway
   * 2. Once on highway, follow normal rules
   * @param {number} x - Grid X
   * @param {number} y - Grid Y
   * @param {Object} start - Start position {x, y}
   * @param {Object} current - Current position in path {x, y}
   */
  isWalkableWithEscape(x, y, start, current) {
    // Standard walkability check (highways and depth 2)
    if (this.isWalkable(x, y)) return true;

    // Get highway info
    const horizontalHighways = [4, 12, 20];
    const verticalHighway = 4;

    // Check if start is on a highway
    const startOnHorizontalHighway = horizontalHighways.includes(start.y);
    const startOnVerticalHighway = start.x === verticalHighway;

    // If start is already on highway, don't allow rack movement
    if (startOnHorizontalHighway || startOnVerticalHighway) {
      return false;
    }

    // Start is in rack - allow escape route
    // Find nearest highways
    const nearestHorizontalHighway = horizontalHighways.reduce((nearest, hw) =>
      Math.abs(hw - start.y) < Math.abs(nearest - start.y) ? hw : nearest
    );

    // Strategy 1: Move along same column (X) toward nearest horizontal highway
    // Allow Y-axis movement in same column toward nearest horizontal highway
    if (x === current.x) {
      const movingTowardHwy = (y > current.y && current.y < nearestHorizontalHighway) ||
                               (y < current.y && current.y > nearestHorizontalHighway);
      if (movingTowardHwy || y === nearestHorizontalHighway) {
        return true;
      }
    }

    // Strategy 2: Once on horizontal highway, move along it toward vertical highway X=4
    // Allow X-axis movement along horizontal highway
    if (y === nearestHorizontalHighway && current.y === nearestHorizontalHighway) {
      const movingTowardVertical = (x > current.x && current.x < verticalHighway) ||
                                    (x < current.x && current.x > verticalHighway);
      if (movingTowardVertical || x === verticalHighway) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get cost of moving to a cell
   * Highways are cheaper to encourage using them
   */
  getCost(x, y) {
    const isH = this.tracks.horizontal_highways.some(h => h.y_index === y);
    const isV = this.tracks.vertical_highways.some(v => v.x_index === x);

    // Highways have lowest cost
    if (isH || isV) return 1;

    // Depth 2 area (lift/conveyor zone) has slightly higher cost
    if (x === 1 || x === 2) return 2;

    // Rack areas (X=3 to 25) - normal cost
    // Allow shuttle to move freely in racks for storage/retrieval
    if (x >= 3 && x <= 25) return 3;

    // Default cost
    return 10;
  }

  /**
   * Find path from Start to End
   * @param {Object} start {x, y}
   * @param {Object} end {x, y}
   * @returns {Array} Array of {x, y} coordinates
   */
  findPath(start, end) {
    // Debug: Check if start is on highway
    const horizontalHighways = [4, 12, 20];
    const verticalHighway = 4;
    const startOnHighway = horizontalHighways.includes(start.y) || start.x === verticalHighway;

    console.log(`[Pathfinder] Finding path from (${start.x},${start.y}) to (${end.x},${end.y})`);
    console.log(`[Pathfinder] Start on highway: ${startOnHighway}`);

    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const key = (p) => `${p.x},${p.y}`;

    gScore.set(key(start), 0);
    fScore.set(key(start), this.heuristic(start, end));

    while (openSet.length > 0) {
      // Get node with lowest fScore
      let current = openSet.reduce((a, b) =>
        (fScore.get(key(a)) || Infinity) < (fScore.get(key(b)) || Infinity) ? a : b
      );

      if (current.x === end.x && current.y === end.y) {
        const path = this.reconstructPath(cameFrom, current);
        console.log(`[Pathfinder] Path found with ${path.length} steps:`,
          path.map(p => `(${p.x},${p.y})`).join(' -> '));
        return path;
      }

      openSet.splice(openSet.indexOf(current), 1);

      // Neighbors (Up, Down, Left, Right)
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        // Use escape-aware walkability check
        if (!this.isWalkableWithEscape(neighbor.x, neighbor.y, start, current)) continue;

        const tentativeG = (gScore.get(key(current)) || Infinity) + this.getCost(neighbor.x, neighbor.y);

        if (tentativeG < (gScore.get(key(neighbor)) || Infinity)) {
          cameFrom.set(key(neighbor), current);
          gScore.set(key(neighbor), tentativeG);
          fScore.set(key(neighbor), tentativeG + this.heuristic(neighbor, end));

          if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    console.log(`[Pathfinder] No path found from (${start.x},${start.y}) to (${end.x},${end.y})`);
    return null; // No path found
  }

  heuristic(a, b) {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  reconstructPath(cameFrom, current) {
    const totalPath = [current];
    const key = (p) => `${p.x},${p.y}`;
    while (cameFrom.has(key(current))) {
      current = cameFrom.get(key(current));
      totalPath.unshift(current);
    }
    return totalPath;
  }
}
