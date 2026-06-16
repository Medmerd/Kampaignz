"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const player_repo_1 = require("../../src/main/repositories/player-repo");
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
const army_rules_repo_1 = require("../../src/main/repositories/army-rules-repo");
const baseInput = {
    playerName: 'Alice',
    army_rule_id: null,
    notes: 'Ready',
    config: '{"points":1000}',
};
(0, vitest_1.describe)('player-repo', () => {
    let campaignId;
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
        const campaign = await (0, campaign_repo_1.createCampaign)('Test Campaign');
        campaignId = campaign.id;
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('lists players', async () => {
        const p1 = await (0, player_repo_1.createPlayer)(campaignId, baseInput);
        const p2 = await (0, player_repo_1.createPlayer)(campaignId, { ...baseInput, playerName: 'Bob' });
        const list = await (0, player_repo_1.listPlayersByCampaign)(campaignId);
        (0, vitest_1.expect)(list).toHaveLength(2);
        (0, vitest_1.expect)(list[0].id).toBe(p2.id);
        (0, vitest_1.expect)(list[1].id).toBe(p1.id);
    });
    (0, vitest_1.it)('creates a player and returns row', async () => {
        const armyBook = await (0, army_rules_repo_1.createArmyRulebook)(campaignId, { name: 'Lions', description: '' });
        const player = await (0, player_repo_1.createPlayer)(campaignId, { ...baseInput, army_rule_id: armyBook.id });
        (0, vitest_1.expect)(player.playerName).toBe('Alice');
        (0, vitest_1.expect)(player.army_rule_id).toBe(armyBook.id);
        (0, vitest_1.expect)(player.army_rule_name).toBe('Lions');
        (0, vitest_1.expect)(player.config).toBe('{"points":1000}');
        (0, vitest_1.expect)(player.id).toBeDefined();
    });
    (0, vitest_1.it)('updates a player and returns row', async () => {
        const armyBook1 = await (0, army_rules_repo_1.createArmyRulebook)(campaignId, { name: 'Lions', description: '' });
        const armyBook2 = await (0, army_rules_repo_1.createArmyRulebook)(campaignId, { name: 'Wolves', description: '' });
        const player = await (0, player_repo_1.createPlayer)(campaignId, { ...baseInput, army_rule_id: armyBook1.id });
        const updated = await (0, player_repo_1.updatePlayer)(player.id, {
            playerName: 'Bob',
            army_rule_id: armyBook2.id,
            notes: 'Updated',
            config: '{"points":1500}',
        });
        (0, vitest_1.expect)(updated.playerName).toBe('Bob');
        (0, vitest_1.expect)(updated.army_rule_id).toBe(armyBook2.id);
        (0, vitest_1.expect)(updated.army_rule_name).toBe('Wolves');
        (0, vitest_1.expect)(updated.config).toBe('{"points":1500}');
    });
    (0, vitest_1.it)('validates player input', async () => {
        await (0, vitest_1.expect)((0, player_repo_1.createPlayer)(campaignId, { ...baseInput, playerName: '   ' })).rejects.toThrow('Player name is required.');
    });
});
//# sourceMappingURL=player-repo.test.js.map