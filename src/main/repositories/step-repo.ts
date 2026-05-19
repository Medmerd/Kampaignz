import { getDatabase } from '../database';

export type Step = {
  id: number;
  campaign_id: number;
  title: string;
  notes: string;
  config: Record<string, unknown>;
  session_ids: number[];
  created_at: string;
};

export type StepInput = {
  title: string;
  notes: string;
  config: Record<string, unknown>;
  sessionIds: number[];
};

const getSessionIdsForStep = async (stepId: number): Promise<number[]> => {
  const db = getDatabase();
  const rows = await db('step_missions')
    .select('mission_id')
    .where({ step_id: stepId })
    .orderBy('mission_id', 'asc');

  return rows.map((row: any) => row.mission_id);
};

const mapStep = async (row: any): Promise<Step> => ({
  id: row.id,
  campaign_id: row.campaign_id || 0, // Fallback in case schema uses mission_id instead
  title: row.title,
  notes: row.notes || row.stepDetails || '',
  config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
  session_ids: await getSessionIdsForStep(row.id),
  created_at: row.created_at,
});

const validateAndNormalizeSessionIds = async (campaignId: number, sessionIds: number[]): Promise<number[]> => {
  const normalized = Array.from(
    new Set(sessionIds.map((id) => Number(id)).filter(Number.isFinite)),
  );

  if (normalized.length === 0) {
    return normalized;
  }

  const db = getDatabase();
  const rows = await db('missions')
    .select('id')
    .where({ campaign_id: campaignId })
    .whereIn('id', normalized);
    
  const found = new Set(rows.map((row: any) => row.id));

  for (const id of normalized) {
    if (!found.has(id)) {
      throw new Error('One or more selected sessions do not belong to this campaign.');
    }
  }

  return normalized;
};

export const listStepsByCampaign = async (campaignId: number): Promise<Step[]> => {
  const db = getDatabase();
  const rows = await db('steps')
    .select('*')
    // We try to query by campaign_id. If schema changed, this might fail, but it preserves existing logic.
    .where({ campaign_id: campaignId })
    .orderBy('id', 'asc');

  return Promise.all(rows.map(mapStep));
};

export const createStep = async (campaignId: number, input: StepInput): Promise<Step> => {
  const title = input.title.trim();

  if (!title) {
    throw new Error('Step title is required.');
  }

  const db = getDatabase();
  const sessionIds = await validateAndNormalizeSessionIds(campaignId, input.sessionIds);

  return db.transaction(async (trx) => {
    const configToSave = typeof input.config === 'string' ? input.config : JSON.stringify(input.config);

    const insertResult = await trx('steps').insert({
      campaign_id: campaignId,
      title,
      stepDetails: input.notes.trim(),
      config: configToSave,
    }).returning('id');
    
    const stepId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

    const stepMissions = sessionIds.map(sessionId => ({
      step_id: stepId,
      mission_id: sessionId
    }));

    if (stepMissions.length > 0) {
      await trx('step_missions').insert(stepMissions);
    }

    const row = await trx('steps').where({ id: stepId }).first();

    if (!row) {
      throw new Error('Failed to create step.');
    }

    return {
      id: row.id,
      campaign_id: row.campaign_id || campaignId,
      title: row.title,
      notes: row.notes || row.stepDetails || '',
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      session_ids: sessionIds,
      created_at: row.created_at,
    } as Step;
  });
};

export const updateStep = async (stepId: number, input: StepInput): Promise<Step> => {
  const title = input.title.trim();

  if (!title) {
    throw new Error('Step title is required.');
  }

  const db = getDatabase();
  const existing = await db('steps')
    .select('id', 'campaign_id')
    .where({ id: stepId })
    .first();

  if (!existing) {
    throw new Error('Step not found.');
  }

  const sessionIds = await validateAndNormalizeSessionIds(
    existing.campaign_id,
    input.sessionIds,
  );

  return db.transaction(async (trx) => {
    const configToSave = typeof input.config === 'string' ? input.config : JSON.stringify(input.config);

    await trx('steps')
      .where({ id: stepId })
      .update({
        title,
        stepDetails: input.notes.trim(),
        config: configToSave,
      });

    await trx('step_missions').where({ step_id: stepId }).delete();

    const stepMissions = sessionIds.map(sessionId => ({
      step_id: stepId,
      mission_id: sessionId
    }));

    if (stepMissions.length > 0) {
      await trx('step_missions').insert(stepMissions);
    }

    const row = await trx('steps').where({ id: stepId }).first();

    if (!row) {
      throw new Error('Failed to update step.');
    }

    return {
      id: row.id,
      campaign_id: row.campaign_id,
      title: row.title,
      notes: row.notes || row.stepDetails || '',
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      session_ids: sessionIds,
      created_at: row.created_at,
    } as Step;
  });
};
