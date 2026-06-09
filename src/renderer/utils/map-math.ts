// Global constant for scaling
export const PIXELS_PER_INCH = 20;

/**
 * Converts inches to canvas pixels based on the global scale.
 */
export function inchesToPixels(inches: number): number {
    return inches * PIXELS_PER_INCH;
}

export const MM_PER_INCH = 25.4;

/**
 * Converts millimeters to canvas pixels based on the global scale.
 */
export function mmToPixels(mm: number): number {
    const inches = mm / MM_PER_INCH;
    return inchesToPixels(inches);
}

export interface Point {
    x: number;
    y: number;
}

/**
 * Calculates straight line distance in inches between two pixel coordinates.
 */
export function calculateDistanceInInches(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);
    return distancePixels / PIXELS_PER_INCH;
}
