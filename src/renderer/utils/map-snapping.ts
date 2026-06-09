import { Point, PIXELS_PER_INCH } from './map-math';

/**
 * Snaps a pixel coordinate to the nearest grid intersection.
 * Assumes the grid lines are drawn at intervals of PIXELS_PER_INCH.
 */
export function snapToGrid(point: Point): Point {
    return {
        x: Math.round(point.x / PIXELS_PER_INCH) * PIXELS_PER_INCH,
        y: Math.round(point.y / PIXELS_PER_INCH) * PIXELS_PER_INCH
    };
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Snaps the top-left coordinate of a bounding box to the nearest grid intersection,
 * preserving the original width and height.
 */
export function snapBoxToGrid(box: BoundingBox): BoundingBox {
    const snappedTopLeft = snapToGrid({ x: box.x, y: box.y });
    return {
        ...box,
        x: snappedTopLeft.x,
        y: snappedTopLeft.y
    };
}
