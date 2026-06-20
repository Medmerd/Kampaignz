import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createRule,
  listRulesByArmyRulebook,
  listRulesByCampaign,
  updateRule,
  deleteRule,
} from '../../src/main/repositories/rules-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';
import { createArmyRulebook } from '../../src/main/repositories/army-rules-repo';

describe('rules-repo', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('creates and lists rules for a campaign', async () => {
    const campaign = await createCampaign('Campaign 1');
    const rule = await createRule({
      rule_category: 'Campaign Rule',
      name: 'House Rule 1',
      description: 'Test description',
      metadata: null,
      campaign_id: campaign.id,
      army_rule_id: null,
      mission_id: null,
      parent_rule_id: null,
    });

    expect(rule.name).toBe('House Rule 1');
    expect(rule.campaign_id).toBe(campaign.id);

    const list = await listRulesByCampaign(campaign.id);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(rule.id);
  });

  it('validates rule association', async () => {
    const campaign = await createCampaign('Campaign 1');
    const army = await createArmyRulebook(campaign.id, { name: 'A', description: '' });

    // No associations
    await expect(createRule({
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
    await expect(createRule({
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

  it('creates and deletes rule for army rulebook', async () => {
    const campaign = await createCampaign('Campaign 1');
    const army = await createArmyRulebook(campaign.id, { name: 'A', description: '' });

    const rule = await createRule({
      rule_category: 'Stratagem',
      name: 'Strat 1',
      description: 'Desc',
      metadata: JSON.stringify({ cost: '1CP' }),
      campaign_id: null,
      army_rule_id: army.id,
      mission_id: null,
      parent_rule_id: null,
    });

    let list = await listRulesByArmyRulebook(army.id);
    expect(list).toHaveLength(1);
    expect(list[0].metadata).toBe('{"cost":"1CP"}');

    await deleteRule(rule.id);
    list = await listRulesByArmyRulebook(army.id);
    expect(list).toHaveLength(0);
  });

  it('updates rule details', async () => {
    const campaign = await createCampaign('Campaign 1');
    const rule = await createRule({
      rule_category: 'Test',
      name: 'Old Name',
      description: 'Old',
      metadata: null,
      campaign_id: campaign.id,
      army_rule_id: null,
      mission_id: null,
      parent_rule_id: null,
    });

    const updated = await updateRule(rule.id, {
      rule_category: 'Test Updated',
      name: 'New Name',
      description: 'New',
      metadata: '{"a":1}',
      parent_rule_id: null,
    });

    expect(updated.name).toBe('New Name');
    expect(updated.rule_category).toBe('Test Updated');
    expect(updated.metadata).toBe('{"a":1}');
  });

  it('builds rule tree hierarchy', async () => {
    const campaign = await createCampaign('Campaign 1');
    const army = await createArmyRulebook(campaign.id, { name: 'A', description: '' });

    const parent = await createRule({
      rule_category: 'Detachment',
      name: 'Detachment 1',
      description: '',
      metadata: null,
      campaign_id: null,
      army_rule_id: army.id,
      mission_id: null,
      parent_rule_id: null,
    });

    const child1 = await createRule({
      rule_category: 'Stratagem',
      name: 'Child 1',
      description: '',
      metadata: null,
      campaign_id: null,
      army_rule_id: army.id,
      mission_id: null,
      parent_rule_id: parent.id,
    });

    const child2 = await createRule({
      rule_category: 'Enhancement',
      name: 'Child 2',
      description: '',
      metadata: null,
      campaign_id: null,
      army_rule_id: army.id,
      mission_id: null,
      parent_rule_id: parent.id,
    });

    const list = await listRulesByArmyRulebook(army.id);

    // Should return 1 root element
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(parent.id);

    // With 2 children
    expect(list[0].children).toBeDefined();
    expect(list[0].children).toHaveLength(2);
    expect(list[0].children?.[0].id).toBe(child1.id);
    expect(list[0].children?.[1].id).toBe(child2.id);
  });
});
