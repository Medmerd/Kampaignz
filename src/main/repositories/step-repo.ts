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

type StepRow = Omit<Step, 'config'> & { config: string };

const mapStep = (row: StepRow): Step => ({
  ...row,
  config: JSON.parse(row.config) as Record<string, unknown>,
  session_ids: getSessionIdsForStep(row.id),
});

const getSessionIdsForStep = (stepId: number) => {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT session_id FROM step_sessions WHERE step_id = ? ORDER BY session_id ASC')
    .all(stepId) as Array<{ session_id: number }>;

  return rows.map((row) => row.session_id);
};

const validateAndNormalizeSessionIds = (campaignId: number, sessionIds: number[]) => {
  const normalized = Array.from(
    new Set(sessionIds.map((id) => Number(id)).filter(Number.isFinite)),
  );

  if (normalized.length === 0) {
    return normalized;
  }

  const db = getDatabase();
  const placeholders = normalized.map(() => '?').join(',');
  const sql = `SELECT id FROM sessions WHERE campaign_id = ? AND id IN (${placeholders})`;
  const rows = db.prepare(sql).all(campaignId, ...normalized) as Array<{ id: number }>;
  const found = new Set(rows.map((row) => row.id));

  for (const id of normalized) {
    if (!found.has(id)) {
      throw new Error('One or more selected sessions do not belong to this campaign.');
    }
  }

  return normalized;
};

export const listStepsByCampaign = (campaignId: number) => {
  const db = getDatabase();
  const rows = db
    .prepare(
      'SELECT id, campaign_id, title, notes, config, created_at FROM steps WHERE campaign_id = ? ORDER BY id ASC',
    )
    .all(campaignId) as StepRow[];

  return rows.map(mapStep);
};

export const createStep = (campaignId: number, input: StepInput) => {
  const title = input.title.trim();

  if (!title) {
    throw new Error('Step title is required.');
  }

  const db = getDatabase();
  const sessionIds = validateAndNormalizeSessionIds(campaignId, input.sessionIds);

  const transaction = db.transaction(() => {
    const result = db
      .prepare('INSERT INTO steps (campaign_id, title, notes, config) VALUES (?, ?, ?, ?)')
      .run(campaignId, title, input.notes.trim(), JSON.stringify(input.config));
    const stepId = Number(result.lastInsertRowid);

    const insertLink = db.prepare('INSERT INTO step_sessions (step_id, session_id) VALUES (?, ?)');
    for (const sessionId of sessionIds) {
      insertLink.run(stepId, sessionId);
    }

    const row = db
      .prepare(
        'SELECT id, campaign_id, title, notes, config, created_at FROM steps WHERE id = ?',
      )
      .get(stepId) as StepRow | undefined;

    if (!row) {
      throw new Error('Failed to create step.');
    }

    return mapStep(row);
  });

  return transaction();
};

export const updateStep = (stepId: number, input: StepInput) => {
  const title = input.title.trim();

  if (!title) {
    throw new Error('Step title is required.');
  }

  const db = getDatabase();
  const existing = db
    .prepare('SELECT id, campaign_id FROM steps WHERE id = ?')
    .get(stepId) as { id: number; campaign_id: number } | undefined;

  if (!existing) {
    throw new Error('Step not found.');
  }

  const sessionIds = validateAndNormalizeSessionIds(
    existing.campaign_id,
    input.sessionIds,
  );

  const transaction = db.transaction(() => {
    db.prepare('UPDATE steps SET title = ?, notes = ?, config = ? WHERE id = ?').run(
      title,
      input.notes.trim(),
      JSON.stringify(input.config),
      stepId,
    );

    db.prepare('DELETE FROM step_sessions WHERE step_id = ?').run(stepId);
    const insertLink = db.prepare('INSERT INTO step_sessions (step_id, session_id) VALUES (?, ?)');
    for (const sessionId of sessionIds) {
      insertLink.run(stepId, sessionId);
    }

    const row = db
      .prepare(
        'SELECT id, campaign_id, title, notes, config, created_at FROM steps WHERE id = ?',
      )
      .get(stepId) as StepRow | undefined;

    if (!row) {
      throw new Error('Failed to update step.');
    }

    return mapStep(row);
  });

  return transaction();
};
