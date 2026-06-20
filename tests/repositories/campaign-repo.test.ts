import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaignDetails,
} from '../../src/main/repositories/campaign-repo';

describe('campaign-repo', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('creates a campaign and returns the inserted row', async () => {
    const campaign = await createCampaign('  Alpha  ');
    
    expect(campaign.name).toBe('Alpha');
    expect(campaign.expectedSessions).toBe(1);
    expect(campaign.config).toBe('{}');
    expect(campaign.id).toBeDefined();
    expect(campaign.created_at).toBeDefined();
  });

  it('lists campaigns in descending order', async () => {
    const c1 = await createCampaign('First');
    const c2 = await createCampaign('Second');

    const list = await listCampaigns();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(c2.id);
    expect(list[1].id).toBe(c1.id);
  });

  it('gets campaign by id', async () => {
    const campaign = await createCampaign('B');
    const fetched = await getCampaignById(campaign.id);
    
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(campaign.id);
  });

  it('updates campaign details and returns updated row', async () => {
    const campaign = await createCampaign('Original');
    
    const updated = await updateCampaignDetails(campaign.id, {
      name: '  Updated  ',
      expectedSessions: 4,
      config: '{"tone":"dark"}',
    });

    expect(updated.name).toBe('Updated');
    expect(updated.expectedSessions).toBe(4);
    expect(updated.config).toBe('{"tone":"dark"}');
  });

  it('throws on empty campaign name', async () => {
    await expect(createCampaign('   ')).rejects.toThrow('Campaign name is required.');
    
    const campaign = await createCampaign('Valid');
    await expect(
      updateCampaignDetails(campaign.id, { name: '   ', expectedSessions: 1, config: '{}' }),
    ).rejects.toThrow('Campaign name is required.');
  });
});
