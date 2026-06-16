"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMessage = exports.createMessage = exports.listMessagesByCampaign = void 0;
const database_1 = require("../database");
const getPlayerIdsForMessage = async (messageId) => {
    const db = (0, database_1.getDatabase)();
    const rows = await db('message_players')
        .select('player_id')
        .where({ message_id: messageId })
        .orderBy('player_id', 'asc');
    return rows.map((row) => row.player_id);
};
const mapMessage = async (row) => ({
    ...row,
    player_ids: await getPlayerIdsForMessage(row.id),
});
const hasConfigContent = (config) => config && config !== '{}' && config.length > 0;
const validateAndNormalizePlayerIds = async (campaignId, playerIds) => {
    const normalized = playerIds && playerIds.length > 0 ? Array.from(new Set(playerIds.map((id) => Number(id)).filter(Number.isFinite))) : [];
    if (normalized.length === 0) {
        return normalized;
    }
    const db = (0, database_1.getDatabase)();
    const rows = await db('players')
        .select('id')
        .where({ campaign_id: campaignId })
        .whereIn('id', normalized);
    const found = new Set(rows.map((row) => row.id));
    for (const id of normalized) {
        if (!found.has(id)) {
            throw new Error('One or more selected players do not belong to this campaign.');
        }
    }
    return normalized;
};
const listMessagesByCampaign = async (campaignId) => {
    const db = (0, database_1.getDatabase)();
    const rows = await db('messages')
        .select('id', 'campaign_id', 'content', 'config', 'created_at')
        .where({ campaign_id: campaignId })
        .orderBy('id', 'desc');
    return Promise.all(rows.map(mapMessage));
};
exports.listMessagesByCampaign = listMessagesByCampaign;
const createMessage = async (campaignId, input) => {
    const content = input.content.trim();
    const config = input.config;
    if (!content && !hasConfigContent(config)) {
        throw new Error('Message content or config is required.');
    }
    const playerIds = await validateAndNormalizePlayerIds(campaignId, input.playerIds);
    const db = (0, database_1.getDatabase)();
    return db.transaction(async (trx) => {
        const insertResult = await trx('messages').insert({
            campaign_id: campaignId,
            content,
            config,
        }).returning('id');
        const messageId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];
        const messagePlayers = playerIds.map(playerId => ({
            message_id: messageId,
            player_id: playerId
        }));
        if (messagePlayers.length > 0) {
            await trx('message_players').insert(messagePlayers);
        }
        const row = await trx('messages')
            .select('id', 'campaign_id', 'content', 'config', 'created_at')
            .where({ id: messageId })
            .first();
        if (!row) {
            throw new Error('Failed to create message.');
        }
        return {
            ...row,
            player_ids: playerIds
        };
    });
};
exports.createMessage = createMessage;
const updateMessage = async (messageId, input) => {
    const content = input.content.trim();
    const config = input.config;
    if (!content && !hasConfigContent(config)) {
        throw new Error('Message content or config is required.');
    }
    const db = (0, database_1.getDatabase)();
    const existing = await db('messages')
        .select('id', 'campaign_id', 'content', 'config', 'created_at')
        .where({ id: messageId })
        .first();
    if (!existing) {
        throw new Error('Message not found.');
    }
    const playerIds = await validateAndNormalizePlayerIds(existing.campaign_id, input.playerIds);
    return db.transaction(async (trx) => {
        await trx('messages')
            .where({ id: messageId })
            .update({ content, config });
        await trx('message_players').where({ message_id: messageId }).delete();
        const messagePlayers = playerIds.map(playerId => ({
            message_id: messageId,
            player_id: playerId
        }));
        if (messagePlayers.length > 0) {
            await trx('message_players').insert(messagePlayers);
        }
        const row = await trx('messages')
            .select('id', 'campaign_id', 'content', 'config', 'created_at')
            .where({ id: messageId })
            .first();
        if (!row) {
            throw new Error('Failed to update message.');
        }
        return {
            ...row,
            player_ids: playerIds
        };
    });
};
exports.updateMessage = updateMessage;
//# sourceMappingURL=message-repo.js.map