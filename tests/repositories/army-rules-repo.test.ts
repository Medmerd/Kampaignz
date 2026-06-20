import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../src/main/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import {
  createArmyRulebook,
  getArmyRulebookById,
  listArmyRulebooksByCampaign,
  updateArmyRulebook,
  shareArmyRulebookWithCampaign,
  removeArmyRulebookShare,
} from '../../src/main/repositories/army-rules-repo';
import { createCampaign } from '../../src/main/repositories/campaign-repo';

describe('army-rules-repo', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  it('creates an army rulebook and returns the inserted row', async () => {
    const campaign = await createCampaign('Campaign A');
    const rulebook = await createArmyRulebook(campaign.id, { name: '  Space Marines  ', description: 'desc' });
    
    expect(rulebook.name).toBe('Space Marines');
    expect(rulebook.description).toBe('desc');
    expect(rulebook.original_campaign_id).toBe(campaign.id);
    expect(rulebook.id).toBeDefined();
    expect(rulebook.created_at).toBeDefined();
  });

  it('lists army rulebooks, including shared ones', async () => {
    const campaign1 = await createCampaign('C1');
    const campaign2 = await createCampaign('C2');

    await createArmyRulebook(campaign1.id, { name: 'RB1', description: '' });
    const rb2 = await createArmyRulebook(campaign2.id, { name: 'RB2', description: '' });

    // Share RB2 with Campaign 1
    await shareArmyRulebookWithCampaign(rb2.id, campaign1.id);

    const list = await listArmyRulebooksByCampaign(campaign1.id);
    expect(list).toHaveLength(2);
    // Ordered by name
    expect(list[0].name).toBe('RB1');
    expect(list[1].name).toBe('RB2');
  });

  it('gets army rulebook by id', async () => {
    const campaign = await createCampaign('C');
    const rb = await createArmyRulebook(campaign.id, { name: 'A', description: '' });
    const fetched = await getArmyRulebookById(rb.id);
    
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(rb.id);
  });

  it('updates army rulebook details and returns updated row', async () => {
    const campaign = await createCampaign('C');
    const rb = await createArmyRulebook(campaign.id, { name: 'Old', description: '' });
    
    const updated = await updateArmyRulebook(rb.id, {
      name: 'New',
      description: 'New Desc',
    });

    expect(updated.name).toBe('New');
    expect(updated.description).toBe('New Desc');
  });

  it('removes share correctly', async () => {
    const campaign1 = await createCampaign('C1');
    const campaign2 = await createCampaign('C2');

    const rb = await createArmyRulebook(campaign2.id, { name: 'RB', description: '' });
    await shareArmyRulebookWithCampaign(rb.id, campaign1.id);

    let list = await listArmyRulebooksByCampaign(campaign1.id);
    expect(list).toHaveLength(1);

    await removeArmyRulebookShare(rb.id, campaign1.id);

    list = await listArmyRulebooksByCampaign(campaign1.id);
    expect(list).toHaveLength(0);
  });
});
