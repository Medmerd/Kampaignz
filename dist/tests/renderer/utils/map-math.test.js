"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const map_math_1 = require("../../../src/renderer/utils/map-math");
(0, vitest_1.describe)('Map Math Utils', () => {
    (0, vitest_1.describe)('inchesToPixels', () => {
        (0, vitest_1.it)('converts inches to canvas pixels correctly', () => {
            // Assuming 1 inch = 20 pixels
            (0, vitest_1.expect)((0, map_math_1.inchesToPixels)(1)).toBe(20);
            (0, vitest_1.expect)((0, map_math_1.inchesToPixels)(60)).toBe(1200);
            (0, vitest_1.expect)((0, map_math_1.inchesToPixels)(0.5)).toBe(10);
        });
    });
    (0, vitest_1.describe)('mmToPixels', () => {
        (0, vitest_1.it)('converts millimeters to canvas pixels correctly', () => {
            // 40mm / 25.4 = ~1.5748 inches. 1.5748 * 20 = ~31.496
            const result40 = (0, map_math_1.mmToPixels)(40);
            (0, vitest_1.expect)(result40).toBeCloseTo(31.496, 2);
            const result32 = (0, map_math_1.mmToPixels)(32);
            (0, vitest_1.expect)(result32).toBeCloseTo(25.197, 2);
        });
    });
    (0, vitest_1.describe)('calculateDistanceInInches', () => {
        (0, vitest_1.it)('calculates straight line distance correctly', () => {
            // Distance between (0,0) and (60, 80) is 100 pixels.
            // 100 pixels / 20 pixels_per_inch = 5 inches
            const dist = (0, map_math_1.calculateDistanceInInches)({ x: 0, y: 0 }, { x: 60, y: 80 });
            (0, vitest_1.expect)(dist).toBe(5);
        });
        (0, vitest_1.it)('handles identical points', () => {
            const dist = (0, map_math_1.calculateDistanceInInches)({ x: 10, y: 10 }, { x: 10, y: 10 });
            (0, vitest_1.expect)(dist).toBe(0);
        });
    });
});
//# sourceMappingURL=map-math.test.js.map