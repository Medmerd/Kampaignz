import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  listSessionMatches,
  replaceSessionMatches,
  type SessionMatch,
} from '../../src/main/repositories/session-match-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';
import { createSession } from '../../src/main/repositories/session-repo';
import { createPlayer } from '../../src/main/repositories/player-repo';

describe('session-match-repo', () => {
  let campaignId: number;
  let sessionId: number;
  let p1: number, p2: number, p3: number, p4: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;

    const s1 = await createSession(campaignId, { title: 'M1', config: '{}', sessionDetails: '', map: '' });
    sessionId = s1.id;

    const pl1 = await createPlayer(campaignId, { playerName: 'A', army: 'L', notes: '', config: '{}' });
    const pl2 = await createPlayer(campaignId, { playerName: 'B', army: 'L', notes: '', config: '{}' });
    const pl3 = await createPlayer(campaignId, { playerName: 'C', army: 'L', notes: '', config: '{}' });
    const pl4 = await createPlayer(campaignId, { playerName: 'D', army: 'L', notes: '', config: '{}' });
    
    p1 = pl1.id; p2 = pl2.id; p3 = pl3.id; p4 = pl4.id;
    
    const db = getTestDatabase();
    await db('missionMatchTypes').insert([
        { typeId: 1, type: '1v1' },
        { typeId: 2, type: '2v2' },
        { typeId: 4, type: '4v4' }
    ]).onConflict('typeId').ignore();
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('replaces and lists matches', async () => {
    const matches: SessionMatch[] = [
      {
        matchType: 1,
        teamAPlayerIds: [p1],
        teamBPlayerIds: [p2],
      },
      {
        matchType: 1,
        teamAPlayerIds: [p3],
        teamBPlayerIds: [p4],
      }
    ];

    await replaceSessionMatches(sessionId, matches);

    const list = await listSessionMatches(sessionId);
    expect(list).toHaveLength(2);
    expect(list[0].matchType).toBe(1);
    expect(list[0].teamAPlayerIds).toEqual([p1]);
    expect(list[0].teamBPlayerIds).toEqual([p2]);
  });

  it('validates player uniqueness', async () => {
    const matches: SessionMatch[] = [
      {
        matchType: 1,
        teamAPlayerIds: [p1],
        teamBPlayerIds: [p1],
      }
    ];

    await expect(replaceSessionMatches(sessionId, matches)).rejects.toThrow('A player cannot be selected more than once');
  });
});
