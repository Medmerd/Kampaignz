"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapReducer = exports.initialMapState = void 0;
exports.initialMapState = {
    shapes: [],
    arrows: [],
    isLocked: false,
};
function mapReducer(state, action) {
    switch (action.type) {
        case 'ADD_SHAPE':
            return {
                ...state,
                shapes: [...state.shapes, action.payload]
            };
        case 'UPDATE_SHAPE':
            return {
                ...state,
                shapes: state.shapes.map(shape => shape.id === action.payload.id
                    ? { ...shape, ...action.payload }
                    : shape)
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
exports.mapReducer = mapReducer;
//# sourceMappingURL=map-reducer.js.map