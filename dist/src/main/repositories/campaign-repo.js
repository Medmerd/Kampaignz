"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignDetails = exports.getCampaignById = exports.listCampaigns = exports.createCampaign = void 0;
const database_1 = require("../database");
const createCampaign = async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
        throw new Error('Campaign name is required.');
    }
    const db = (0, database_1.getDatabase)();
    return db.transaction(async (trx) => {
        const insertResult = await trx('campaigns').insert({ name: trimmedName }).returning('id');
        const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];
        const created = await trx('campaigns')
            .select('id', 'name', 'expectedSessions', 'config', 'created_at')
            .where({ id: insertedId })
            .first();
        if (!created) {
            throw new Error('Failed to create campaign.');
        }
        return created;
    });
};
exports.createCampaign = createCampaign;
const listCampaigns = async () => {
    const db = (0, database_1.getDatabase)();
    return db('campaigns')
        .select('id', 'name', 'expectedSessions', 'config', 'created_at')
        .orderBy('id', 'desc');
};
exports.listCampaigns = listCampaigns;
const getCampaignById = async (id) => {
    const db = (0, database_1.getDatabase)();
    return db('campaigns')
        .select('id', 'name', 'expectedSessions', 'config', 'created_at')
        .where({ id })
        .first();
};
exports.getCampaignById = getCampaignById;
const updateCampaignDetails = async (id, input) => {
    const trimmedName = input.name.trim();
    const expectedSessions = Math.max(1, Math.floor(input.expectedSessions));
    if (!trimmedName) {
        throw new Error('Campaign name is required.');
    }
    const db = (0, database_1.getDatabase)();
    const changes = await db('campaigns')
        .where({ id })
        .update({
        name: trimmedName,
        expectedSessions,
        config: input.config,
    });
    if (changes === 0) {
        throw new Error('Campaign not found.');
    }
    const updated = await db('campaigns')
        .select('id', 'name', 'expectedSessions', 'config', 'created_at')
        .where({ id })
        .first();
    if (!updated) {
        throw new Error('Failed to update campaign.');
    }
    return updated;
};
exports.updateCampaignDetails = updateCampaignDetails;
//# sourceMappingURL=campaign-repo.js.map