export type ShapeType = 'rectangle' | 'circle' | 'polygon';

export interface MapShape {
    id: string;
    type: ShapeType;
    x: number;
    y: number;
    width?: number; // for rect
    height?: number; // for rect
    radius?: number; // for circle
    points?: number[]; // for polygon
    title: string;
    description: string;
    fill?: string;
}

export interface MapArrow {
    id: string;
    points: [number, number, number, number]; // [x1, y1, x2, y2]
    label: string; // e.g. "12 inches"
}

export interface MapState {
    shapes: MapShape[];
    arrows: MapArrow[];
    isLocked: boolean;
}

export const initialMapState: MapState = {
    shapes: [],
    arrows: [],
    isLocked: false,
};

export type MapAction =
    | { type: 'ADD_SHAPE'; payload: MapShape }
    | { type: 'UPDATE_SHAPE'; payload: Partial<MapShape> & { id: string } }
    | { type: 'DELETE_SHAPE'; payload: { id: string } }
    | { type: 'LOAD_STATE'; payload: MapState }
    | { type: 'TOGGLE_LOCK' };

export function mapReducer(state: MapState, action: MapAction): MapState {
    switch (action.type) {
        case 'ADD_SHAPE':
            return {
                ...state,
                shapes: [...state.shapes, action.payload]
            };
        case 'UPDATE_SHAPE':
            return {
                ...state,
                shapes: state.shapes.map(shape => 
                    shape.id === action.payload.id 
                        ? { ...shape, ...action.payload } 
                        : shape
                )
            };
        case 'DELETE_SHAPE':
            return {
                ...state,
                shapes: state.shapes.filter(shape => shape.id !== action.payload.id)
            };
        case 'LOAD_STATE':
            return action.payload;
        case 'TOGGLE_LOCK':
            return {
                ...state,
                isLocked: !state.isLocked
            };
        default:
            return state;
    }
}
