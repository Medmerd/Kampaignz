import { getDatabase } from '../database';

export type ArmyRulebook = {
  id: number;
  name: string;
  description: string;
  original_campaign_id: number;
  created_at: string;
  updated_at: string;
};

export const createArmyRulebook = async (campaignId: number, input: Pick<ArmyRulebook, 'name' | 'description'>): Promise<ArmyRulebook> => {
  const db = getDatabase();
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
      .first() as Promise<ArmyRulebook | undefined>;

    if (!created) {
      throw new Error('Failed to create Army Rulebook.');
    }

    return created;
  });
};

export const getArmyRulebookById = async (id: number): Promise<ArmyRulebook | undefined> => {
  const db = getDatabase();
  return db('army_rules').where({ id }).first() as Promise<ArmyRulebook | undefined>;
};

export const listArmyRulebooksByCampaign = async (campaignId: number): Promise<ArmyRulebook[]> => {
  const db = getDatabase();
  
  // Get rulebooks created in this campaign or shared with this campaign
  return db('army_rules')
    .leftJoin('army_rule_shares', 'army_rules.id', 'army_rule_shares.army_rule_id')
    .where('army_rules.original_campaign_id', campaignId)
    .orWhere('army_rule_shares.campaign_id', campaignId)
    .select('army_rules.*')
    .distinct()
    .orderBy('army_rules.name', 'asc') as Promise<ArmyRulebook[]>;
};

export const updateArmyRulebook = async (id: number, input: Pick<ArmyRulebook, 'name' | 'description'>): Promise<ArmyRulebook> => {
  const db = getDatabase();
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

  const updated = await getArmyRulebookById(id);
  if (!updated) {
    throw new Error('Failed to retrieve updated Army Rulebook.');
  }
  return updated;
};

export const shareArmyRulebookWithCampaign = async (armyRuleId: number, campaignId: number): Promise<void> => {
  const db = getDatabase();

  // Prevent sharing if already shared or if it is the original campaign
  const rulebook = await getArmyRulebookById(armyRuleId);
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

export const removeArmyRulebookShare = async (armyRuleId: number, campaignId: number): Promise<void> => {
  const db = getDatabase();
  await db('army_rule_shares')
    .where({ army_rule_id: armyRuleId, campaign_id: campaignId })
    .del();
};
