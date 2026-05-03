import { getDatabase } from '../database';

export type Campaign = {
  id: number;
  name: string;
  created_at: string;
};

const mapCampaign =
  'SELECT id, name, created_at FROM campaigns WHERE id = ?';

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
      .prepare('SELECT id, name, created_at FROM campaigns WHERE id = ?')
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
    .prepare('SELECT id, name, created_at FROM campaigns ORDER BY id DESC')
    .all() as Campaign[];
};

export const getCampaignById = (id: number) => {
  const db = getDatabase();

  return db.prepare(mapCampaign).get(id) as Campaign | undefined;
};

export const updateCampaignName = (id: number, name: string) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('Campaign name is required.');
  }

  const db = getDatabase();

  const result = db
    .prepare('UPDATE campaigns SET name = ? WHERE id = ?')
    .run(trimmedName, id);

  if (result.changes === 0) {
    throw new Error('Campaign not found.');
  }

  const updated = db.prepare(mapCampaign).get(id) as Campaign | undefined;

  if (!updated) {
    throw new Error('Failed to update campaign.');
  }

  return updated;
};
