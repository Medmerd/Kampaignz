import React, { useRef, useEffect } from 'react';
import { Layer, Rect, Circle, Line, Text, Arrow, Transformer, Label, Tag } from 'react-konva';
import { MapShape, MapArrow } from '../../state/map-reducer';
import { snapBoxToGrid, snapToGrid } from '../../utils/map-snapping';
import { PIXELS_PER_INCH } from '../../utils/map-math';

interface ShapeLayerProps {
    shapes: MapShape[];
    arrows: MapArrow[];
    isLocked: boolean;
    onUpdateShape: (updatedShape: Partial<MapShape> & { id: string }) => void;
    selectedShapeId: string | null;
    onSelectShape: (id: string | null) => void;
}

export default function ShapeLayer({ 
    shapes, 
    arrows, 
    isLocked, 
    onUpdateShape,
    selectedShapeId,
    onSelectShape
}: ShapeLayerProps) {
    const trRef = useRef<any>(null);
    const shapeRefs = useRef<{ [key: string]: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }>({});

    useEffect(() => {
        if (selectedShapeId && !isLocked) {
            const node = shapeRefs.current[selectedShapeId];
            if (node) {
                trRef.current?.nodes([node]);
                trRef.current?.getLayer().batchDraw();
            } else {
                trRef.current?.nodes([]);
            }
        } else {
            trRef.current?.nodes([]);
        }
    }, [selectedShapeId, isLocked]);

    const handleDragEnd = (e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, shape: MapShape) => {
        if (isLocked) return;
        
        let newX = e.target.x();
        let newY = e.target.y();

        // Check if Shift is held to disable snapping
        const isShiftHeld = e.evt?.shiftKey;

        if (!isShiftHeld) {
            if (shape.type === 'rectangle') {
                const snappedBox = snapBoxToGrid({
                    x: newX,
                    y: newY,
                    width: shape.width || 0,
                    height: shape.height || 0
                });
                newX = snappedBox.x;
                newY = snappedBox.y;
            } else if (shape.type === 'circle' || shape.type === 'polygon') {
                // For circles and polygons, snap their primary x,y coordinate to the grid
                const snapped = snapToGrid({ x: newX, y: newY });
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

    return (
        <Layer>
            {/* Draw Shapes */}
            {shapes.map((shape) => {
                const isSelected = shape.id === selectedShapeId;
                const commonProps = {
                    key: shape.id,
                    x: shape.x,
                    y: shape.y,
                    draggable: !isLocked,
                    onClick: () => onSelectShape(shape.id),
                    onTap: () => onSelectShape(shape.id),
                    onDragEnd: (e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => handleDragEnd(e, shape),
                    stroke: isSelected && shape.type !== 'rectangle' ? '#1677ff' : '#424242',
                    strokeWidth: isSelected && shape.type !== 'rectangle' ? 3 : 1,
                    fill: shape.fill || 'rgba(255, 255, 255, 0.1)',
                };

                if (shape.type === 'rectangle') {
                    return (
                        <Rect
                            {...commonProps}
                            ref={(node) => { shapeRefs.current[shape.id] = node; }}
                            name="rectangle"
                            width={shape.width || 50}
                            height={shape.height || 50}
                            stroke={isSelected ? '#1677ff' : '#424242'}
                            strokeWidth={isSelected ? 3 : 1}
                            onTransformEnd={() => {
                                const node = shapeRefs.current[shape.id];
                                const scaleX = node.scaleX();
                                const scaleY = node.scaleY();

                                node.scaleX(1);
                                node.scaleY(1);
                                
                                const newWidth = Math.max(5, node.width() * scaleX);
                                const newHeight = Math.max(5, node.height() * scaleY);
                                
                                const snappedWidth = Math.round(newWidth / PIXELS_PER_INCH) * PIXELS_PER_INCH || PIXELS_PER_INCH;
                                const snappedHeight = Math.round(newHeight / PIXELS_PER_INCH) * PIXELS_PER_INCH || PIXELS_PER_INCH;

                                const snappedBox = snapBoxToGrid({
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
                            }}
                        />
                    );
                }

                if (shape.type === 'circle') {
                    return (
                        <Circle
                            {...commonProps}
                            ref={(node) => { shapeRefs.current[shape.id] = node; }}
                            name="circle"
                            radius={shape.radius || 20}
                            onTransformEnd={() => {
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
                            }}
                        />
                    );
                }

                if (shape.type === 'polygon' && shape.points) {
                    return (
                        <Line
                            {...commonProps}
                            ref={(node) => { shapeRefs.current[shape.id] = node; }}
                            name="polygon"
                            points={shape.points}
                            closed
                            onTransformEnd={() => {
                                const node = shapeRefs.current[shape.id];
                                const scaleX = node.scaleX();
                                const scaleY = node.scaleY();
                                node.scaleX(1);
                                node.scaleY(1);

                                const newPoints = (shape.points || []).map((p, i) => {
                                    return i % 2 === 0 ? p * scaleX : p * scaleY;
                                });

                                onUpdateShape({
                                    id: shape.id,
                                    x: node.x(),
                                    y: node.y(),
                                    points: newPoints
                                });
                            }}
                        />
                    );
                }

                return null;
            })}

            {!isLocked && (
                <Transformer
                    ref={trRef}
                    keepRatio={false}
                    enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < PIXELS_PER_INCH || newBox.height < PIXELS_PER_INCH) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}

            {/* Draw Map Title/Descriptions inside selected shapes (Optional enhancement) */}
            
            {/* Draw Auto Arrows (only if unlocked to avoid visual clutter during actual play, or depending on preference) */}
            {arrows.map((arrow) => (
                <React.Fragment key={arrow.id}>
                    <Arrow
                        points={arrow.points}
                        stroke="black"
                        fill="black"
                        strokeWidth={2}
                        pointerLength={10}
                        pointerWidth={10}
                        dash={[4, 4]}
                    />
                    <Label
                        x={(arrow.points[0] + arrow.points[2]) / 2}
                        y={(arrow.points[1] + arrow.points[3]) / 2}
                        offsetX={15}
                        offsetY={10}
                    >
                        <Tag fill="white" cornerRadius={4} shadowColor="black" shadowBlur={2} shadowOpacity={0.2} shadowOffset={{x: 1, y: 1}} />
                        <Text
                            text={arrow.label}
                            fill="black"
                            fontSize={14}
                            fontStyle="bold"
                            padding={4}
                        />
                    </Label>
                </React.Fragment>
            ))}
        </Layer>
    );
}
