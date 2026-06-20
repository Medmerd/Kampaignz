import { getDatabase } from '../database';
import { getRuleById, Rule } from './rules-repo';

export type PlayerRule = {
    id: number;
    player_id: number;
    rule_id: number;
    created_at: string;
    rule?: Rule; // populated when joining
};

export const assignRuleToPlayer = async (playerId: number, ruleId: number): Promise<PlayerRule> => {
    const db = getDatabase();

    // 1. Fetch the rule to check limits
    const rule = await getRuleById(ruleId);
    if (!rule) throw new Error('Rule not found.');

    if (rule.army_rule_id !== null) {
        throw new Error('Only campaign rules can be assigned to players. Army rules are not permitted.');
    }

    let metadata: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = {};
    if (rule.metadata) {
        try {
            metadata = typeof rule.metadata === 'string' 
                ? JSON.parse(rule.metadata) 
                : rule.metadata;
        } catch (e) {
            // ignore malformed metadata
        }
    }

    const maxPerPlayer = metadata.max_per_player !== undefined && metadata.max_per_player !== null 
        ? parseInt(metadata.max_per_player, 10) 
        : null;
    const maxCampaignWide = metadata.max_campaign_wide !== undefined && metadata.max_campaign_wide !== null 
        ? parseInt(metadata.max_campaign_wide, 10) 
        : null;

    // We do all this in a transaction to prevent race conditions if possible
    return db.transaction(async (trx) => {
        // Check max_per_player
        if (maxPerPlayer !== null && !isNaN(maxPerPlayer)) {
            const playerUsage = await trx('player_rules')
                .where({ player_id: playerId, rule_id: ruleId })
                .count('* as count')
                .first();
            const pCount = (playerUsage?.count) ? Number(playerUsage.count) : 0;
            if (pCount >= maxPerPlayer) {
                throw new Error(`Limit Exceeded: Player already has ${maxPerPlayer} instance(s) of this rule.`);
            }
        }

        // Check max_campaign_wide
        if (maxCampaignWide !== null && !isNaN(maxCampaignWide)) {
            // We need to verify how many players in the *same campaign* have this rule.
            // Since `player_rules` only knows `player_id`, we need to join `players`.
            const playerRow = await trx('players').where({ id: playerId }).select('campaign_id').first();
            if (!playerRow) throw new Error('Player not found.');

            const campaignUsage = await trx('player_rules')
                .join('players', 'player_rules.player_id', 'players.id')
                .where({ 'player_rules.rule_id': ruleId, 'players.campaign_id': playerRow.campaign_id })
                .count('* as count')
                .first();
            
            const cCount = (campaignUsage?.count) ? Number(campaignUsage.count) : 0;
            if (cCount >= maxCampaignWide) {
                throw new Error(`Campaign Limit Exceeded: Only ${maxCampaignWide} instance(s) of this rule are permitted campaign-wide.`);
            }
        }

        const insertResult = await trx('player_rules').insert({
            player_id: playerId,
            rule_id: ruleId,
        }).returning('id');

        const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

        const assigned = await trx('player_rules').where({ id: insertedId }).first();
        return assigned as PlayerRule;
    });
};

export const unassignRuleFromPlayer = async (playerRuleId: number): Promise<void> => {
    const db = getDatabase();
    await db('player_rules').where({ id: playerRuleId }).delete();
};

export const listPlayerRules = async (playerId: number): Promise<PlayerRule[]> => {
    const db = getDatabase();
    
    // Fetch associations
    const playerRules = await db('player_rules')
        .where({ player_id: playerId })
        .orderBy('created_at', 'asc') as PlayerRule[];

    if (playerRules.length === 0) return [];

    // Fetch the actual rules
    const ruleIds = playerRules.map(pr => pr.rule_id);
    const rules = await db('rules').whereIn('id', ruleIds) as Rule[];

    // Map them together
    return playerRules.map(pr => ({
        ...pr,
        rule: rules.find(r => r.id === pr.rule_id)
    }));
};
