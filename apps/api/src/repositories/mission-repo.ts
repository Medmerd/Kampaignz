import { getDatabase } from '../database';

export type Mission = {
  id: number;
  campaign_id: number;
  title: string;
  config: Record<string, unknown>;
  missionDetails: string;
  map: string;
  created_at: string;
};

export type MissionInput = {
  title: string;
  config: Record<string, unknown>;
  missionDetails: string;
  map: string;
};

export const listMissionsByCampaign = async (campaignId: number): Promise<Mission[]> => {
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
    missionDetails: row.missionDetails,
    map: row.map,
    created_at: row.created_at,
  })) as Mission[];
};

export const createMission = async (campaignId: number, input: MissionInput): Promise<Mission> => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Mission title is required.');
  }

  const db = getDatabase();
  return db.transaction(async (trx) => {
    const configToSave = typeof input.config === 'string' ? input.config : JSON.stringify(input.config);

    const insertResult = await trx('missions').insert({
      campaign_id: campaignId,
      title,
      config: configToSave,
      missionDetails: input.missionDetails.trim(),
      map: input.map.trim(),
    }).returning('id');

    const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

    const row = await trx('missions')
      .select('id', 'campaign_id', 'title', 'config', 'missionDetails', 'map', 'created_at')
      .where({ id: insertedId })
      .first();

    if (!row) {
      throw new Error('Failed to create mission.');
    }

    return {
      id: row.id,
      campaign_id: row.campaign_id,
      title: row.title,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      missionDetails: row.missionDetails,
      map: row.map,
      created_at: row.created_at,
    } as Mission;
  });
};

export const updateMission = async (missionId: number, input: MissionInput): Promise<Mission> => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Mission title is required.');
  }

  const db = getDatabase();
  const configToSave = typeof input.config === 'string' ? input.config : JSON.stringify(input.config);

  const changes = await db('missions')
    .where({ id: missionId })
    .update({
      title,
      config: configToSave,
      missionDetails: input.missionDetails.trim(),
      map: input.map.trim(),
    });

  if (changes === 0) {
    throw new Error('Mission not found.');
  }

  const row = await db('missions')
    .select('id', 'campaign_id', 'title', 'config', 'missionDetails', 'map', 'created_at')
    .where({ id: missionId })
    .first();

  if (!row) {
    throw new Error('Failed to update mission.');
  }

  return {
    id: row.id,
    campaign_id: row.campaign_id,
    title: row.title,
    config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
    missionDetails: row.missionDetails,
    map: row.map,
    created_at: row.created_at,
  } as Mission;
};
