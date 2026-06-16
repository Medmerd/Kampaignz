"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const message_repo_1 = require("../../src/main/repositories/message-repo");
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
const player_repo_1 = require("../../src/main/repositories/player-repo");
(0, vitest_1.describe)('message-repo', () => {
    let campaignId;
    let playerId1;
    let playerId2;
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
        const campaign = await (0, campaign_repo_1.createCampaign)('Test Campaign');
        campaignId = campaign.id;
        const p1 = await (0, player_repo_1.createPlayer)(campaignId, { playerName: 'Alice', army: 'L', notes: '', config: '{}' });
        const p2 = await (0, player_repo_1.createPlayer)(campaignId, { playerName: 'Bob', army: 'L', notes: '', config: '{}' });
        playerId1 = p1.id;
        playerId2 = p2.id;
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('creates and lists messages', async () => {
        const m1 = await (0, message_repo_1.createMessage)(campaignId, { content: 'Msg 1', config: '{}', playerIds: [playerId1] });
        (0, vitest_1.expect)(m1.content).toBe('Msg 1');
        (0, vitest_1.expect)(m1.player_ids).toEqual([playerId1]);
        const m2 = await (0, message_repo_1.createMessage)(campaignId, { content: 'Msg 2', config: '{}', playerIds: [playerId1, playerId2] });
        const list = await (0, message_repo_1.listMessagesByCampaign)(campaignId);
        (0, vitest_1.expect)(list).toHaveLength(2);
        (0, vitest_1.expect)(list[0].id).toBe(m2.id); // Descending
        (0, vitest_1.expect)(list[0].player_ids).toEqual([playerId1, playerId2]);
    });
    (0, vitest_1.it)('updates a message', async () => {
        const msg = await (0, message_repo_1.createMessage)(campaignId, { content: 'Old', config: '{}', playerIds: [] });
        const updated = await (0, message_repo_1.updateMessage)(msg.id, { content: 'New', config: '{"color":"red"}', playerIds: [playerId2] });
        (0, vitest_1.expect)(updated.content).toBe('New');
        (0, vitest_1.expect)(updated.config).toBe('{"color":"red"}');
        (0, vitest_1.expect)(updated.player_ids).toEqual([playerId2]);
    });
});
//# sourceMappingURL=message-repo.test.js.map