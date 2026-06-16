"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_setup_1 = require("../db-setup");
vitest_1.vi.mock('../../src/main/database', () => ({
    getDatabase: () => (0, db_setup_1.getTestDatabase)(),
}));
const campaign_repo_1 = require("../../src/main/repositories/campaign-repo");
const player_repo_1 = require("../../src/main/repositories/player-repo");
const rules_repo_1 = require("../../src/main/repositories/rules-repo");
const mission_repo_1 = require("../../src/main/repositories/mission-repo");
const army_rules_repo_1 = require("../../src/main/repositories/army-rules-repo");
const player_rules_repo_1 = require("../../src/main/repositories/player-rules-repo");
(0, vitest_1.describe)('player-rules-repo', () => {
    let campaignId;
    let playerA;
    let playerB;
    (0, vitest_1.beforeEach)(async () => {
        await (0, db_setup_1.setupTestDatabase)();
        const campaign = await (0, campaign_repo_1.createCampaign)('Test Campaign');
        campaignId = campaign.id;
        const pa = await (0, player_repo_1.createPlayer)(campaignId, { playerName: 'A', army_rule_id: null, notes: '', config: '{}' });
        playerA = pa.id;
        const pb = await (0, player_repo_1.createPlayer)(campaignId, { playerName: 'B', army_rule_id: null, notes: '', config: '{}' });
        playerB = pb.id;
    });
    (0, vitest_1.afterEach)(async () => {
        await (0, db_setup_1.closeTestDatabase)();
    });
    (0, vitest_1.it)('assigns, unassigns, and lists player rules', async () => {
        const rule = await (0, rules_repo_1.createRule)({ campaign_id: campaignId, name: 'Basic Rule', cost: 0, description: '', rule_category: 'test' });
        const assigned = await (0, player_rules_repo_1.assignRuleToPlayer)(playerA, rule.id);
        (0, vitest_1.expect)(assigned.id).toBeDefined();
        const list = await (0, player_rules_repo_1.listPlayerRules)(playerA);
        (0, vitest_1.expect)(list).toHaveLength(1);
        (0, vitest_1.expect)(list[0].rule?.name).toBe('Basic Rule');
        await (0, player_rules_repo_1.unassignRuleFromPlayer)(assigned.id);
        const listAfter = await (0, player_rules_repo_1.listPlayerRules)(playerA);
        (0, vitest_1.expect)(listAfter).toHaveLength(0);
    });
    (0, vitest_1.it)('enforces max_per_player limit', async () => {
        const rule = await (0, rules_repo_1.createRule)({
            campaign_id: campaignId,
            name: 'Limited Enh',
            cost: 0,
            description: '',
            rule_category: 'test',
            metadata: JSON.stringify({ max_per_player: 1 })
        });
        // First assignment should pass
        await (0, player_rules_repo_1.assignRuleToPlayer)(playerA, rule.id);
        // Second assignment to the SAME player should fail
        await (0, vitest_1.expect)((0, player_rules_repo_1.assignRuleToPlayer)(playerA, rule.id)).rejects.toThrow(/already has 1 instance/);
        // But another player can still get it
        await (0, player_rules_repo_1.assignRuleToPlayer)(playerB, rule.id);
    });
    (0, vitest_1.it)('enforces max_campaign_wide limit', async () => {
        const rule = await (0, rules_repo_1.createRule)({
            campaign_id: campaignId,
            name: 'Epic Relic',
            cost: 0,
            description: '',
            rule_category: 'test',
            metadata: JSON.stringify({ max_campaign_wide: 1 })
        });
        // Player A gets the only instance
        await (0, player_rules_repo_1.assignRuleToPlayer)(playerA, rule.id);
        // Player B cannot get it because the campaign wide limit is reached
        await (0, vitest_1.expect)((0, player_rules_repo_1.assignRuleToPlayer)(playerB, rule.id)).rejects.toThrow(/permitted campaign-wide/);
    });
    (0, vitest_1.it)('allows assigning a mission rule', async () => {
        const mission = await (0, mission_repo_1.createMission)(campaignId, { title: 'Test Mission', description: '', missionDetails: '', map: '', config: '{}' });
        const rule = await (0, rules_repo_1.createRule)({
            mission_id: mission.id,
            name: 'Mission Special',
            cost: 0,
            description: '',
            rule_category: 'test'
        });
        const assigned = await (0, player_rules_repo_1.assignRuleToPlayer)(playerA, rule.id);
        (0, vitest_1.expect)(assigned.id).toBeDefined();
    });
    (0, vitest_1.it)('rejects assigning an army rule', async () => {
        const armyBook = await (0, army_rules_repo_1.createArmyRulebook)(campaignId, { name: 'Space Marines', description: '' });
        const rule = await (0, rules_repo_1.createRule)({
            army_rule_id: armyBook.id,
            name: 'Army Special',
            cost: 0,
            description: '',
            rule_category: 'test'
        });
        await (0, vitest_1.expect)((0, player_rules_repo_1.assignRuleToPlayer)(playerA, rule.id)).rejects.toThrow(/Only campaign rules can be assigned to players. Army rules are not permitted./);
    });
});
//# sourceMappingURL=player-rules-repo.test.js.map