import { describe, it, expect } from 'vitest';
import { inchesToPixels, mmToPixels, calculateDistanceInInches } from '../../../src/renderer/utils/map-math';

describe('Map Math Utils', () => {
    describe('inchesToPixels', () => {
        it('converts inches to canvas pixels correctly', () => {
            // Assuming 1 inch = 20 pixels
            expect(inchesToPixels(1)).toBe(20);
            expect(inchesToPixels(60)).toBe(1200);
            expect(inchesToPixels(0.5)).toBe(10);
        });
    });

    describe('mmToPixels', () => {
        it('converts millimeters to canvas pixels correctly', () => {
            // 40mm / 25.4 = ~1.5748 inches. 1.5748 * 20 = ~31.496
            const result40 = mmToPixels(40);
            expect(result40).toBeCloseTo(31.496, 2);

            const result32 = mmToPixels(32);
            expect(result32).toBeCloseTo(25.197, 2);
        });
    });

    describe('calculateDistanceInInches', () => {
        it('calculates straight line distance correctly', () => {
            // Distance between (0,0) and (60, 80) is 100 pixels.
            // 100 pixels / 20 pixels_per_inch = 5 inches
            const dist = calculateDistanceInInches({x: 0, y: 0}, {x: 60, y: 80});
            expect(dist).toBe(5);
        });

        it('handles identical points', () => {
            const dist = calculateDistanceInInches({x: 10, y: 10}, {x: 10, y: 10});
            expect(dist).toBe(0);
        });
    });
});
