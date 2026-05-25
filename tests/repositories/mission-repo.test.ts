import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createMission,
  listMissionsByCampaign,
  updateMission,
  type MissionInput,
} from '../../src/main/repositories/mission-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';

const baseInput: MissionInput = {
  title: 'Mission 1',
  config: { time: 'Day' },
  missionDetails: 'Briefing',
  map: 'Map A',
};

describe('mission-repo', () => {
  let campaignId: number;

  beforeEach(async () => {
    await setupTestDatabase();
    const campaign = await createCampaign('Test Campaign');
    campaignId = campaign.id;
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('lists missions', async () => {
    const m1 = await createMission(campaignId, baseInput);
    const m2 = await createMission(campaignId, { ...baseInput, title: 'Mission 2' });

    const list = await listMissionsByCampaign(campaignId);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(m2.id);
    expect(list[1].id).toBe(m1.id);
  });

  it('creates a mission and returns row', async () => {
    const mission = await createMission(campaignId, baseInput);
    expect(mission.title).toBe('Mission 1');
    expect(mission.missionDetails).toBe('Briefing');
    expect(mission.map).toBe('Map A');
    expect(mission.config).toEqual({ time: 'Day' });
    expect(mission.id).toBeDefined();
  });

  it('updates a mission and returns row', async () => {
    const mission = await createMission(campaignId, baseInput);
    
    const updated = await updateMission(mission.id, {
        title: 'Mission 1.5',
        config: { time: 'Night' },
        missionDetails: 'Debriefing',
        map: 'Map B',
    });

    expect(updated.title).toBe('Mission 1.5');
    expect(updated.missionDetails).toBe('Debriefing');
    expect(updated.map).toBe('Map B');
    expect(updated.config).toEqual({ time: 'Night' });
  });

  it('validates mission title', async () => {
    await expect(createMission(campaignId, { ...baseInput, title: '   ' })).rejects.toThrow(
      'Mission title is required.',
    );
  });
});
