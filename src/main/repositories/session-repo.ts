import { getDatabase } from '../database';

export type Session = {
  id: number;
  campaign_id: number;
  title: string;
  notes: string;
  config: Record<string, unknown>;
  mission_ids: number[];
  created_at: string;
};

export type SessionInput = {
  title: string;
  notes: string;
  config: Record<string, unknown>;
  missionIds: number[];
};

const getMissionIdsForSession = async (sessionId: number): Promise<number[]> => {
  const db = getDatabase();
  const rows = await db('session_missions')
    .select('mission_id')
    .where({ session_id: sessionId })
    .orderBy('mission_id', 'asc');

  return rows.map((row: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => row.mission_id);
};

const mapSession = async (row: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): Promise<Session> => ({
  id: row.id,
  campaign_id: row.campaign_id || 0,
  title: row.title,
  notes: row.notes || row.sessionDetails || '',
  config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
  mission_ids: await getMissionIdsForSession(row.id),
  created_at: row.created_at,
});

const validateAndNormalizeMissionIds = async (campaignId: number, missionIds: number[]): Promise<number[]> => {
  const normalized = Array.from(
    new Set(missionIds.map((id) => Number(id)).filter(Number.isFinite)),
  );

  if (normalized.length === 0) {
    return normalized;
  }

  const db = getDatabase();
  const rows = await db('missions')
    .select('id')
    .where({ campaign_id: campaignId })
    .whereIn('id', normalized);
    
  const found = new Set(rows.map((row: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => row.id));

  for (const id of normalized) {
    if (!found.has(id)) {
      throw new Error('One or more selected missions do not belong to this campaign.');
    }
  }

  return normalized;
};

export const listSessionsByCampaign = async (campaignId: number): Promise<Session[]> => {
  const db = getDatabase();
  const rows = await db('sessions')
    .select('*')
    .where({ campaign_id: campaignId })
    .orderBy('id', 'asc');

  return Promise.all(rows.map(mapSession));
};

export const createSession = async (campaignId: number, input: SessionInput): Promise<Session> => {
  const title = input.title.trim();

  if (!title) {
    throw new Error('Session title is required.');
  }

  const db = getDatabase();
  const missionIds = await validateAndNormalizeMissionIds(campaignId, input.missionIds);

  return db.transaction(async (trx) => {
    const configToSave = typeof input.config === 'string' ? input.config : JSON.stringify(input.config);

    const insertResult = await trx('sessions').insert({
      campaign_id: campaignId,
      title,
      sessionDetails: input.notes.trim(),
      config: configToSave,
    }).returning('id');
    
    const sessionId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

    const sessionMissions = missionIds.map(missionId => ({
      session_id: sessionId,
      mission_id: missionId
    }));

    if (sessionMissions.length > 0) {
      await trx('session_missions').insert(sessionMissions);
    }

    const row = await trx('sessions').where({ id: sessionId }).first();

    if (!row) {
      throw new Error('Failed to create session.');
    }

    return {
      id: row.id,
      campaign_id: row.campaign_id || campaignId,
      title: row.title,
      notes: row.notes || row.sessionDetails || '',
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      mission_ids: missionIds,
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
  const existing = await db('sessions')
    .select('id', 'campaign_id')
    .where({ id: sessionId })
    .first();

  if (!existing) {
    throw new Error('Session not found.');
  }

  const missionIds = await validateAndNormalizeMissionIds(
    existing.campaign_id,
    input.missionIds,
  );

  return db.transaction(async (trx) => {
    const configToSave = typeof input.config === 'string' ? input.config : JSON.stringify(input.config);

    await trx('sessions')
      .where({ id: sessionId })
      .update({
        title,
        sessionDetails: input.notes.trim(),
        config: configToSave,
      });

    await trx('session_missions').where({ session_id: sessionId }).delete();

    const sessionMissions = missionIds.map(missionId => ({
      session_id: sessionId,
      mission_id: missionId
    }));

    if (sessionMissions.length > 0) {
      await trx('session_missions').insert(sessionMissions);
    }

    const row = await trx('sessions').where({ id: sessionId }).first();

    if (!row) {
      throw new Error('Failed to update session.');
    }

    return {
      id: row.id,
      campaign_id: row.campaign_id,
      title: row.title,
      notes: row.notes || row.sessionDetails || '',
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      mission_ids: missionIds,
      created_at: row.created_at,
    } as Session;
  });
};
