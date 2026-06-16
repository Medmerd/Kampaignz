"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRule = exports.updateRule = exports.listRulesByMission = exports.listRulesByCampaign = exports.listRulesByArmyRulebook = exports.getRuleById = exports.createRule = void 0;
const database_1 = require("../database");
const createRule = async (input) => {
    const db = (0, database_1.getDatabase)();
    const trimmedName = input.name.trim();
    if (!trimmedName)
        throw new Error('Rule name is required.');
    if (!input.rule_category.trim())
        throw new Error('Rule category is required.');
    // Validate that exactly one of the parent associations is provided
    const associations = [input.army_rule_id, input.campaign_id, input.mission_id].filter(val => val != null);
    if (associations.length !== 1) {
        throw new Error('A rule must be attached to exactly one of: army_rule_id, campaign_id, or mission_id.');
    }
    return db.transaction(async (trx) => {
        const insertResult = await trx('rules').insert({
            name: trimmedName,
            rule_category: input.rule_category.trim(),
            description: input.description,
            metadata: input.metadata,
            army_rule_id: input.army_rule_id ?? null,
            campaign_id: input.campaign_id ?? null,
            mission_id: input.mission_id ?? null,
            parent_rule_id: input.parent_rule_id ?? null,
        }).returning('id');
        const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];
        const created = await trx('rules').where({ id: insertedId }).first();
        if (!created)
            throw new Error('Failed to create Rule.');
        return created;
    });
};
exports.createRule = createRule;
const getRuleById = async (id) => {
    return (0, database_1.getDatabase)()('rules').where({ id }).first();
};
exports.getRuleById = getRuleById;
const buildRuleTree = (flatRules) => {
    const ruleMap = new Map();
    const roots = [];
    // Initialize all rules with an empty children array
    flatRules.forEach(rule => {
        ruleMap.set(rule.id, { ...rule, children: [] });
    });
    // Second pass: attach children to their parents
    flatRules.forEach(rule => {
        const node = ruleMap.get(rule.id);
        if (rule.parent_rule_id) {
            const parent = ruleMap.get(rule.parent_rule_id);
            if (parent) {
                parent.children.push(node);
            }
            else {
                // If parent is missing, treat as root to avoid orphan loss
                roots.push(node);
            }
        }
        else {
            roots.push(node);
        }
    });
    return roots;
};
const listRulesByArmyRulebook = async (armyRuleId) => {
    const flat = await (0, database_1.getDatabase)()('rules')
        .where({ army_rule_id: armyRuleId })
        .orderBy('parent_rule_id', 'asc') // parents before children
        .orderBy('name', 'asc');
    return buildRuleTree(flat);
};
exports.listRulesByArmyRulebook = listRulesByArmyRulebook;
const listRulesByCampaign = async (campaignId) => {
    const flat = await (0, database_1.getDatabase)()('rules')
        .where({ campaign_id: campaignId })
        .orderBy('parent_rule_id', 'asc')
        .orderBy('name', 'asc');
    return buildRuleTree(flat);
};
exports.listRulesByCampaign = listRulesByCampaign;
const listRulesByMission = async (missionId) => {
    const flat = await (0, database_1.getDatabase)()('rules')
        .where({ mission_id: missionId })
        .orderBy('parent_rule_id', 'asc')
        .orderBy('name', 'asc');
    return buildRuleTree(flat);
};
exports.listRulesByMission = listRulesByMission;
const updateRule = async (id, input) => {
    const db = (0, database_1.getDatabase)();
    const trimmedName = input.name.trim();
    if (!trimmedName)
        throw new Error('Rule name is required.');
    if (!input.rule_category.trim())
        throw new Error('Rule category is required.');
    const changes = await db('rules').where({ id }).update({
        name: trimmedName,
        rule_category: input.rule_category.trim(),
        description: input.description,
        metadata: input.metadata,
        parent_rule_id: input.parent_rule_id ?? null,
        updated_at: db.fn.now(),
    });
    if (changes === 0)
        throw new Error('Rule not found.');
    return (await (0, exports.getRuleById)(id));
};
exports.updateRule = updateRule;
const deleteRule = async (id) => {
    await (0, database_1.getDatabase)()('rules').where({ id }).del();
};
exports.deleteRule = deleteRule;
//# sourceMappingURL=rules-repo.js.map