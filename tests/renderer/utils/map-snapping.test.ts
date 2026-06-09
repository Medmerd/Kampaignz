import { describe, it, expect } from 'vitest';
import { snapToGrid, snapBoxToGrid } from '../../../src/renderer/utils/map-snapping';

describe('Map Snapping Utils', () => {
    describe('snapToGrid', () => {
        it('snaps a pixel coordinate to the nearest grid intersection', () => {
            // Assuming PIXELS_PER_INCH = 20
            const point1 = { x: 25, y: 38 };
            expect(snapToGrid(point1)).toEqual({ x: 20, y: 40 });

            const point2 = { x: 19, y: 5 };
            expect(snapToGrid(point2)).toEqual({ x: 20, y: 0 });

            const point3 = { x: 60, y: 60 };
            expect(snapToGrid(point3)).toEqual({ x: 60, y: 60 });
        });
    });

    describe('snapBoxToGrid', () => {
        it('snaps the top-left corner of a bounding box to the grid', () => {
            const box = { x: 23, y: 18, width: 50, height: 50 };
            const snappedBox = snapBoxToGrid(box);
            expect(snappedBox.x).toBe(20);
            expect(snappedBox.y).toBe(20);
            expect(snappedBox.width).toBe(50); // Width should remain unchanged
            expect(snappedBox.height).toBe(50);
        });
    });
});
