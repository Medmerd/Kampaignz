"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const mission_match_repo_1 = require("../../src/main/repositories/mission-match-repo");
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
const mission_repo_1 = require("../../src/main/repositories/mission-repo");
const player_repo_1 = require("../../src/main/repositories/player-repo");
(0, vitest_1.describe)('mission-match-repo', () => {
    let campaignId;
    let missionId;
    let p1, p2, p3, p4;
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
        const campaign = await (0, campaign_repo_1.createCampaign)('Test Campaign');
        campaignId = campaign.id;
        const m1 = await (0, mission_repo_1.createMission)(campaignId, { title: 'M1', config: {}, missionDetails: '', map: '' });
        missionId = m1.id;
        const pl1 = await (0, player_repo_1.createPlayer)(campaignId, { playerName: 'A', army: 'L', notes: '', config: '{}' });
        const pl2 = await (0, player_repo_1.createPlayer)(campaignId, { playerName: 'B', army: 'L', notes: '', config: '{}' });
        const pl3 = await (0, player_repo_1.createPlayer)(campaignId, { playerName: 'C', army: 'L', notes: '', config: '{}' });
        const pl4 = await (0, player_repo_1.createPlayer)(campaignId, { playerName: 'D', army: 'L', notes: '', config: '{}' });
        p1 = pl1.id;
        p2 = pl2.id;
        p3 = pl3.id;
        p4 = pl4.id;
        const db = (0, db_setup_1.getTestDatabase)();
        await db('missionMatchTypes').insert([
            { typeId: 1, type: '1v1' },
            { typeId: 2, type: '2v2' },
            { typeId: 4, type: '4v4' }
        ]).onConflict('typeId').ignore();
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('replaces and lists matches', async () => {
        const matches = [
            {
                matchType: 1,
                teamAPlayerIds: [p1],
                teamBPlayerIds: [p2],
            },
            {
                matchType: 1,
                teamAPlayerIds: [p3],
                teamBPlayerIds: [p4],
            }
        ];
        await (0, mission_match_repo_1.replaceMissionMatches)(missionId, matches);
        const list = await (0, mission_match_repo_1.listMissionMatches)(missionId);
        (0, vitest_1.expect)(list).toHaveLength(2);
        (0, vitest_1.expect)(list[0].matchType).toBe(1);
        (0, vitest_1.expect)(list[0].teamAPlayerIds).toEqual([p1]);
        (0, vitest_1.expect)(list[0].teamBPlayerIds).toEqual([p2]);
    });
    (0, vitest_1.it)('validates player uniqueness', async () => {
        const matches = [
            {
                matchType: 1,
                teamAPlayerIds: [p1],
                teamBPlayerIds: [p1],
            }
        ];
        await (0, vitest_1.expect)((0, mission_match_repo_1.replaceMissionMatches)(missionId, matches)).rejects.toThrow('A player cannot be selected more than once');
    });
});
//# sourceMappingURL=mission-match-repo.test.js.map