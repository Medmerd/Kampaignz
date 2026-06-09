import React from 'react';
import { Layer, Line } from 'react-konva';
import { PIXELS_PER_INCH } from '../../utils/map-math';

interface GridLayerProps {
    width: number;
    height: number;
}

export default function GridLayer({ width, height }: GridLayerProps) {
    const gridLines = [];

    // Vertical lines
    for (let x = 0; x <= width; x += PIXELS_PER_INCH) {
        gridLines.push(
            <Line
                key={`v-${x}`}
                points={[x, 0, x, height]}
                stroke="#303030"
                strokeWidth={1}
                dash={[2, 2]}
            />
        );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += PIXELS_PER_INCH) {
        gridLines.push(
            <Line
                key={`h-${y}`}
                points={[0, y, width, y]}
                stroke="#303030"
                strokeWidth={1}
                dash={[2, 2]}
            />
        );
    }

    return (
        <Layer>
            {gridLines}
        </Layer>
    );
}
