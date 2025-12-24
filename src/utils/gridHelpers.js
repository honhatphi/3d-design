import { DIMENSIONS } from './constants';
import layoutData from '../../docs/warehouse_layout.json';

const { grid_dimensions } = layoutData.project_config;
const { x_columns, y_rows } = grid_dimensions;
const { cellWidth, cellDepth, cellHeight } = DIMENSIONS;

/**
 * Convert Grid Coordinates (1-based) to World 3D Coordinates (Centered)
 * @param {number} x - Grid X (1..25)
 * @param {number} y - Grid Y (1..23) - Maps to Z in 3D
 * @param {number} z - Grid Z (1..4) - Maps to Y in 3D
 * @returns {Array} [x, y, z] World Position
 */
export const gridToWorld = (x, y, z = 1) => {
  const xPos = (x - x_columns / 2) * cellWidth;
  const zPos = (y - y_rows / 2) * cellDepth;
  // Match WarehouseGrid rail height: (z-1)*cellHeight + beamSize/2 + railHeight/2 + shuttleWheelOffset
  // beamSize=0.1, railHeight=0.12 -> offset=0.11
  const yPos = (z - 1) * cellHeight + 0.11;
  return [xPos, yPos, zPos];
};

/**
 * Convert World 3D Coordinates to Grid Coordinates
 * @param {number} wx - World X
 * @param {number} wz - World Z
 * @returns {Object} { x, y } Grid Coordinates
 */
export const worldToGrid = (wx, wz) => {
  const x = Math.round(wx / cellWidth + x_columns / 2);
  const y = Math.round(wz / cellDepth + y_rows / 2);
  return { x, y };
};
