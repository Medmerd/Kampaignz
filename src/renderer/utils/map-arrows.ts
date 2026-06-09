import { MapShape, MapArrow } from '../state/map-reducer';
import { PIXELS_PER_INCH } from './map-math';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculates the minimal number of positioning arrows required to position
 * the given shape relative to the nearest board edges.
 */
function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function calculatePositioningArrows(
    shape: MapShape, 
    boardWidth: number, 
    boardHeight: number
): MapArrow[] {
    const arrows: MapArrow[] = [];
    
    const boardCenter = { x: boardWidth / 2, y: boardHeight / 2 };
    const boardCorners = [
        { x: 0, y: 0 },
        { x: boardWidth, y: 0 },
        { x: 0, y: boardHeight },
        { x: boardWidth, y: boardHeight }
    ];

    if (shape.type === 'circle') {
        const cx = shape.x;
        const cy = shape.y;
        
        const distToLeft = cx;
        const distToRight = boardWidth - cx;
        if (distToLeft <= distToRight) {
            arrows.push({ id: uuidv4(), points: [0, cy, cx - 5, cy], label: `${(distToLeft / PIXELS_PER_INCH).toFixed(1)}"` });
        } else {
            arrows.push({ id: uuidv4(), points: [boardWidth, cy, cx + 5, cy], label: `${(distToRight / PIXELS_PER_INCH).toFixed(1)}"` });
        }

        const distToTop = cy;
        const distToBottom = boardHeight - cy;
        if (distToTop <= distToBottom) {
            arrows.push({ id: uuidv4(), points: [cx, 0, cx, cy - 5], label: `${(distToTop / PIXELS_PER_INCH).toFixed(1)}"` });
        } else {
            arrows.push({ id: uuidv4(), points: [cx, boardHeight, cx, cy + 5], label: `${(distToBottom / PIXELS_PER_INCH).toFixed(1)}"` });
        }
        return arrows;
    }

    let vertices: { x: number, y: number }[] = [];

    if (shape.type === 'rectangle') {
        const w = shape.width || 0;
        const h = shape.height || 0;
        vertices = [
            { x: shape.x, y: shape.y },
            { x: shape.x + w, y: shape.y },
            { x: shape.x, y: shape.y + h },
            { x: shape.x + w, y: shape.y + h }
        ];
    } else if (shape.type === 'polygon' && shape.points) {
        for (let i = 0; i < shape.points.length; i += 2) {
            vertices.push({
                x: shape.points[i] + shape.x,
                y: shape.points[i + 1] + shape.y
            });
        }
    }

    if (vertices.length === 0) return arrows;

    let vCenter = vertices[0];
    let minCenterDist = Infinity;
    
    for (const v of vertices) {
        const d = getDistance(v.x, v.y, boardCenter.x, boardCenter.y);
        if (d < minCenterDist) {
            minCenterDist = d;
            vCenter = v;
        }
    }

    let vCorner: { x: number, y: number } | null = null;
    let minCornerDist = Infinity;

    const remainingVertices = vertices.filter(v => v !== vCenter);
    
    for (const v of remainingVertices) {
        for (const bc of boardCorners) {
            const d = getDistance(v.x, v.y, bc.x, bc.y);
            if (d < minCornerDist) {
                minCornerDist = d;
                vCorner = v;
            }
        }
    }

    const createVertexArrows = (v: {x: number, y: number}) => {
        const vArrows: MapArrow[] = [];
        const distToLeft = v.x;
        const distToRight = boardWidth - v.x;
        if (distToLeft <= distToRight) {
            vArrows.push({ id: uuidv4(), points: [0, v.y, v.x - 5, v.y], label: `${(distToLeft / PIXELS_PER_INCH).toFixed(1)}"` });
        } else {
            vArrows.push({ id: uuidv4(), points: [boardWidth, v.y, v.x + 5, v.y], label: `${(distToRight / PIXELS_PER_INCH).toFixed(1)}"` });
        }

        const distToTop = v.y;
        const distToBottom = boardHeight - v.y;
        if (distToTop <= distToBottom) {
            vArrows.push({ id: uuidv4(), points: [v.x, 0, v.x, v.y - 5], label: `${(distToTop / PIXELS_PER_INCH).toFixed(1)}"` });
        } else {
            vArrows.push({ id: uuidv4(), points: [v.x, boardHeight, v.x, v.y + 5], label: `${(distToBottom / PIXELS_PER_INCH).toFixed(1)}"` });
        }
        return vArrows;
    };

    arrows.push(...createVertexArrows(vCenter));

    if (vCorner && minCornerDist > 1 && (vCorner.x !== vCenter.x || vCorner.y !== vCenter.y)) {
        arrows.push(...createVertexArrows(vCorner));
    }

    return arrows;
}
