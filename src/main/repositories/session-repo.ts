import { getDatabase } from '../database';

export type Session = {
  id: number;
  campaign_id: number;
  title: string;
  config: Record<string, unknown>;
  sessionDetails: string;
  map: string;
  created_at: string;
};

export type SessionInput = {
  title: string;
  config: Record<string, unknown>;
  sessionDetails: string;
  map: string;
};

export const listSessionsByCampaign = async (campaignId: number): Promise<Session[]> => {
  const db = getDatabase();
  const rows = await db('missions')
    .select('id', 'campaign_id', 'title', 'config', 'missionDetails', 'map', 'created_at')
    .where({ campaign_id: campaignId })
    .orderBy('id', 'desc');

  return rows.map((row: any) => ({
    id: row.id,
    campaign_id: row.campaign_id,
    title: row.title,
    config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
    sessionDetails: row.missionDetails,
    map: row.map,
    created_at: row.created_at,
  })) as Session[];
};

export const createSession = async (campaignId: number, input: SessionInput): Promise<Session> => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Session title is required.');
  }

  const db = getDatabase();
  return db.transaction(async (trx) => {
    // Stringify for SQLite fallback, or just pass object. Knex sqlite3 driver usually stringifies json automatically.
    const configToSave = typeof input.config === 'string' ? input.config : JSON.stringify(input.config);

    const insertResult = await trx('missions').insert({
      campaign_id: campaignId,
      title,
      config: configToSave,
      missionDetails: input.sessionDetails.trim(),
      map: input.map.trim(),
    }).returning('id');

    const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

    const row = await trx('missions')
      .select('id', 'campaign_id', 'title', 'config', 'missionDetails', 'map', 'created_at')
      .where({ id: insertedId })
      .first();

    if (!row) {
      throw new Error('Failed to create session.');
    }

    return {
      id: row.id,
      campaign_id: row.campaign_id,
      title: row.title,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      sessionDetails: row.missionDetails,
      map: row.map,
      created_at: row.created_at,
    } as Session;
  });
};

export const updateSession = async (sessionId: number, input: SessionInput): Promise<Session> => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Session title is required.');
  }

  const db = getDatabase();
  const configToSave = typeof input.config === 'string' ? input.config : JSON.stringify(input.config);
  
  const changes = await db('missions')
    .where({ id: sessionId })
    .update({
      title,
      config: configToSave,
      missionDetails: input.sessionDetails.trim(),
      map: input.map.trim(),
    });

  if (changes === 0) {
    throw new Error('Session not found.');
  }

  const row = await db('missions')
    .select('id', 'campaign_id', 'title', 'config', 'missionDetails', 'map', 'created_at')
    .where({ id: sessionId })
    .first();

  if (!row) {
    throw new Error('Failed to update session.');
  }

  return {
    id: row.id,
    campaign_id: row.campaign_id,
    title: row.title,
    config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
    sessionDetails: row.missionDetails,
    map: row.map,
    created_at: row.created_at,
  } as Session;
};
