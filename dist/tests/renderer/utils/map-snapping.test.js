"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const map_snapping_1 = require("../../../src/renderer/utils/map-snapping");
(0, vitest_1.describe)('Map Snapping Utils', () => {
    (0, vitest_1.describe)('snapToGrid', () => {
        (0, vitest_1.it)('snaps a pixel coordinate to the nearest grid intersection', () => {
            // Assuming PIXELS_PER_INCH = 20
            const point1 = { x: 25, y: 38 };
            (0, vitest_1.expect)((0, map_snapping_1.snapToGrid)(point1)).toEqual({ x: 20, y: 40 });
            const point2 = { x: 19, y: 5 };
            (0, vitest_1.expect)((0, map_snapping_1.snapToGrid)(point2)).toEqual({ x: 20, y: 0 });
            const point3 = { x: 60, y: 60 };
            (0, vitest_1.expect)((0, map_snapping_1.snapToGrid)(point3)).toEqual({ x: 60, y: 60 });
        });
    });
    (0, vitest_1.describe)('snapBoxToGrid', () => {
        (0, vitest_1.it)('snaps the top-left corner of a bounding box to the grid', () => {
            const box = { x: 23, y: 18, width: 50, height: 50 };
            const snappedBox = (0, map_snapping_1.snapBoxToGrid)(box);
            (0, vitest_1.expect)(snappedBox.x).toBe(20);
            (0, vitest_1.expect)(snappedBox.y).toBe(20);
            (0, vitest_1.expect)(snappedBox.width).toBe(50); // Width should remain unchanged
            (0, vitest_1.expect)(snappedBox.height).toBe(50);
        });
    });
});
//# sourceMappingURL=map-snapping.test.js.map