"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const react_konva_1 = require("react-konva");
const map_snapping_1 = require("../../utils/map-snapping");
const map_math_1 = require("../../utils/map-math");
function ShapeLayer({ shapes, arrows, isLocked, onUpdateShape, selectedShapeId, onSelectShape }) {
    const trRef = (0, react_1.useRef)(null);
    const shapeRefs = (0, react_1.useRef)({});
    (0, react_1.useEffect)(() => {
        if (selectedShapeId && !isLocked) {
            const node = shapeRefs.current[selectedShapeId];
            if (node) {
                trRef.current?.nodes([node]);
                trRef.current?.getLayer().batchDraw();
            }
            else {
                trRef.current?.nodes([]);
            }
        }
        else {
            trRef.current?.nodes([]);
        }
    }, [selectedShapeId, isLocked]);
    const handleDragEnd = (e, shape) => {
        if (isLocked)
            return;
        let newX = e.target.x();
        let newY = e.target.y();
        // Check if Shift is held to disable snapping
        const isShiftHeld = e.evt?.shiftKey;
        if (!isShiftHeld) {
            if (shape.type === 'rectangle') {
                const snappedBox = (0, map_snapping_1.snapBoxToGrid)({
                    x: newX,
                    y: newY,
                    width: shape.width || 0,
                    height: shape.height || 0
                });
                newX = snappedBox.x;
                newY = snappedBox.y;
            }
            else if (shape.type === 'circle' || shape.type === 'polygon') {
                // For circles and polygons, snap their primary x,y coordinate to the grid
                const snapped = (0, map_snapping_1.snapToGrid)({ x: newX, y: newY });
                newX = snapped.x;
                newY = snapped.y;
            }
        }
        onUpdateShape({
            id: shape.id,
            x: newX,
            y: newY
        });
        // Reset absolute position if we snapped, Konva handles the internal stage coords
        e.target.position({ x: newX, y: newY });
    };
    return ((0, jsx_runtime_1.jsxs)(react_konva_1.Layer, { children: [shapes.map((shape) => {
                const isSelected = shape.id === selectedShapeId;
                const commonProps = {
                    key: shape.id,
                    x: shape.x,
                    y: shape.y,
                    draggable: !isLocked,
                    onClick: () => onSelectShape(shape.id),
                    onTap: () => onSelectShape(shape.id),
                    onDragEnd: (e) => handleDragEnd(e, shape),
                    stroke: isSelected && shape.type !== 'rectangle' ? '#1677ff' : '#424242',
                    strokeWidth: isSelected && shape.type !== 'rectangle' ? 3 : 1,
                    fill: shape.fill || 'rgba(255, 255, 255, 0.1)',
                };
                if (shape.type === 'rectangle') {
                    return ((0, jsx_runtime_1.jsx)(react_konva_1.Rect, { ...commonProps, ref: (node) => { shapeRefs.current[shape.id] = node; }, name: "rectangle", width: shape.width || 50, height: shape.height || 50, stroke: isSelected ? '#1677ff' : '#424242', strokeWidth: isSelected ? 3 : 1, onTransformEnd: (e) => {
                            const node = shapeRefs.current[shape.id];
                            const scaleX = node.scaleX();
                            const scaleY = node.scaleY();
                            node.scaleX(1);
                            node.scaleY(1);
                            const newWidth = Math.max(5, node.width() * scaleX);
                            const newHeight = Math.max(5, node.height() * scaleY);
                            const snappedWidth = Math.round(newWidth / map_math_1.PIXELS_PER_INCH) * map_math_1.PIXELS_PER_INCH || map_math_1.PIXELS_PER_INCH;
                            const snappedHeight = Math.round(newHeight / map_math_1.PIXELS_PER_INCH) * map_math_1.PIXELS_PER_INCH || map_math_1.PIXELS_PER_INCH;
                            const snappedBox = (0, map_snapping_1.snapBoxToGrid)({
                                x: node.x(),
                                y: node.y(),
                                width: snappedWidth,
                                height: snappedHeight
                            });
                            onUpdateShape({
                                id: shape.id,
                                x: snappedBox.x,
                                y: snappedBox.y,
                                width: snappedWidth,
                                height: snappedHeight
                            });
                        } }, void 0));
                }
                if (shape.type === 'circle') {
                    return ((0, jsx_runtime_1.jsx)(react_konva_1.Circle, { ...commonProps, ref: (node) => { shapeRefs.current[shape.id] = node; }, name: "circle", radius: shape.radius || 20, onTransformEnd: (e) => {
                            const node = shapeRefs.current[shape.id];
                            const scaleX = node.scaleX();
                            const scaleY = node.scaleY();
                            node.scaleX(1);
                            node.scaleY(1);
                            const newRadius = Math.max(5, node.radius() * Math.max(scaleX, scaleY));
                            onUpdateShape({
                                id: shape.id,
                                x: node.x(),
                                y: node.y(),
                                radius: newRadius
                            });
                        } }, void 0));
                }
                if (shape.type === 'polygon' && shape.points) {
                    return ((0, jsx_runtime_1.jsx)(react_konva_1.Line, { ...commonProps, ref: (node) => { shapeRefs.current[shape.id] = node; }, name: "polygon", points: shape.points, closed: true, onTransformEnd: (e) => {
                            const node = shapeRefs.current[shape.id];
                            const scaleX = node.scaleX();
                            const scaleY = node.scaleY();
                            node.scaleX(1);
                            node.scaleY(1);
                            const newPoints = shape.points.map((p, i) => {
                                return i % 2 === 0 ? p * scaleX : p * scaleY;
                            });
                            onUpdateShape({
                                id: shape.id,
                                x: node.x(),
                                y: node.y(),
                                points: newPoints
                            });
                        } }, void 0));
                }
                return null;
            }), !isLocked && ((0, jsx_runtime_1.jsx)(react_konva_1.Transformer, { ref: trRef, keepRatio: false, enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left'], boundBoxFunc: (oldBox, newBox) => {
                    // limit resize
                    if (newBox.width < map_math_1.PIXELS_PER_INCH || newBox.height < map_math_1.PIXELS_PER_INCH) {
                        return oldBox;
                    }
                    return newBox;
                } }, void 0)), arrows.map((arrow) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_konva_1.Arrow, { points: arrow.points, stroke: "black", fill: "black", strokeWidth: 2, pointerLength: 10, pointerWidth: 10, dash: [4, 4] }, void 0), (0, jsx_runtime_1.jsxs)(react_konva_1.Label, { x: (arrow.points[0] + arrow.points[2]) / 2, y: (arrow.points[1] + arrow.points[3]) / 2, offsetX: 15, offsetY: 10, children: [(0, jsx_runtime_1.jsx)(react_konva_1.Tag, { fill: "white", cornerRadius: 4, shadowColor: "black", shadowBlur: 2, shadowOpacity: 0.2, shadowOffset: { x: 1, y: 1 } }, void 0), (0, jsx_runtime_1.jsx)(react_konva_1.Text, { text: arrow.label, fill: "black", fontSize: 14, fontStyle: "bold", padding: 4 }, void 0)] }, void 0)] }, arrow.id)))] }, void 0));
}
exports.default = ShapeLayer;
//# sourceMappingURL=ShapeLayer.js.map