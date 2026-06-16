"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const army_rules_repo_1 = require("../../src/main/repositories/army-rules-repo");
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
(0, vitest_1.describe)('army-rules-repo', () => {
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('creates an army rulebook and returns the inserted row', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('Campaign A');
        const rulebook = await (0, army_rules_repo_1.createArmyRulebook)(campaign.id, { name: '  Space Marines  ', description: 'desc' });
        (0, vitest_1.expect)(rulebook.name).toBe('Space Marines');
        (0, vitest_1.expect)(rulebook.description).toBe('desc');
        (0, vitest_1.expect)(rulebook.original_campaign_id).toBe(campaign.id);
        (0, vitest_1.expect)(rulebook.id).toBeDefined();
        (0, vitest_1.expect)(rulebook.created_at).toBeDefined();
    });
    (0, vitest_1.it)('lists army rulebooks, including shared ones', async () => {
        const campaign1 = await (0, campaign_repo_1.createCampaign)('C1');
        const campaign2 = await (0, campaign_repo_1.createCampaign)('C2');
        const rb1 = await (0, army_rules_repo_1.createArmyRulebook)(campaign1.id, { name: 'RB1', description: '' });
        const rb2 = await (0, army_rules_repo_1.createArmyRulebook)(campaign2.id, { name: 'RB2', description: '' });
        // Share RB2 with Campaign 1
        await (0, army_rules_repo_1.shareArmyRulebookWithCampaign)(rb2.id, campaign1.id);
        const list = await (0, army_rules_repo_1.listArmyRulebooksByCampaign)(campaign1.id);
        (0, vitest_1.expect)(list).toHaveLength(2);
        // Ordered by name
        (0, vitest_1.expect)(list[0].name).toBe('RB1');
        (0, vitest_1.expect)(list[1].name).toBe('RB2');
    });
    (0, vitest_1.it)('gets army rulebook by id', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('C');
        const rb = await (0, army_rules_repo_1.createArmyRulebook)(campaign.id, { name: 'A', description: '' });
        const fetched = await (0, army_rules_repo_1.getArmyRulebookById)(rb.id);
        (0, vitest_1.expect)(fetched).toBeDefined();
        (0, vitest_1.expect)(fetched.id).toBe(rb.id);
    });
    (0, vitest_1.it)('updates army rulebook details and returns updated row', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('C');
        const rb = await (0, army_rules_repo_1.createArmyRulebook)(campaign.id, { name: 'Old', description: '' });
        const updated = await (0, army_rules_repo_1.updateArmyRulebook)(rb.id, {
            name: 'New',
            description: 'New Desc',
        });
        (0, vitest_1.expect)(updated.name).toBe('New');
        (0, vitest_1.expect)(updated.description).toBe('New Desc');
    });
    (0, vitest_1.it)('removes share correctly', async () => {
        const campaign1 = await (0, campaign_repo_1.createCampaign)('C1');
        const campaign2 = await (0, campaign_repo_1.createCampaign)('C2');
        const rb = await (0, army_rules_repo_1.createArmyRulebook)(campaign2.id, { name: 'RB', description: '' });
        await (0, army_rules_repo_1.shareArmyRulebookWithCampaign)(rb.id, campaign1.id);
        let list = await (0, army_rules_repo_1.listArmyRulebooksByCampaign)(campaign1.id);
        (0, vitest_1.expect)(list).toHaveLength(1);
        await (0, army_rules_repo_1.removeArmyRulebookShare)(rb.id, campaign1.id);
        list = await (0, army_rules_repo_1.listArmyRulebooksByCampaign)(campaign1.id);
        (0, vitest_1.expect)(list).toHaveLength(0);
    });
});
//# sourceMappingURL=army-rules-repo.test.js.map