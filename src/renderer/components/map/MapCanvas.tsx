import React, { useState, useReducer, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import GridLayer from './GridLayer';
import ShapeLayer from './ShapeLayer';
import { mapReducer, initialMapState, MapShape, MapArrow } from '../../state/map-reducer';
import { calculatePositioningArrows } from '../../utils/map-arrows';
import { v4 as uuidv4 } from 'uuid';
import { mmToPixels, PIXELS_PER_INCH } from '../../utils/map-math';
import { snapToGrid } from '../../utils/map-snapping';

interface MapCanvasProps {
    boardWidthInches?: number;
    boardHeightInches?: number;
    initialMapJson?: string;
    readonly?: boolean;
    onSave?: (mapJson: string) => void;
}

export default function MapCanvas({ 
    boardWidthInches = 60, 
    boardHeightInches = 44,
    initialMapJson,
    readonly = false,
    onSave
}: MapCanvasProps) {
    const initializeState = () => {
        if (initialMapJson) {
            try {
                const parsed = JSON.parse(initialMapJson);
                return { ...initialMapState, ...parsed };
            } catch (e) {
                console.error("Failed to parse map JSON", e);
            }
        }
        return initialMapState;
    };

    const [state, dispatch] = useReducer(mapReducer, undefined, initializeState);
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [draftPolygonPoints, setDraftPolygonPoints] = useState<number[]>([]);
    const [activeColor, setActiveColor] = useState<string>('rgba(22, 119, 255, 0.4)');
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const boardWidthPx = boardWidthInches * PIXELS_PER_INCH;
    const boardHeightPx = boardHeightInches * PIXELS_PER_INCH;

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            const scaleX = width / boardWidthPx;
            const scaleY = height / boardHeightPx;
            setScale(Math.min(scaleX, scaleY));
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [boardWidthPx, boardHeightPx]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (readonly) return;
            if ((e.key === 'Backspace' || e.key === 'Delete') && selectedShapeId && !state.isLocked) {
                dispatch({ type: 'DELETE_SHAPE', payload: { id: selectedShapeId } });
                setSelectedShapeId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedShapeId, state.isLocked, dispatch, readonly]);

    const allArrows = state.shapes.flatMap(shape => 
        calculatePositioningArrows(shape, boardWidthPx, boardHeightPx)
    );

    // Handle tool interactions (clicking the canvas to place a shape)
    const handleStageClick = (e: any) => {
        if (readonly) return;
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();
        if (!pointerPosition) return;

        // Polygon drawing logic
        if (activeTool === 'polygon') {
            if (draftPolygonPoints.length > 2) {
                // Check if click is close to starting point to close polygon
                const startX = draftPolygonPoints[0];
                const startY = draftPolygonPoints[1];
                const dist = Math.sqrt(
                    Math.pow(pointerPosition.x - startX, 2) + 
                    Math.pow(pointerPosition.y - startY, 2)
                );
                
                if (dist < 20) { // snap-to-close distance
                    const newShape: MapShape = {
                        id: uuidv4(),
                        type: 'polygon',
                        x: 0, // for polygon we use absolute points
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
                const snapped = snapToGrid({ x: pX, y: pY });
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
                    let newShape: MapShape | null = null;
                    
                    if (activeTool === 'rectangle') {
                        newShape = {
                            id: uuidv4(),
                            type: 'rectangle',
                            x: pointerPosition.x,
                            y: pointerPosition.y,
                            width: 100, // Default 5x5 inches
                            height: 100,
                            title: 'New Zone',
                            description: '',
                            fill: activeColor
                        };
                    } else if (activeTool === 'circle') {
                        newShape = {
                            id: uuidv4(),
                            type: 'circle',
                            x: pointerPosition.x,
                            y: pointerPosition.y,
                            radius: 50, // 5 inches
                            title: 'New Circle Zone',
                            description: '',
                            fill: activeColor
                        };
                    } else if (activeTool === 'triangle') {
                        newShape = {
                            id: uuidv4(),
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
                    } else if (activeTool === 'objective-40mm' || activeTool === 'objective-32mm') {
                        const diameter = activeTool === 'objective-40mm' ? 40 : 32;
                        newShape = {
                            id: uuidv4(),
                            type: 'circle',
                            x: pointerPosition.x,
                            y: pointerPosition.y,
                            radius: mmToPixels(diameter / 2),
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

    const handleColorSelect = (colorValue: string) => {
        setActiveColor(colorValue);
        if (selectedShapeId) {
            dispatch({ type: 'UPDATE_SHAPE', payload: { id: selectedShapeId, fill: colorValue } });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
            {/* Extremely simple MapToolbar integrated directly for testing MVP */}
            {!readonly && (
            <div style={{ display: 'flex', gap: 8, padding: 8, background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 4, marginRight: 16, borderRight: '1px solid #ccc', paddingRight: 16 }}>
                    {colors.map(c => (
                        <div 
                            key={c.label}
                            onClick={() => handleColorSelect(c.value)}
                            title={c.label}
                            style={{ 
                                width: 24, 
                                height: 24, 
                                backgroundColor: c.value, 
                                border: activeColor === c.value ? `2px solid ${c.stroke}` : '1px solid #ccc',
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
                <button 
                    onClick={() => setActiveTool('rectangle')} 
                    style={{ fontWeight: activeTool === 'rectangle' ? 'bold' : 'normal' }}
                >
                    Add Zone (Rectangle)
                </button>
                <button 
                    onClick={() => setActiveTool('circle')} 
                    style={{ fontWeight: activeTool === 'circle' ? 'bold' : 'normal' }}
                >
                    Add Circle Zone
                </button>
                <button 
                    onClick={() => setActiveTool('triangle')} 
                    style={{ fontWeight: activeTool === 'triangle' ? 'bold' : 'normal' }}
                >
                    Add Triangle Zone
                </button>
                <button 
                    onClick={() => setActiveTool('objective-32mm')}
                    style={{ fontWeight: activeTool === 'objective-32mm' ? 'bold' : 'normal' }}
                >
                    Add 32mm Objective
                </button>
                <button 
                    onClick={() => setActiveTool('objective-40mm')}
                    style={{ fontWeight: activeTool === 'objective-40mm' ? 'bold' : 'normal' }}
                >
                    Add 40mm Objective
                </button>
                <button 
                    onClick={() => {
                        setActiveTool('polygon');
                        setDraftPolygonPoints([]);
                        setSelectedShapeId(null);
                    }}
                    style={{ fontWeight: activeTool === 'polygon' ? 'bold' : 'normal' }}
                >
                    Draw Polygon
                </button>
                <button onClick={() => dispatch({ type: 'TOGGLE_LOCK' })}>
                    {state.isLocked ? 'Unlock Map' : 'Lock Map'}
                </button>
                <div style={{ flex: 1 }} />
                <button 
                    onClick={() => {
                        if (onSave) {
                            onSave(JSON.stringify({ ...state, arrows: allArrows }));
                        }
                    }}
                    style={{ background: '#1677ff', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 4 }}
                >
                    Save Map
                </button>
            </div>
            )}

            <div ref={containerRef} style={{ flex: 1, border: '2px solid #333', overflow: 'hidden', background: '#e6e6e6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Stage 
                    width={boardWidthPx * scale} 
                    height={boardHeightPx * scale} 
                    scaleX={scale}
                    scaleY={scale}
                    onClick={handleStageClick}
                    style={{ background: '#fff' }}
                >
                    <GridLayer width={boardWidthPx} height={boardHeightPx} />
                    <ShapeLayer 
                        shapes={state.shapes} 
                        arrows={allArrows} 
                        isLocked={readonly || state.isLocked}
                        onUpdateShape={(payload) => dispatch({ type: 'UPDATE_SHAPE', payload })}
                        selectedShapeId={readonly ? null : selectedShapeId}
                        onSelectShape={readonly ? () => {} : setSelectedShapeId}
                    />
                    {/* Render draft polygon while drawing */}
                    {draftPolygonPoints.length > 0 && (
                        <Layer>
                            <Line 
                                points={draftPolygonPoints} 
                                stroke="#1677ff" 
                                strokeWidth={2} 
                                dash={[5, 5]} 
                            />
                            {/* Highlight the starting point for closing */}
                            <Circle 
                                x={draftPolygonPoints[0]} 
                                y={draftPolygonPoints[1]} 
                                radius={6} 
                                fill="#1677ff" 
                            />
                        </Layer>
                    )}
                </Stage>
            </div>
        </div>
    );
}
