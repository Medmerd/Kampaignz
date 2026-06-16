import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import knex, { Knex } from 'knex';
import { ingestData } from '../ingestor';
import { ParsedData } from '../types';

describe('Database Ingestor', () => {
  let db: Knex;

  const createEmptyData = (): ParsedData => ({
    game_systems: [], game_catalogues: [], game_categories: [], game_selections: [], game_selection_groups: [],
    game_profiles: [], game_characteristics: [], 
    game_category_links: [], game_entry_links: [], game_info_links: [],
    game_cost_types: [], game_profile_types: [], game_characteristic_types: [],
    game_rules: [], game_info_groups: [], game_publications: [], game_costs: [],
    game_constraints: [], game_force_entries: [], game_catalogue_links: [],
    game_modifiers: [], game_modifier_groups: [], game_conditions: [], game_condition_groups: []
  });

  beforeAll(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });
    await db.migrate.latest({ directory: path.resolve(__dirname, '../../../migrations') });
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should clear old versions and insert new game systems', async () => {
    // 1. Initial Insert
    const dataV1: ParsedData = {
      ...createEmptyData(),
      game_systems: [{ id: 'sys-1', name: 'Test', revision: 1 }],
      game_categories: [{ id: 'cat-1', game_system_id: 'sys-1', revision: 1, catalogue_id: null, name: 'Char' }]
    };

    await ingestData(db, dataV1);

    const sys1 = await db('game_system').where({ id: 'sys-1' }).first();
    expect(sys1.name).toBe('Test');
    const cat1 = await db('game_category').where({ id: 'cat-1' }).first();
    expect(cat1.name).toBe('Char');

    // 2. Upload same revision but missing category (Simulate DELETE logic)
    const dataV1Update: ParsedData = {
      ...createEmptyData(),
      game_systems: [{ id: 'sys-1', name: 'Test Updated', revision: 1 }],
      game_categories: [], // Empty, meaning it was removed
    };

    await ingestData(db, dataV1Update);

    const sys1Updated = await db('game_system').where({ id: 'sys-1' }).first();
    expect(sys1Updated.name).toBe('Test Updated');

    // The category should be deleted because it belonged to this system and revision
    const catsAfterUpdate = await db('game_category').where({ game_system_id: 'sys-1', revision: 1 });
    expect(catsAfterUpdate).toHaveLength(0);
  });

  it('should isolate catalogue deletions from game system and other catalogues', async () => {
    // 1. Setup system and one catalogue
    const dataInitial: ParsedData = {
      ...createEmptyData(),
      game_systems: [{ id: 'sys-2', name: 'Core', revision: 1 }],
      game_catalogues: [
        { id: 'catlg-1', game_system_id: 'sys-2', revision: 1, name: 'Faction A' }
      ],
      game_categories: [
        // System level
        { id: 'cat-core', game_system_id: 'sys-2', revision: 1, catalogue_id: null, name: 'Core Cat' },
        // Catalogue level
        { id: 'cat-fac', game_system_id: 'sys-2', revision: 1, catalogue_id: 'catlg-1', name: 'Faction Cat' }
      ]
    };
    await ingestData(db, dataInitial);

    // 2. Upload a new catalogue B
    const dataCatB: ParsedData = {
      ...createEmptyData(),
      game_catalogues: [
        { id: 'catlg-2', game_system_id: 'sys-2', revision: 1, name: 'Faction B' }
      ],
      game_categories: [
        { id: 'cat-facB', game_system_id: 'sys-2', revision: 1, catalogue_id: 'catlg-2', name: 'Faction B Cat' }
      ]
    };
    await ingestData(db, dataCatB);

    // Expect Core and Faction A to be untouched
    const coreCats = await db('game_category').where({ id: 'cat-core' });
    expect(coreCats).toHaveLength(1);
    
    const facACats = await db('game_category').where({ id: 'cat-fac' });
    expect(facACats).toHaveLength(1);

    // 3. Re-upload Faction A, effectively deleting its categories
    const dataCatAUpdate: ParsedData = {
      ...createEmptyData(),
      game_catalogues: [
        { id: 'catlg-1', game_system_id: 'sys-2', revision: 1, name: 'Faction A' }
      ],
      game_categories: [] // empty, so cat-fac should be deleted
    };
    await ingestData(db, dataCatAUpdate);

    // Check
    const facAAfterUpdate = await db('game_category').where({ id: 'cat-fac' });
    expect(facAAfterUpdate).toHaveLength(0); // successfully wiped
    
    // Core and Faction B should remain
    const coreAfterUpdate = await db('game_category').where({ id: 'cat-core' });
    expect(coreAfterUpdate).toHaveLength(1);
    const facBAfterUpdate = await db('game_category').where({ id: 'cat-facB' });
    expect(facBAfterUpdate).toHaveLength(1);
  });
});
