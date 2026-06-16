"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlayer = exports.createPlayer = exports.listPlayersByCampaign = void 0;
const database_1 = require("../database");
const listPlayersByCampaign = async (campaignId) => {
    const db = (0, database_1.getDatabase)();
    return db('players')
        .leftJoin('army_rules', 'players.army_rule_id', 'army_rules.id')
        .select('players.id', 'players.campaign_id', 'players.playerName', 'players.army_rule_id', 'army_rules.name as army_rule_name', 'players.notes', 'players.config', 'players.created_at')
        .where({ 'players.campaign_id': campaignId })
        .orderBy('players.id', 'desc');
};
exports.listPlayersByCampaign = listPlayersByCampaign;
const createPlayer = async (campaignId, input) => {
    const playerName = input.playerName.trim();
    if (!playerName) {
        throw new Error('Player name is required.');
    }
    const db = (0, database_1.getDatabase)();
    return db.transaction(async (trx) => {
        const insertResult = await trx('players').insert({
            campaign_id: campaignId,
            playerName,
            army_rule_id: input.army_rule_id,
            notes: input.notes.trim(),
            config: input.config,
        }).returning('id');
        const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];
        const row = await trx('players')
            .leftJoin('army_rules', 'players.army_rule_id', 'army_rules.id')
            .select('players.id', 'players.campaign_id', 'players.playerName', 'players.army_rule_id', 'army_rules.name as army_rule_name', 'players.notes', 'players.config', 'players.created_at')
            .where({ 'players.id': insertedId })
            .first();
        if (!row) {
            throw new Error('Failed to create player.');
        }
        return row;
    });
};
exports.createPlayer = createPlayer;
const updatePlayer = async (playerId, input) => {
    const playerName = input.playerName.trim();
    if (!playerName) {
        throw new Error('Player name is required.');
    }
    const db = (0, database_1.getDatabase)();
    const changes = await db('players')
        .where({ id: playerId })
        .update({
        playerName,
        army_rule_id: input.army_rule_id,
        notes: input.notes.trim(),
        config: input.config,
    });
    if (changes === 0) {
        throw new Error('Player not found.');
    }
    const row = await db('players')
        .leftJoin('army_rules', 'players.army_rule_id', 'army_rules.id')
        .select('players.id', 'players.campaign_id', 'players.playerName', 'players.army_rule_id', 'army_rules.name as army_rule_name', 'players.notes', 'players.config', 'players.created_at')
        .where({ 'players.id': playerId })
        .first();
    if (!row) {
        throw new Error('Failed to update player.');
    }
    return row;
};
exports.updatePlayer = updatePlayer;
//# sourceMappingURL=player-repo.js.map