import { getDatabase } from '../database';

export type Rule = {
  id: number;
  army_rule_id: number | null;
  campaign_id: number | null;
  mission_id: number | null;
  rule_category: string;
  name: string;
  description: string;
  metadata: string | null;
  parent_rule_id: number | null;
  children?: Rule[];
  created_at: string;
  updated_at: string;
};

type CreateRuleInput = Pick<Rule, 'rule_category' | 'name' | 'description' | 'metadata' | 'army_rule_id' | 'campaign_id' | 'mission_id' | 'parent_rule_id'>;
type UpdateRuleInput = Pick<Rule, 'rule_category' | 'name' | 'description' | 'metadata' | 'parent_rule_id'>;

export const createRule = async (input: CreateRuleInput): Promise<Rule> => {
  const db = getDatabase();
  const trimmedName = input.name.trim();
  if (!trimmedName) throw new Error('Rule name is required.');
  if (!input.rule_category.trim()) throw new Error('Rule category is required.');

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
    if (!created) throw new Error('Failed to create Rule.');
    return created;
  });
};

export const getRuleById = async (id: number): Promise<Rule | undefined> => {
  return getDatabase()('rules').where({ id }).first();
};

const buildRuleTree = (flatRules: Rule[]): Rule[] => {
  const ruleMap = new Map<number, Rule>();
  const roots: Rule[] = [];

  // Initialize all rules with an empty children array
  flatRules.forEach(rule => {
    ruleMap.set(rule.id, { ...rule, children: [] });
  });

  // Second pass: attach children to their parents
  flatRules.forEach(rule => {
    const node = ruleMap.get(rule.id)!;
    if (rule.parent_rule_id) {
      const parent = ruleMap.get(rule.parent_rule_id);
      if (parent) {
        parent.children!.push(node);
      } else {
        // If parent is missing, treat as root to avoid orphan loss
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const listRulesByArmyRulebook = async (armyRuleId: number): Promise<Rule[]> => {
  const flat = await getDatabase()('rules')
    .where({ army_rule_id: armyRuleId })
    .orderBy('parent_rule_id', 'asc') // parents before children
    .orderBy('name', 'asc');
  return buildRuleTree(flat);
};

export const listRulesByCampaign = async (campaignId: number): Promise<Rule[]> => {
  const flat = await getDatabase()('rules')
    .where({ campaign_id: campaignId })
    .orderBy('parent_rule_id', 'asc')
    .orderBy('name', 'asc');
  return buildRuleTree(flat);
};

export const listRulesByMission = async (missionId: number): Promise<Rule[]> => {
  const flat = await getDatabase()('rules')
    .where({ mission_id: missionId })
    .orderBy('parent_rule_id', 'asc')
    .orderBy('name', 'asc');
  return buildRuleTree(flat);
};

export const updateRule = async (id: number, input: UpdateRuleInput): Promise<Rule> => {
  const db = getDatabase();
  const trimmedName = input.name.trim();
  if (!trimmedName) throw new Error('Rule name is required.');
  if (!input.rule_category.trim()) throw new Error('Rule category is required.');

  const changes = await db('rules').where({ id }).update({
    name: trimmedName,
    rule_category: input.rule_category.trim(),
    description: input.description,
    metadata: input.metadata,
    parent_rule_id: input.parent_rule_id ?? null,
    updated_at: db.fn.now(),
  });

  if (changes === 0) throw new Error('Rule not found.');
  return (await getRuleById(id))!;
};

export const deleteRule = async (id: number): Promise<void> => {
  await getDatabase()('rules').where({ id }).del();
};
