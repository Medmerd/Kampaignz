"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_path_1 = __importDefault(require("node:path"));
const knex_1 = __importDefault(require("knex"));
const ingestor_1 = require("../ingestor");
(0, vitest_1.describe)('Database Ingestor', () => {
    let db;
    (0, vitest_1.beforeAll)(async () => {
        db = (0, knex_1.default)({
            client: 'sqlite3',
            connection: ':memory:',
            useNullAsDefault: true,
        });
        await db.migrate.latest({ directory: node_path_1.default.resolve(__dirname, '../../../migrations') });
    });
    (0, vitest_1.afterAll)(async () => {
        await db.destroy();
    });
    (0, vitest_1.it)('should clear old versions and insert new game systems', async () => {
        // 1. Initial Insert
        const dataV1 = {
            game_systems: [{ id: 'sys-1', name: 'Test', revision: 1 }],
            game_catalogues: [],
            game_categories: [{ id: 'cat-1', game_system_id: 'sys-1', revision: 1, catalogue_id: null, name: 'Char' }],
            game_selections: [],
            game_profiles: [],
            game_characteristics: [],
            game_links: []
        };
        await (0, ingestor_1.ingestData)(db, dataV1);
        const sys1 = await db('game_system').where({ id: 'sys-1' }).first();
        (0, vitest_1.expect)(sys1.name).toBe('Test');
        const cat1 = await db('game_category').where({ id: 'cat-1' }).first();
        (0, vitest_1.expect)(cat1.name).toBe('Char');
        // 2. Upload same revision but missing category (Simulate DELETE logic)
        const dataV1Update = {
            game_systems: [{ id: 'sys-1', name: 'Test Updated', revision: 1 }],
            game_catalogues: [],
            game_categories: [],
            game_selections: [],
            game_profiles: [],
            game_characteristics: [],
            game_links: []
        };
        await (0, ingestor_1.ingestData)(db, dataV1Update);
        const sys1Updated = await db('game_system').where({ id: 'sys-1' }).first();
        (0, vitest_1.expect)(sys1Updated.name).toBe('Test Updated');
        // The category should be deleted because it belonged to this system and revision
        const catsAfterUpdate = await db('game_category').where({ game_system_id: 'sys-1', revision: 1 });
        (0, vitest_1.expect)(catsAfterUpdate).toHaveLength(0);
    });
    (0, vitest_1.it)('should isolate catalogue deletions from game system and other catalogues', async () => {
        // 1. Setup system and one catalogue
        const dataInitial = {
            game_systems: [{ id: 'sys-2', name: 'Core', revision: 1 }],
            game_catalogues: [
                { id: 'catlg-1', game_system_id: 'sys-2', revision: 1, name: 'Faction A' }
            ],
            game_categories: [
                // System level
                { id: 'cat-core', game_system_id: 'sys-2', revision: 1, catalogue_id: null, name: 'Core Cat' },
                // Catalogue level
                { id: 'cat-fac', game_system_id: 'sys-2', revision: 1, catalogue_id: 'catlg-1', name: 'Faction Cat' }
            ],
            game_selections: [],
            game_profiles: [],
            game_characteristics: [],
            game_links: []
        };
        await (0, ingestor_1.ingestData)(db, dataInitial);
        // 2. Upload a new catalogue B
        const dataCatB = {
            game_systems: [],
            game_catalogues: [
                { id: 'catlg-2', game_system_id: 'sys-2', revision: 1, name: 'Faction B' }
            ],
            game_categories: [
                { id: 'cat-facB', game_system_id: 'sys-2', revision: 1, catalogue_id: 'catlg-2', name: 'Faction B Cat' }
            ],
            game_selections: [],
            game_profiles: [],
            game_characteristics: [],
            game_links: []
        };
        await (0, ingestor_1.ingestData)(db, dataCatB);
        // Expect Core and Faction A to be untouched
        const coreCats = await db('game_category').where({ id: 'cat-core' });
        (0, vitest_1.expect)(coreCats).toHaveLength(1);
        const facACats = await db('game_category').where({ id: 'cat-fac' });
        (0, vitest_1.expect)(facACats).toHaveLength(1);
        // 3. Re-upload Faction A, effectively deleting its categories
        const dataCatAUpdate = {
            game_systems: [],
            game_catalogues: [
                { id: 'catlg-1', game_system_id: 'sys-2', revision: 1, name: 'Faction A' }
            ],
            game_categories: [],
            game_selections: [],
            game_profiles: [],
            game_characteristics: [],
            game_links: []
        };
        await (0, ingestor_1.ingestData)(db, dataCatAUpdate);
        // Check
        const facAAfterUpdate = await db('game_category').where({ id: 'cat-fac' });
        (0, vitest_1.expect)(facAAfterUpdate).toHaveLength(0); // successfully wiped
        // Core and Faction B should remain
        const coreAfterUpdate = await db('game_category').where({ id: 'cat-core' });
        (0, vitest_1.expect)(coreAfterUpdate).toHaveLength(1);
        const facBAfterUpdate = await db('game_category').where({ id: 'cat-facB' });
        (0, vitest_1.expect)(facBAfterUpdate).toHaveLength(1);
    });
});
//# sourceMappingURL=ingestor.test.js.map