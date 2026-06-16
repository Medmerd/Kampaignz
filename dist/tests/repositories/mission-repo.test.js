"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const mission_repo_1 = require("../../src/main/repositories/mission-repo");
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
const baseInput = {
    title: 'Mission 1',
    config: { time: 'Day' },
    missionDetails: 'Briefing',
    map: 'Map A',
};
(0, vitest_1.describe)('mission-repo', () => {
    let campaignId;
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
        const campaign = await (0, campaign_repo_1.createCampaign)('Test Campaign');
        campaignId = campaign.id;
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('lists missions', async () => {
        const m1 = await (0, mission_repo_1.createMission)(campaignId, baseInput);
        const m2 = await (0, mission_repo_1.createMission)(campaignId, { ...baseInput, title: 'Mission 2' });
        const list = await (0, mission_repo_1.listMissionsByCampaign)(campaignId);
        (0, vitest_1.expect)(list).toHaveLength(2);
        (0, vitest_1.expect)(list[0].id).toBe(m2.id);
        (0, vitest_1.expect)(list[1].id).toBe(m1.id);
    });
    (0, vitest_1.it)('creates a mission and returns row', async () => {
        const mission = await (0, mission_repo_1.createMission)(campaignId, baseInput);
        (0, vitest_1.expect)(mission.title).toBe('Mission 1');
        (0, vitest_1.expect)(mission.missionDetails).toBe('Briefing');
        (0, vitest_1.expect)(mission.map).toBe('Map A');
        (0, vitest_1.expect)(mission.config).toEqual({ time: 'Day' });
        (0, vitest_1.expect)(mission.id).toBeDefined();
    });
    (0, vitest_1.it)('updates a mission and returns row', async () => {
        const mission = await (0, mission_repo_1.createMission)(campaignId, baseInput);
        const updated = await (0, mission_repo_1.updateMission)(mission.id, {
            title: 'Mission 1.5',
            config: { time: 'Night' },
            missionDetails: 'Debriefing',
            map: 'Map B',
        });
        (0, vitest_1.expect)(updated.title).toBe('Mission 1.5');
        (0, vitest_1.expect)(updated.missionDetails).toBe('Debriefing');
        (0, vitest_1.expect)(updated.map).toBe('Map B');
        (0, vitest_1.expect)(updated.config).toEqual({ time: 'Night' });
    });
    (0, vitest_1.it)('validates mission title', async () => {
        await (0, vitest_1.expect)((0, mission_repo_1.createMission)(campaignId, { ...baseInput, title: '   ' })).rejects.toThrow('Mission title is required.');
    });
});
//# sourceMappingURL=mission-repo.test.js.map