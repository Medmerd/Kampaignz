"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapBoxToGrid = exports.snapToGrid = void 0;
const map_math_1 = require("./map-math");
/**
 * Snaps a pixel coordinate to the nearest grid intersection.
 * Assumes the grid lines are drawn at intervals of PIXELS_PER_INCH.
 */
function snapToGrid(point) {
    return {
        x: Math.round(point.x / map_math_1.PIXELS_PER_INCH) * map_math_1.PIXELS_PER_INCH,
        y: Math.round(point.y / map_math_1.PIXELS_PER_INCH) * map_math_1.PIXELS_PER_INCH
    };
}
exports.snapToGrid = snapToGrid;
/**
 * Snaps the top-left coordinate of a bounding box to the nearest grid intersection,
 * preserving the original width and height.
 */
function snapBoxToGrid(box) {
    const snappedTopLeft = snapToGrid({ x: box.x, y: box.y });
    return {
        ...box,
        x: snappedTopLeft.x,
        y: snappedTopLeft.y
    };
}
exports.snapBoxToGrid = snapBoxToGrid;
//# sourceMappingURL=map-snapping.js.map