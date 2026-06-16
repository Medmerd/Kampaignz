"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_konva_1 = require("react-konva");
const map_math_1 = require("../../utils/map-math");
function GridLayer({ width, height }) {
    const gridLines = [];
    // Vertical lines
    for (let x = 0; x <= width; x += map_math_1.PIXELS_PER_INCH) {
        gridLines.push((0, jsx_runtime_1.jsx)(react_konva_1.Line, { points: [x, 0, x, height], stroke: "#303030", strokeWidth: 1, dash: [2, 2] }, `v-${x}`));
    }
    // Horizontal lines
    for (let y = 0; y <= height; y += map_math_1.PIXELS_PER_INCH) {
        gridLines.push((0, jsx_runtime_1.jsx)(react_konva_1.Line, { points: [0, y, width, y], stroke: "#303030", strokeWidth: 1, dash: [2, 2] }, `h-${y}`));
    }
    return ((0, jsx_runtime_1.jsx)(react_konva_1.Layer, { children: gridLines }, void 0));
}
exports.default = GridLayer;
//# sourceMappingURL=GridLayer.js.map