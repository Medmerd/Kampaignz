import { describe, it, expect } from 'vitest';
import { mapReducer, initialMapState, MapAction, MapShape } from '../../../src/renderer/state/map-reducer';

describe('Map Reducer', () => {
    it('should add a shape to the map', () => {
        const newShape: MapShape = {
            id: 'shape-1',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            title: 'Deployment Zone',
            description: 'Red team'
        };

        const action: MapAction = { type: 'ADD_SHAPE', payload: newShape };
        const state = mapReducer(initialMapState, action);

        expect(state.shapes.length).toBe(1);
        expect(state.shapes[0]).toEqual(newShape);
    });

    it('should toggle map lock status', () => {
        expect(initialMapState.isLocked).toBe(false);

        const action: MapAction = { type: 'TOGGLE_LOCK' };
        const state = mapReducer(initialMapState, action);

        expect(state.isLocked).toBe(true);

        const state2 = mapReducer(state, action);
        expect(state2.isLocked).toBe(false);
    });

    it('should update a shape in the map', () => {
        const shape: MapShape = { id: 's1', type: 'circle', x: 10, y: 10, title: 'Old', description: '' };
        const initialState = { ...initialMapState, shapes: [shape] };

        const action: MapAction = { 
            type: 'UPDATE_SHAPE', 
            payload: { id: 's1', x: 20, y: 30, title: 'New' } 
        };
        const nextState = mapReducer(initialState, action);

        expect(nextState.shapes[0].x).toBe(20);
        expect(nextState.shapes[0].y).toBe(30);
        expect(nextState.shapes[0].title).toBe('New');
        expect(nextState.shapes[0].type).toBe('circle'); // Should preserve un-updated fields
    });
});
