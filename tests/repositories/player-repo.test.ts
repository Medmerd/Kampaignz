import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createPlayer,
  listPlayersByCampaign,
  updatePlayer,
  type PlayerInput,
} from '../../src/main/repositories/player-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';
import { createArmyRulebook } from '../../src/main/repositories/army-rules-repo';

const baseInput: PlayerInput = {
  playerName: 'Alice',
  army_rule_id: null,
  notes: 'Ready',
  config: '{"points":1000}',
};

describe('player-repo', () => {
  let campaignId: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('lists players', async () => {
    const p1 = await createPlayer(campaignId, baseInput);
    const p2 = await createPlayer(campaignId, { ...baseInput, playerName: 'Bob' });

    const list = await listPlayersByCampaign(campaignId);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(p2.id);
    expect(list[1].id).toBe(p1.id);
  });

  it('creates a player and returns row', async () => {
    const armyBook = await createArmyRulebook(campaignId, { name: 'Lions', description: '' });
    const player = await createPlayer(campaignId, { ...baseInput, army_rule_id: armyBook.id });
    expect(player.playerName).toBe('Alice');
    expect(player.army_rule_id).toBe(armyBook.id);
    expect(player.army_rule_name).toBe('Lions');
    expect(player.config).toBe('{"points":1000}');
    expect(player.id).toBeDefined();
  });

  it('updates a player and returns row', async () => {
    const armyBook1 = await createArmyRulebook(campaignId, { name: 'Lions', description: '' });
    const armyBook2 = await createArmyRulebook(campaignId, { name: 'Wolves', description: '' });
    
    const player = await createPlayer(campaignId, { ...baseInput, army_rule_id: armyBook1.id });
    
    const updated = await updatePlayer(player.id, {
        playerName: 'Bob',
        army_rule_id: armyBook2.id,
        notes: 'Updated',
        config: '{"points":1500}',
    });

    expect(updated.playerName).toBe('Bob');
    expect(updated.army_rule_id).toBe(armyBook2.id);
    expect(updated.army_rule_name).toBe('Wolves');
    expect(updated.config).toBe('{"points":1500}');
  });

  it('validates player input', async () => {
    await expect(createPlayer(campaignId, { ...baseInput, playerName: '   ' })).rejects.toThrow(
      'Player name is required.',
    );
  });
});
