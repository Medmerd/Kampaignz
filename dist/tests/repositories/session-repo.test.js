"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const session_repo_1 = require("../../src/main/repositories/session-repo");
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
const mission_repo_1 = require("../../src/main/repositories/mission-repo");
(0, vitest_1.describe)('session-repo', () => {
    let campaignId;
    let missionId1;
    let missionId2;
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
        const campaign = await (0, campaign_repo_1.createCampaign)('Test Campaign');
        campaignId = campaign.id;
        const m1 = await (0, mission_repo_1.createMission)(campaignId, { title: 'M1', config: {}, missionDetails: '', map: '' });
        const m2 = await (0, mission_repo_1.createMission)(campaignId, { title: 'M2', config: {}, missionDetails: '', map: '' });
        missionId1 = m1.id;
        missionId2 = m2.id;
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('creates and lists sessions', async () => {
        const session1 = await (0, session_repo_1.createSession)(campaignId, { title: 'Session 1', notes: 'Notes 1', config: '{}', missionIds: [missionId1], campaignId });
        (0, vitest_1.expect)(session1.title).toBe('Session 1');
        (0, vitest_1.expect)(session1.mission_ids).toEqual([missionId1]);
        const session2 = await (0, session_repo_1.createSession)(campaignId, { title: 'Session 2', notes: 'Notes 2', config: '{}', missionIds: [missionId1, missionId2], campaignId });
        const list = await (0, session_repo_1.listSessionsByCampaign)(campaignId);
        (0, vitest_1.expect)(list).toHaveLength(2);
        (0, vitest_1.expect)(list[0].id).toBe(session1.id); // Ascending order
        (0, vitest_1.expect)(list[1].id).toBe(session2.id);
        (0, vitest_1.expect)(list[1].mission_ids).toEqual([missionId1, missionId2]);
    });
    (0, vitest_1.it)('updates a session', async () => {
        const session = await (0, session_repo_1.createSession)(campaignId, { title: 'Old', notes: '', config: '{}', missionIds: [], campaignId });
        const updated = await (0, session_repo_1.updateSession)(session.id, { title: 'New', notes: 'Updated', config: '{"x":1}', missionIds: [missionId2], campaignId });
        (0, vitest_1.expect)(updated.title).toBe('New');
        (0, vitest_1.expect)(updated.config).toEqual({ x: 1 });
        (0, vitest_1.expect)(updated.mission_ids).toEqual([missionId2]);
    });
});
//# sourceMappingURL=session-repo.test.js.map