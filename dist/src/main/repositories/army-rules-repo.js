"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeArmyRulebookShare = exports.shareArmyRulebookWithCampaign = exports.updateArmyRulebook = exports.listArmyRulebooksByCampaign = exports.getArmyRulebookById = exports.createArmyRulebook = void 0;
const database_1 = require("../database");
const createArmyRulebook = async (campaignId, input) => {
    const db = (0, database_1.getDatabase)();
    const trimmedName = input.name.trim();
    if (!trimmedName) {
        throw new Error('Army Rulebook name is required.');
    }
    return db.transaction(async (trx) => {
        const insertResult = await trx('army_rules').insert({
            name: trimmedName,
            description: input.description,
            original_campaign_id: campaignId,
        }).returning('id');
        const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];
        const created = await trx('army_rules')
            .select('*')
            .where({ id: insertedId })
            .first();
        if (!created) {
            throw new Error('Failed to create Army Rulebook.');
        }
        return created;
    });
};
exports.createArmyRulebook = createArmyRulebook;
const getArmyRulebookById = async (id) => {
    const db = (0, database_1.getDatabase)();
    return db('army_rules').where({ id }).first();
};
exports.getArmyRulebookById = getArmyRulebookById;
const listArmyRulebooksByCampaign = async (campaignId) => {
    const db = (0, database_1.getDatabase)();
    // Get rulebooks created in this campaign or shared with this campaign
    return db('army_rules')
        .leftJoin('army_rule_shares', 'army_rules.id', 'army_rule_shares.army_rule_id')
        .where('army_rules.original_campaign_id', campaignId)
        .orWhere('army_rule_shares.campaign_id', campaignId)
        .select('army_rules.*')
        .distinct()
        .orderBy('army_rules.name', 'asc');
};
exports.listArmyRulebooksByCampaign = listArmyRulebooksByCampaign;
const updateArmyRulebook = async (id, input) => {
    const db = (0, database_1.getDatabase)();
    const trimmedName = input.name.trim();
    if (!trimmedName) {
        throw new Error('Army Rulebook name is required.');
    }
    const changes = await db('army_rules')
        .where({ id })
        .update({
        name: trimmedName,
        description: input.description,
        updated_at: db.fn.now(),
    });
    if (changes === 0) {
        throw new Error('Army Rulebook not found.');
    }
    const updated = await (0, exports.getArmyRulebookById)(id);
    if (!updated) {
        throw new Error('Failed to retrieve updated Army Rulebook.');
    }
    return updated;
};
exports.updateArmyRulebook = updateArmyRulebook;
const shareArmyRulebookWithCampaign = async (armyRuleId, campaignId) => {
    const db = (0, database_1.getDatabase)();
    // Prevent sharing if already shared or if it is the original campaign
    const rulebook = await (0, exports.getArmyRulebookById)(armyRuleId);
    if (!rulebook) {
        throw new Error('Army Rulebook not found.');
    }
    if (rulebook.original_campaign_id === campaignId) {
        throw new Error('Cannot share Army Rulebook with its original campaign.');
    }
    await db('army_rule_shares').insert({
        campaign_id: campaignId,
        army_rule_id: armyRuleId,
    }).onConflict(['campaign_id', 'army_rule_id']).ignore();
};
exports.shareArmyRulebookWithCampaign = shareArmyRulebookWithCampaign;
const removeArmyRulebookShare = async (armyRuleId, campaignId) => {
    const db = (0, database_1.getDatabase)();
    await db('army_rule_shares')
        .where({ army_rule_id: armyRuleId, campaign_id: campaignId })
        .del();
};
exports.removeArmyRulebookShare = removeArmyRulebookShare;
//# sourceMappingURL=army-rules-repo.js.map