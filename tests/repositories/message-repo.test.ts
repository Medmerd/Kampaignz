import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createMessage,
  listMessagesByCampaign,
  updateMessage,
} from '../../src/main/repositories/message-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';
import { createPlayer } from '../../src/main/repositories/player-repo';

describe('message-repo', () => {
  let campaignId: number;
  let playerId1: number;
  let playerId2: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;

    const p1 = await createPlayer(campaignId, { playerName: 'Alice', army_rule_id: null, notes: '', config: '{}' });
    const p2 = await createPlayer(campaignId, { playerName: 'Bob', army_rule_id: null, notes: '', config: '{}' });
    
    playerId1 = p1.id;
    playerId2 = p2.id;
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('creates and lists messages', async () => {
    const m1 = await createMessage(campaignId, { content: 'Msg 1', config: '{}', playerIds: [playerId1] });
    expect(m1.content).toBe('Msg 1');
    expect(m1.player_ids).toEqual([playerId1]);

    const m2 = await createMessage(campaignId, { content: 'Msg 2', config: '{}', playerIds: [playerId1, playerId2] });

    const list = await listMessagesByCampaign(campaignId);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(m2.id); // Descending
    expect(list[0].player_ids).toEqual([playerId1, playerId2]);
  });

  it('updates a message', async () => {
    const msg = await createMessage(campaignId, { content: 'Old', config: '{}', playerIds: [] });

    const updated = await updateMessage(msg.id, { content: 'New', config: '{"color":"red"}', playerIds: [playerId2] });
    expect(updated.content).toBe('New');
    expect(updated.config).toBe('{"color":"red"}');
    expect(updated.player_ids).toEqual([playerId2]);
  });
});
