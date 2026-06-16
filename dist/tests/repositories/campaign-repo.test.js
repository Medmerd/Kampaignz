"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
(0, vitest_1.describe)('campaign-repo', () => {
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('creates a campaign and returns the inserted row', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('  Alpha  ');
        (0, vitest_1.expect)(campaign.name).toBe('Alpha');
        (0, vitest_1.expect)(campaign.expectedSessions).toBe(1);
        (0, vitest_1.expect)(campaign.config).toBe('{}');
        (0, vitest_1.expect)(campaign.id).toBeDefined();
        (0, vitest_1.expect)(campaign.created_at).toBeDefined();
    });
    (0, vitest_1.it)('lists campaigns in descending order', async () => {
        const c1 = await (0, campaign_repo_1.createCampaign)('First');
        const c2 = await (0, campaign_repo_1.createCampaign)('Second');
        const list = await (0, campaign_repo_1.listCampaigns)();
        (0, vitest_1.expect)(list).toHaveLength(2);
        (0, vitest_1.expect)(list[0].id).toBe(c2.id);
        (0, vitest_1.expect)(list[1].id).toBe(c1.id);
    });
    (0, vitest_1.it)('gets campaign by id', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('B');
        const fetched = await (0, campaign_repo_1.getCampaignById)(campaign.id);
        (0, vitest_1.expect)(fetched).toBeDefined();
        (0, vitest_1.expect)(fetched.id).toBe(campaign.id);
    });
    (0, vitest_1.it)('updates campaign details and returns updated row', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('Original');
        const updated = await (0, campaign_repo_1.updateCampaignDetails)(campaign.id, {
            name: '  Updated  ',
            expectedSessions: 4,
            config: '{"tone":"dark"}',
        });
        (0, vitest_1.expect)(updated.name).toBe('Updated');
        (0, vitest_1.expect)(updated.expectedSessions).toBe(4);
        (0, vitest_1.expect)(updated.config).toBe('{"tone":"dark"}');
    });
    (0, vitest_1.it)('throws on empty campaign name', async () => {
        await (0, vitest_1.expect)((0, campaign_repo_1.createCampaign)('   ')).rejects.toThrow('Campaign name is required.');
        const campaign = await (0, campaign_repo_1.createCampaign)('Valid');
        await (0, vitest_1.expect)((0, campaign_repo_1.updateCampaignDetails)(campaign.id, { name: '   ', expectedSessions: 1, config: '{}' })).rejects.toThrow('Campaign name is required.');
    });
});
//# sourceMappingURL=campaign-repo.test.js.map