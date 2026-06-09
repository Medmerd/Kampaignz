import { describe, it, expect } from 'vitest';
import { calculatePositioningArrows } from '../../../src/renderer/utils/map-arrows';
import { MapShape } from '../../../src/renderer/state/map-reducer';

describe('Map Arrows Utils', () => {
    describe('calculatePositioningArrows', () => {
        it('calculates arrows for the closest center vertex and closest corner vertex of a rectangle', () => {
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

            const shape: MapShape = {
                id: '1',
                type: 'rectangle',
                x: 100,
                y: 100,
                width: 200,
                height: 200,
                title: '',
                description: ''
            };

            const arrows = calculatePositioningArrows(shape, boardWidth, boardHeight);
            
            // Should generate 2 arrows for vCenter, and 2 for vCorner = 4 arrows total
            expect(arrows.length).toBe(4);

            // vCenter (300, 300) arrows: Left and Top edges are closer
            const centerLeftArrow = arrows.find(a => a.points[0] === 0 && a.points[1] === 300 && a.points[2] === 295 && a.points[3] === 300);
            expect(centerLeftArrow).toBeDefined();
            expect(centerLeftArrow?.label).toBe('15.0"'); // 300px / 20

            const centerTopArrow = arrows.find(a => a.points[0] === 300 && a.points[1] === 0 && a.points[2] === 300 && a.points[3] === 295);
            expect(centerTopArrow).toBeDefined();
            expect(centerTopArrow?.label).toBe('15.0"');

            // vCorner (100, 100) arrows: Left and Top edges are closer
            const cornerLeftArrow = arrows.find(a => a.points[0] === 0 && a.points[1] === 100 && a.points[2] === 95 && a.points[3] === 100);
            expect(cornerLeftArrow).toBeDefined();
            expect(cornerLeftArrow?.label).toBe('5.0"'); // 100px / 20

            const cornerTopArrow = arrows.find(a => a.points[0] === 100 && a.points[1] === 0 && a.points[2] === 100 && a.points[3] === 95);
            expect(cornerTopArrow).toBeDefined();
            expect(cornerTopArrow?.label).toBe('5.0"');
        });
    });
});
