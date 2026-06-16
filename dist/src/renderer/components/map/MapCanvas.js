"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_konva_1 = require("react-konva");
const GridLayer_1 = __importDefault(require("./GridLayer"));
const ShapeLayer_1 = __importDefault(require("./ShapeLayer"));
const map_reducer_1 = require("../../state/map-reducer");
const map_arrows_1 = require("../../utils/map-arrows");
const uuid_1 = require("uuid");
const map_math_1 = require("../../utils/map-math");
const map_snapping_1 = require("../../utils/map-snapping");
function MapCanvas({ boardWidthInches = 60, boardHeightInches = 44, initialMapJson, readonly = false, onSave }) {
    const initializeState = () => {
        if (initialMapJson) {
            try {
                const parsed = JSON.parse(initialMapJson);
                return { ...map_reducer_1.initialMapState, ...parsed };
            }
            catch (e) {
                console.error("Failed to parse map JSON", e);
            }
        }
        return map_reducer_1.initialMapState;
    };
    const [state, dispatch] = (0, react_1.useReducer)(map_reducer_1.mapReducer, undefined, initializeState);
    const [selectedShapeId, setSelectedShapeId] = (0, react_1.useState)(null);
    const [activeTool, setActiveTool] = (0, react_1.useState)(null);
    const [draftPolygonPoints, setDraftPolygonPoints] = (0, react_1.useState)([]);
    const [activeColor, setActiveColor] = (0, react_1.useState)('rgba(22, 119, 255, 0.4)');
    const [scale, setScale] = (0, react_1.useState)(1);
    const containerRef = (0, react_1.useRef)(null);
    const boardWidthPx = boardWidthInches * map_math_1.PIXELS_PER_INCH;
    const boardHeightPx = boardHeightInches * map_math_1.PIXELS_PER_INCH;
    (0, react_1.useEffect)(() => {
        if (!containerRef.current)
            return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            const scaleX = width / boardWidthPx;
            const scaleY = height / boardHeightPx;
            setScale(Math.min(scaleX, scaleY));
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [boardWidthPx, boardHeightPx]);
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (e) => {
            if (readonly)
                return;
            if ((e.key === 'Backspace' || e.key === 'Delete') && selectedShapeId && !state.isLocked) {
                dispatch({ type: 'DELETE_SHAPE', payload: { id: selectedShapeId } });
                setSelectedShapeId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedShapeId, state.isLocked, dispatch, readonly]);
    const allArrows = state.shapes.flatMap(shape => (0, map_arrows_1.calculatePositioningArrows)(shape, boardWidthPx, boardHeightPx));
    // Handle tool interactions (clicking the canvas to place a shape)
    const handleStageClick = (e) => {
        if (readonly)
            return;
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();
        if (!pointerPosition)
            return;
        // Polygon drawing logic
        if (activeTool === 'polygon') {
            if (draftPolygonPoints.length > 2) {
                // Check if click is close to starting point to close polygon
                const startX = draftPolygonPoints[0];
                const startY = draftPolygonPoints[1];
                const dist = Math.sqrt(Math.pow(pointerPosition.x - startX, 2) +
                    Math.pow(pointerPosition.y - startY, 2));
                if (dist < 20) { // snap-to-close distance
                    const newShape = {
                        id: (0, uuid_1.v4)(),
                        type: 'polygon',
                        x: 0,
                        y: 0,
                        points: draftPolygonPoints,
                        title: 'Custom Polygon',
                        description: '',
                        fill: activeColor
                    };
                    dispatch({ type: 'ADD_SHAPE', payload: newShape });
                    setDraftPolygonPoints([]);
                    setActiveTool(null);
                    setSelectedShapeId(newShape.id);
                    return;
                }
            }
            // Otherwise add point
            const isShiftHeld = e.evt?.shiftKey;
            let pX = pointerPosition.x;
            let pY = pointerPosition.y;
            if (!isShiftHeld) {
                const snapped = (0, map_snapping_1.snapToGrid)({ x: pX, y: pY });
                pX = snapped.x;
                pY = snapped.y;
            }
            setDraftPolygonPoints([...draftPolygonPoints, pX, pY]);
            return;
        }
        // If clicking on empty stage, deselect
        if (e.target === stage) {
            setSelectedShapeId(null);
            // Add new shape based on active tool (Rectangle or Circle)
            if (activeTool) {
                let newShape = null;
                if (activeTool === 'rectangle') {
                    newShape = {
                        id: (0, uuid_1.v4)(),
                        type: 'rectangle',
                        x: pointerPosition.x,
                        y: pointerPosition.y,
                        width: 100,
                        height: 100,
                        title: 'New Zone',
                        description: '',
                        fill: activeColor
                    };
                }
                else if (activeTool === 'circle') {
                    newShape = {
                        id: (0, uuid_1.v4)(),
                        type: 'circle',
                        x: pointerPosition.x,
                        y: pointerPosition.y,
                        radius: 50,
                        title: 'New Circle Zone',
                        description: '',
                        fill: activeColor
                    };
                }
                else if (activeTool === 'triangle') {
                    newShape = {
                        id: (0, uuid_1.v4)(),
                        type: 'polygon',
                        x: 0,
                        y: 0,
                        points: [
                            pointerPosition.x, pointerPosition.y - 50,
                            pointerPosition.x + 50, pointerPosition.y + 36,
                            pointerPosition.x - 50, pointerPosition.y + 36
                        ],
                        title: 'New Triangle Zone',
                        description: '',
                        fill: activeColor
                    };
                }
                else if (activeTool === 'objective-40mm' || activeTool === 'objective-32mm') {
                    const diameter = activeTool === 'objective-40mm' ? 40 : 32;
                    newShape = {
                        id: (0, uuid_1.v4)(),
                        type: 'circle',
                        x: pointerPosition.x,
                        y: pointerPosition.y,
                        radius: (0, map_math_1.mmToPixels)(diameter / 2),
                        title: `Objective ${diameter}mm`,
                        description: '',
                        fill: 'rgba(140, 140, 140, 0.4)' // Objectives are always Grey
                    };
                }
                if (newShape) {
                    dispatch({ type: 'ADD_SHAPE', payload: newShape });
                    setActiveTool(null); // Reset tool after use
                    setSelectedShapeId(newShape.id);
                }
            }
        }
    };
    const colors = [
        { label: 'Blue', value: 'rgba(22, 119, 255, 0.4)', stroke: 'rgba(22, 119, 255, 1)' },
        { label: 'Green', value: 'rgba(82, 196, 26, 0.4)', stroke: 'rgba(82, 196, 26, 1)' },
        { label: 'Red', value: 'rgba(245, 34, 45, 0.4)', stroke: 'rgba(245, 34, 45, 1)' },
        { label: 'Grey', value: 'rgba(140, 140, 140, 0.4)', stroke: 'rgba(140, 140, 140, 1)' }
    ];
    const handleColorSelect = (colorValue) => {
        setActiveColor(colorValue);
        if (selectedShapeId) {
            dispatch({ type: 'UPDATE_SHAPE', payload: { id: selectedShapeId, fill: colorValue } });
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }, children: [!readonly && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, padding: 8, background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: 8, alignItems: 'center', flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 4, marginRight: 16, borderRight: '1px solid #ccc', paddingRight: 16 }, children: colors.map(c => ((0, jsx_runtime_1.jsx)("div", { onClick: () => handleColorSelect(c.value), style: {
                                width: 24,
                                height: 24,
                                backgroundColor: c.value,
                                border: activeColor === c.value ? `2px solid ${c.stroke}` : '1px solid #ccc',
                                borderRadius: 4,
                                cursor: 'pointer',
                                title: c.label
                            } }, c.label))) }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTool('rectangle'), style: { fontWeight: activeTool === 'rectangle' ? 'bold' : 'normal' }, children: "Add Zone (Rectangle)" }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTool('circle'), style: { fontWeight: activeTool === 'circle' ? 'bold' : 'normal' }, children: "Add Circle Zone" }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTool('triangle'), style: { fontWeight: activeTool === 'triangle' ? 'bold' : 'normal' }, children: "Add Triangle Zone" }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTool('objective-32mm'), style: { fontWeight: activeTool === 'objective-32mm' ? 'bold' : 'normal' }, children: "Add 32mm Objective" }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTool('objective-40mm'), style: { fontWeight: activeTool === 'objective-40mm' ? 'bold' : 'normal' }, children: "Add 40mm Objective" }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                            setActiveTool('polygon');
                            setDraftPolygonPoints([]);
                            setSelectedShapeId(null);
                        }, style: { fontWeight: activeTool === 'polygon' ? 'bold' : 'normal' }, children: "Draw Polygon" }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: () => dispatch({ type: 'TOGGLE_LOCK' }), children: state.isLocked ? 'Unlock Map' : 'Lock Map' }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1 } }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                            if (onSave) {
                                onSave(JSON.stringify({ ...state, arrows: allArrows }));
                            }
                        }, style: { background: '#1677ff', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 4 }, children: "Save Map" }, void 0)] }, void 0)), (0, jsx_runtime_1.jsx)("div", { ref: containerRef, style: { flex: 1, border: '2px solid #333', overflow: 'hidden', background: '#e6e6e6', display: 'flex', justifyContent: 'center', alignItems: 'center' }, children: (0, jsx_runtime_1.jsxs)(react_konva_1.Stage, { width: boardWidthPx * scale, height: boardHeightPx * scale, scaleX: scale, scaleY: scale, onClick: handleStageClick, style: { background: '#fff' }, children: [(0, jsx_runtime_1.jsx)(GridLayer_1.default, { width: boardWidthPx, height: boardHeightPx }, void 0), (0, jsx_runtime_1.jsx)(ShapeLayer_1.default, { shapes: state.shapes, arrows: allArrows, isLocked: readonly || state.isLocked, onUpdateShape: (payload) => dispatch({ type: 'UPDATE_SHAPE', payload }), selectedShapeId: readonly ? null : selectedShapeId, onSelectShape: readonly ? () => { } : setSelectedShapeId }, void 0), draftPolygonPoints.length > 0 && ((0, jsx_runtime_1.jsxs)(react_konva_1.Layer, { children: [(0, jsx_runtime_1.jsx)(react_konva_1.Line, { points: draftPolygonPoints, stroke: "#1677ff", strokeWidth: 2, dash: [5, 5] }, void 0), (0, jsx_runtime_1.jsx)(react_konva_1.Circle, { x: draftPolygonPoints[0], y: draftPolygonPoints[1], radius: 6, fill: "#1677ff" }, void 0)] }, void 0))] }, void 0) }, void 0)] }, void 0));
}
exports.default = MapCanvas;
//# sourceMappingURL=MapCanvas.js.map