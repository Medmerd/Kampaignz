import { getDatabase } from '../database';

export type Campaign = {
  id: number;
  name: string;
  expectedSessions: number;
  config: string;
  created_at: string;
};

export const createCampaign = async (name: string): Promise<Campaign> => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('Campaign name is required.');
  }

  const db = getDatabase();

  return db.transaction(async (trx) => {
    const insertResult = await trx('campaigns').insert({ name: trimmedName }).returning('id');
    const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

    const created = (await trx('campaigns')
      .select('id', 'name', 'expectedSessions', 'config', 'created_at')
      .where({ id: insertedId })
      .first()) as Campaign | undefined;

    if (!created) {
      throw new Error('Failed to create campaign.');
    }

    return created;
  });
};

export const listCampaigns = async (): Promise<Campaign[]> => {
  const db = getDatabase();

  return db('campaigns')
    .select('id', 'name', 'expectedSessions', 'config', 'created_at')
    .orderBy('id', 'desc') as Promise<Campaign[]>;
};

export const getCampaignById = async (id: number): Promise<Campaign | undefined> => {
  const db = getDatabase();

  return db('campaigns')
    .select('id', 'name', 'expectedSessions', 'config', 'created_at')
    .where({ id })
    .first() as Promise<Campaign | undefined>;
};

export type CampaignDetailsInput = {
  name: string;
  expectedSessions: number;
  config: string;
};

export const updateCampaignDetails = async (id: number, input: CampaignDetailsInput): Promise<Campaign> => {
  const trimmedName = input.name.trim();
  const expectedSessions = Math.max(1, Math.floor(input.expectedSessions));
  if (!trimmedName) {
    throw new Error('Campaign name is required.');
  }

  const db = getDatabase();

  const changes = await db('campaigns')
    .where({ id })
    .update({
      name: trimmedName,
      expectedSessions,
      config: input.config,
    });

  if (changes === 0) {
    throw new Error('Campaign not found.');
  }

  const updated = (await db('campaigns')
    .select('id', 'name', 'expectedSessions', 'config', 'created_at')
    .where({ id })
    .first()) as Campaign | undefined;

  if (!updated) {
    throw new Error('Failed to update campaign.');
  }

  return updated;
};
