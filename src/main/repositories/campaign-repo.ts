import { getDatabase } from '../database';

export type Campaign = {
  id: number;
  name: string;
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
