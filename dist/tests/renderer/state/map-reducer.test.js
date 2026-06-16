"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const map_reducer_1 = require("../../../src/renderer/state/map-reducer");
(0, vitest_1.describe)('Map Reducer', () => {
    (0, vitest_1.it)('should add a shape to the map', () => {
        const newShape = {
            id: 'shape-1',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            title: 'Deployment Zone',
            description: 'Red team'
        };
        const action = { type: 'ADD_SHAPE', payload: newShape };
        const state = (0, map_reducer_1.mapReducer)(map_reducer_1.initialMapState, action);
        (0, vitest_1.expect)(state.shapes.length).toBe(1);
        (0, vitest_1.expect)(state.shapes[0]).toEqual(newShape);
    });
    (0, vitest_1.it)('should toggle map lock status', () => {
        (0, vitest_1.expect)(map_reducer_1.initialMapState.isLocked).toBe(false);
        const action = { type: 'TOGGLE_LOCK' };
        const state = (0, map_reducer_1.mapReducer)(map_reducer_1.initialMapState, action);
        (0, vitest_1.expect)(state.isLocked).toBe(true);
        const state2 = (0, map_reducer_1.mapReducer)(state, action);
        (0, vitest_1.expect)(state2.isLocked).toBe(false);
    });
    (0, vitest_1.it)('should update a shape in the map', () => {
        const shape = { id: 's1', type: 'circle', x: 10, y: 10, title: 'Old', description: '' };
        const initialState = { ...map_reducer_1.initialMapState, shapes: [shape] };
        const action = {
            type: 'UPDATE_SHAPE',
            payload: { id: 's1', x: 20, y: 30, title: 'New' }
        };
        const nextState = (0, map_reducer_1.mapReducer)(initialState, action);
        (0, vitest_1.expect)(nextState.shapes[0].x).toBe(20);
        (0, vitest_1.expect)(nextState.shapes[0].y).toBe(30);
        (0, vitest_1.expect)(nextState.shapes[0].title).toBe('New');
        (0, vitest_1.expect)(nextState.shapes[0].type).toBe('circle'); // Should preserve un-updated fields
    });
});
//# sourceMappingURL=map-reducer.test.js.map