import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createSession,
  listSessionsByCampaign,
  updateSession,
} from '../../src/main/repositories/session-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';
import { createMission } from '../../src/main/repositories/mission-repo';

describe('session-repo', () => {
  let campaignId: number;
  let missionId1: number;
  let missionId2: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;

    const m1 = await createMission(campaignId, { title: 'M1', config: {}, missionDetails: '', map: '' });
    const m2 = await createMission(campaignId, { title: 'M2', config: {}, missionDetails: '', map: '' });
    
    missionId1 = m1.id;
    missionId2 = m2.id;
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('creates and lists sessions', async () => {
    const session1 = await createSession(campaignId, { title: 'Session 1', notes: 'Notes 1', config: '{}', missionIds: [missionId1], campaignId });
    expect(session1.title).toBe('Session 1');
    expect(session1.mission_ids).toEqual([missionId1]);

    const session2 = await createSession(campaignId, { title: 'Session 2', notes: 'Notes 2', config: '{}', missionIds: [missionId1, missionId2], campaignId });

    const list = await listSessionsByCampaign(campaignId);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(session1.id); // Ascending order
    expect(list[1].id).toBe(session2.id);
    expect(list[1].mission_ids).toEqual([missionId1, missionId2]);
  });

  it('updates a session', async () => {
    const session = await createSession(campaignId, { title: 'Old', notes: '', config: '{}', missionIds: [], campaignId });

    const updated = await updateSession(session.id, { title: 'New', notes: 'Updated', config: '{"x":1}', missionIds: [missionId2], campaignId });
    expect(updated.title).toBe('New');
    expect(updated.config).toEqual({x: 1});
    expect(updated.mission_ids).toEqual([missionId2]);
  });
});
