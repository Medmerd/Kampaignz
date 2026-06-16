"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const map_arrows_1 = require("../../../src/renderer/utils/map-arrows");
(0, vitest_1.describe)('Map Arrows Utils', () => {
    (0, vitest_1.describe)('calculatePositioningArrows', () => {
        (0, vitest_1.it)('calculates arrows for the closest center vertex and closest corner vertex of a rectangle', () => {
            // Board 60x44 inches -> 1200x880 pixels
            const boardWidth = 1200;
            const boardHeight = 880;
            // Center is 600, 440
            // Rectangle at (100, 100) with width 200, height 200
            // Vertices:
            // Top-Left: 100, 100
            // Top-Right: 300, 100
            // Bottom-Left: 100, 300
            // Bottom-Right: 300, 300
            // vCenter = Bottom-Right (300, 300) -> dist to (600,440) is ~331
            // vCorner = Top-Left (100, 100) -> dist to (0,0) is ~141
            const shape = {
                id: '1',
                type: 'rectangle',
                x: 100,
                y: 100,
                width: 200,
                height: 200,
                title: '',
                description: ''
            };
            const arrows = (0, map_arrows_1.calculatePositioningArrows)(shape, boardWidth, boardHeight);
            // Should generate 2 arrows for vCenter, and 2 for vCorner = 4 arrows total
            (0, vitest_1.expect)(arrows.length).toBe(4);
            // vCenter (300, 300) arrows: Left and Top edges are closer
            const centerLeftArrow = arrows.find(a => a.points[0] === 0 && a.points[1] === 300 && a.points[2] === 295 && a.points[3] === 300);
            (0, vitest_1.expect)(centerLeftArrow).toBeDefined();
            (0, vitest_1.expect)(centerLeftArrow?.label).toBe('15.0"'); // 300px / 20
            const centerTopArrow = arrows.find(a => a.points[0] === 300 && a.points[1] === 0 && a.points[2] === 300 && a.points[3] === 295);
            (0, vitest_1.expect)(centerTopArrow).toBeDefined();
            (0, vitest_1.expect)(centerTopArrow?.label).toBe('15.0"');
            // vCorner (100, 100) arrows: Left and Top edges are closer
            const cornerLeftArrow = arrows.find(a => a.points[0] === 0 && a.points[1] === 100 && a.points[2] === 95 && a.points[3] === 100);
            (0, vitest_1.expect)(cornerLeftArrow).toBeDefined();
            (0, vitest_1.expect)(cornerLeftArrow?.label).toBe('5.0"'); // 100px / 20
            const cornerTopArrow = arrows.find(a => a.points[0] === 100 && a.points[1] === 0 && a.points[2] === 100 && a.points[3] === 95);
            (0, vitest_1.expect)(cornerTopArrow).toBeDefined();
            (0, vitest_1.expect)(cornerTopArrow?.label).toBe('5.0"');
        });
    });
});
//# sourceMappingURL=map-arrows.test.js.map