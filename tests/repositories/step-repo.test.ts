import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createStep,
  listStepsByCampaign,
  updateStep,
} from '../../src/main/repositories/step-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';
import { createSession } from '../../src/main/repositories/session-repo';

describe('step-repo', () => {
  let campaignId: number;
  let sessionId1: number;
  let sessionId2: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;

    const s1 = await createSession(campaignId, { title: 'M1', config: '{}', sessionDetails: '', map: '' });
    const s2 = await createSession(campaignId, { title: 'M2', config: '{}', sessionDetails: '', map: '' });
    
    sessionId1 = s1.id;
    sessionId2 = s2.id;
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('creates and lists steps', async () => {
    const step1 = await createStep(campaignId, { title: 'Step 1', notes: 'Notes 1', config: '{}', sessionIds: [sessionId1] });
    expect(step1.title).toBe('Step 1');
    expect(step1.session_ids).toEqual([sessionId1]);

    const step2 = await createStep(campaignId, { title: 'Step 2', notes: 'Notes 2', config: '{}', sessionIds: [sessionId1, sessionId2] });

    const list = await listStepsByCampaign(campaignId);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(step1.id); // Ascending
    expect(list[1].id).toBe(step2.id);
    expect(list[1].session_ids).toEqual([sessionId1, sessionId2]);
  });

  it('updates a step', async () => {
    const step = await createStep(campaignId, { title: 'Old', notes: '', config: '{}', sessionIds: [] });

    const updated = await updateStep(step.id, { title: 'New', notes: 'Updated', config: '{"x":1}', sessionIds: [sessionId2] });
    expect(updated.title).toBe('New');
    expect(updated.config).toEqual({x: 1});
    expect(updated.session_ids).toEqual([sessionId2]);
  });
});
