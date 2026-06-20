import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  listMissionMatches,
  replaceMissionMatches,
  type MissionMatch,
} from '../../src/main/repositories/mission-match-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';
import { createMission } from '../../src/main/repositories/mission-repo';
import { createPlayer } from '../../src/main/repositories/player-repo';

describe('mission-match-repo', () => {
  let campaignId: number;
  let missionId: number;
  let p1: number, p2: number, p3: number, p4: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;

    const m1 = await createMission(campaignId, { title: 'M1', config: {}, missionDetails: '', map: '' });
    missionId = m1.id;

    const pl1 = await createPlayer(campaignId, { playerName: 'A', army_rule_id: null, notes: '', config: '{}' });
    const pl2 = await createPlayer(campaignId, { playerName: 'B', army_rule_id: null, notes: '', config: '{}' });
    const pl3 = await createPlayer(campaignId, { playerName: 'C', army_rule_id: null, notes: '', config: '{}' });
    const pl4 = await createPlayer(campaignId, { playerName: 'D', army_rule_id: null, notes: '', config: '{}' });
    
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
    const matches: MissionMatch[] = [
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

    await replaceMissionMatches(missionId, matches);

    const list = await listMissionMatches(missionId);
    expect(list).toHaveLength(2);
    expect(list[0].matchType).toBe(1);
    expect(list[0].teamAPlayerIds).toEqual([p1]);
    expect(list[0].teamBPlayerIds).toEqual([p2]);
  });

  it('validates player uniqueness', async () => {
    const matches: MissionMatch[] = [
      {
        matchType: 1,
        teamAPlayerIds: [p1],
        teamBPlayerIds: [p1],
      }
    ];

    await expect(replaceMissionMatches(missionId, matches)).rejects.toThrow('A player cannot be selected more than once');
  });
});
