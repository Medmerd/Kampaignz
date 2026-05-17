import { getDatabase } from '../database';

export type Campaign = {
  id: number;
  name: string;
  expectedSessions: number;
  config: string;
  created_at: string;
};

export const createCampaign = (name: string) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('Campaign name is required.');
  }

  const db = getDatabase();

  const transaction = db.transaction((campaignName: string) => {
    const result = db
      .prepare('INSERT INTO campaigns (name) VALUES (?)')
      .run(campaignName);

    const created = db
      .prepare(
        'SELECT id, name, expectedSessions, config, created_at FROM campaigns WHERE id = ?',
      )
      .get(result.lastInsertRowid) as Campaign | undefined;

    if (!created) {
      throw new Error('Failed to create campaign.');
    }

    return created;
  });

  return transaction(trimmedName);
};

export const listCampaigns = () => {
  const db = getDatabase();

  return db
    .prepare(
      'SELECT id, name, expectedSessions, config, created_at FROM campaigns ORDER BY id DESC',
    )
    .all() as Campaign[];
};

export const getCampaignById = (id: number) => {
  const db = getDatabase();

  const row = db
    .prepare(
      'SELECT id, name, expectedSessions, config, created_at FROM campaigns WHERE id = ?',
    )
    .get(id) as Campaign | undefined;

  return row;
};

export type CampaignDetailsInput = {
  name: string;
  expectedSessions: number;
  config: string;
};

export const updateCampaignDetails = (id: number, input: CampaignDetailsInput) => {
  const trimmedName = input.name.trim();
  const expectedSessions = Math.max(1, Math.floor(input.expectedSessions));
  if (!trimmedName) {
    throw new Error('Campaign name is required.');
  }

  const db = getDatabase();

  const result = db
    .prepare('UPDATE campaigns SET name = ?, expectedSessions = ?, config = ? WHERE id = ?')
    .run(trimmedName, expectedSessions, input.config, id);

  if (result.changes === 0) {
    throw new Error('Campaign not found.');
  }

  const updated = db
    .prepare(
      'SELECT id, name, expectedSessions, config, created_at FROM campaigns WHERE id = ?',
    )
    .get(id) as Campaign | undefined;

  if (!updated) {
    throw new Error('Failed to update campaign.');
  }

  return updated;
};
