import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createSession,
  listSessionsByCampaign,
  updateSession,
  type SessionInput,
} from '../../src/main/repositories/session-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';

const baseInput: SessionInput = {
  title: 'Mission 1',
  config: { time: 'Day' },
  sessionDetails: 'Briefing',
  map: 'Map A',
};

describe('session-repo', () => {
  let campaignId: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('lists sessions', async () => {
    const s1 = await createSession(campaignId, baseInput);
    const s2 = await createSession(campaignId, { ...baseInput, title: 'Mission 2' });

    const list = await listSessionsByCampaign(campaignId);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(s2.id);
    expect(list[1].id).toBe(s1.id);
  });

  it('creates a session and returns row', async () => {
    const session = await createSession(campaignId, baseInput);
    expect(session.title).toBe('Mission 1');
    expect(session.sessionDetails).toBe('Briefing');
    expect(session.map).toBe('Map A');
    expect(session.config).toEqual({ time: 'Day' });
    expect(session.id).toBeDefined();
  });

  it('updates a session and returns row', async () => {
    const session = await createSession(campaignId, baseInput);
    
    const updated = await updateSession(session.id, {
        title: 'Mission 1.5',
        config: { time: 'Night' },
        sessionDetails: 'Debriefing',
        map: 'Map B',
    });

    expect(updated.title).toBe('Mission 1.5');
    expect(updated.sessionDetails).toBe('Debriefing');
    expect(updated.map).toBe('Map B');
    expect(updated.config).toEqual({ time: 'Night' });
  });

  it('validates session title', async () => {
    await expect(createSession(campaignId, { ...baseInput, title: '   ' })).rejects.toThrow(
      'Session title is required.',
    );
  });
});
