"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const rules_repo_1 = require("../../src/main/repositories/rules-repo");
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
const army_rules_repo_1 = require("../../src/main/repositories/army-rules-repo");
(0, vitest_1.describe)('rules-repo', () => {
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('creates and lists rules for a campaign', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('Campaign 1');
        const rule = await (0, rules_repo_1.createRule)({
            rule_category: 'Campaign Rule',
            name: 'House Rule 1',
            description: 'Test description',
            metadata: null,
            campaign_id: campaign.id,
            army_rule_id: null,
            mission_id: null,
            parent_rule_id: null,
        });
        (0, vitest_1.expect)(rule.name).toBe('House Rule 1');
        (0, vitest_1.expect)(rule.campaign_id).toBe(campaign.id);
        const list = await (0, rules_repo_1.listRulesByCampaign)(campaign.id);
        (0, vitest_1.expect)(list).toHaveLength(1);
        (0, vitest_1.expect)(list[0].id).toBe(rule.id);
    });
    (0, vitest_1.it)('validates rule association', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('Campaign 1');
        const army = await (0, army_rules_repo_1.createArmyRulebook)(campaign.id, { name: 'A', description: '' });
        // No associations
        await (0, vitest_1.expect)((0, rules_repo_1.createRule)({
            rule_category: 'Stratagem',
            name: 'Strat 1',
            description: '',
            metadata: null,
            campaign_id: null,
            army_rule_id: null,
            mission_id: null,
            parent_rule_id: null,
        })).rejects.toThrow('exactly one');
        // Multiple associations
        await (0, vitest_1.expect)((0, rules_repo_1.createRule)({
            rule_category: 'Stratagem',
            name: 'Strat 2',
            description: '',
            metadata: null,
            campaign_id: campaign.id,
            army_rule_id: army.id,
            mission_id: null,
            parent_rule_id: null,
        })).rejects.toThrow('exactly one');
    });
    (0, vitest_1.it)('creates and deletes rule for army rulebook', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('Campaign 1');
        const army = await (0, army_rules_repo_1.createArmyRulebook)(campaign.id, { name: 'A', description: '' });
        const rule = await (0, rules_repo_1.createRule)({
            rule_category: 'Stratagem',
            name: 'Strat 1',
            description: 'Desc',
            metadata: JSON.stringify({ cost: '1CP' }),
            campaign_id: null,
            army_rule_id: army.id,
            mission_id: null,
            parent_rule_id: null,
        });
        let list = await (0, rules_repo_1.listRulesByArmyRulebook)(army.id);
        (0, vitest_1.expect)(list).toHaveLength(1);
        (0, vitest_1.expect)(list[0].metadata).toBe('{"cost":"1CP"}');
        await (0, rules_repo_1.deleteRule)(rule.id);
        list = await (0, rules_repo_1.listRulesByArmyRulebook)(army.id);
        (0, vitest_1.expect)(list).toHaveLength(0);
    });
    (0, vitest_1.it)('updates rule details', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('Campaign 1');
        const rule = await (0, rules_repo_1.createRule)({
            rule_category: 'Test',
            name: 'Old Name',
            description: 'Old',
            metadata: null,
            campaign_id: campaign.id,
            army_rule_id: null,
            mission_id: null,
            parent_rule_id: null,
        });
        const updated = await (0, rules_repo_1.updateRule)(rule.id, {
            rule_category: 'Test Updated',
            name: 'New Name',
            description: 'New',
            metadata: '{"a":1}',
            parent_rule_id: null,
        });
        (0, vitest_1.expect)(updated.name).toBe('New Name');
        (0, vitest_1.expect)(updated.rule_category).toBe('Test Updated');
        (0, vitest_1.expect)(updated.metadata).toBe('{"a":1}');
    });
    (0, vitest_1.it)('builds rule tree hierarchy', async () => {
        const campaign = await (0, campaign_repo_1.createCampaign)('Campaign 1');
        const army = await (0, army_rules_repo_1.createArmyRulebook)(campaign.id, { name: 'A', description: '' });
        const parent = await (0, rules_repo_1.createRule)({
            rule_category: 'Detachment',
            name: 'Detachment 1',
            description: '',
            metadata: null,
            campaign_id: null,
            army_rule_id: army.id,
            mission_id: null,
            parent_rule_id: null,
        });
        const child1 = await (0, rules_repo_1.createRule)({
            rule_category: 'Stratagem',
            name: 'Child 1',
            description: '',
            metadata: null,
            campaign_id: null,
            army_rule_id: army.id,
            mission_id: null,
            parent_rule_id: parent.id,
        });
        const child2 = await (0, rules_repo_1.createRule)({
            rule_category: 'Enhancement',
            name: 'Child 2',
            description: '',
            metadata: null,
            campaign_id: null,
            army_rule_id: army.id,
            mission_id: null,
            parent_rule_id: parent.id,
        });
        const list = await (0, rules_repo_1.listRulesByArmyRulebook)(army.id);
        // Should return 1 root element
        (0, vitest_1.expect)(list).toHaveLength(1);
        (0, vitest_1.expect)(list[0].id).toBe(parent.id);
        // With 2 children
        (0, vitest_1.expect)(list[0].children).toBeDefined();
        (0, vitest_1.expect)(list[0].children).toHaveLength(2);
        (0, vitest_1.expect)(list[0].children[0].id).toBe(child1.id);
        (0, vitest_1.expect)(list[0].children[1].id).toBe(child2.id);
    });
});
//# sourceMappingURL=rules-repo.test.js.map