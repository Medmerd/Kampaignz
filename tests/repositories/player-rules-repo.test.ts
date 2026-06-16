import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import { createCampaign } from '../../src/main/repositories/campaign-repo';
import { createPlayer } from '../../src/main/repositories/player-repo';
import { createRule } from '../../src/main/repositories/rules-repo';
import { createMission } from '../../src/main/repositories/mission-repo';
import { createArmyRulebook } from '../../src/main/repositories/army-rules-repo';
import { assignRuleToPlayer, unassignRuleFromPlayer, listPlayerRules } from '../../src/main/repositories/player-rules-repo';

describe('player-rules-repo', () => {
  let campaignId: number;
  let playerA: number;
  let playerB: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;

    const pa = await createPlayer(campaignId, { playerName: 'A', army_rule_id: null, notes: '', config: '{}' });
    playerA = pa.id;

    const pb = await createPlayer(campaignId, { playerName: 'B', army_rule_id: null, notes: '', config: '{}' });
    playerB = pb.id;
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('assigns, unassigns, and lists player rules', async () => {
    const rule = await createRule({ campaign_id: campaignId, name: 'Basic Rule', cost: 0, description: '', rule_category: 'test' });
    
    const assigned = await assignRuleToPlayer(playerA, rule.id);
    expect(assigned.id).toBeDefined();

    const list = await listPlayerRules(playerA);
    expect(list).toHaveLength(1);
    expect(list[0].rule?.name).toBe('Basic Rule');

    await unassignRuleFromPlayer(assigned.id);
    
    const listAfter = await listPlayerRules(playerA);
    expect(listAfter).toHaveLength(0);
  });

  it('enforces max_per_player limit', async () => {
    const rule = await createRule({ 
        campaign_id: campaignId, 
        name: 'Limited Enh', 
        cost: 0, 
        description: '',
        rule_category: 'test',
        metadata: JSON.stringify({ max_per_player: 1 }) 
    });

    // First assignment should pass
    await assignRuleToPlayer(playerA, rule.id);

    // Second assignment to the SAME player should fail
    await expect(assignRuleToPlayer(playerA, rule.id)).rejects.toThrow(/already has 1 instance/);

    // But another player can still get it
    await assignRuleToPlayer(playerB, rule.id);
  });

  it('enforces max_campaign_wide limit', async () => {
    const rule = await createRule({ 
        campaign_id: campaignId, 
        name: 'Epic Relic', 
        cost: 0, 
        description: '',
        rule_category: 'test',
        metadata: JSON.stringify({ max_campaign_wide: 1 }) 
    });

    // Player A gets the only instance
    await assignRuleToPlayer(playerA, rule.id);

    // Player B cannot get it because the campaign wide limit is reached
    await expect(assignRuleToPlayer(playerB, rule.id)).rejects.toThrow(/permitted campaign-wide/);
  });

  it('allows assigning a mission rule', async () => {
    const mission = await createMission(campaignId, { title: 'Test Mission', description: '', missionDetails: '', map: '', config: '{}' });
    const rule = await createRule({ 
      mission_id: mission.id, 
      name: 'Mission Special', 
      cost: 0, 
      description: '', 
      rule_category: 'test' 
    });

    const assigned = await assignRuleToPlayer(playerA, rule.id);
    expect(assigned.id).toBeDefined();
  });

  it('rejects assigning an army rule', async () => {
    const armyBook = await createArmyRulebook(campaignId, { name: 'Space Marines', description: '' });
    const rule = await createRule({ 
      army_rule_id: armyBook.id, 
      name: 'Army Special', 
      cost: 0, 
      description: '', 
      rule_category: 'test' 
    });

    await expect(assignRuleToPlayer(playerA, rule.id)).rejects.toThrow(/Only campaign rules can be assigned to players. Army rules are not permitted./);
  });
});
