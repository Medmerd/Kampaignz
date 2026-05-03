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

type SessionRow = Omit<Session, 'config'> & { config: string };

const mapSession = (row: SessionRow): Session => ({
  ...row,
  config: JSON.parse(row.config) as Record<string, unknown>,
});

export const listSessionsByCampaign = (campaignId: number) => {
  const db = getDatabase();
  const rows = db
    .prepare(
      'SELECT id, campaign_id, title, config, sessionDetails, map, created_at FROM sessions WHERE campaign_id = ? ORDER BY id DESC',
    )
    .all(campaignId) as SessionRow[];

  return rows.map(mapSession);
};

export const createSession = (campaignId: number, input: SessionInput) => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Session title is required.');
  }

  const db = getDatabase();
  const result = db
    .prepare(
      'INSERT INTO sessions (campaign_id, title, config, sessionDetails, map) VALUES (?, ?, ?, ?, ?)',
    )
    .run(
      campaignId,
      title,
      JSON.stringify(input.config),
      input.sessionDetails.trim(),
      input.map.trim(),
    );

  const row = db
    .prepare(
      'SELECT id, campaign_id, title, config, sessionDetails, map, created_at FROM sessions WHERE id = ?',
    )
    .get(result.lastInsertRowid) as SessionRow | undefined;

  if (!row) {
    throw new Error('Failed to create session.');
  }

  return mapSession(row);
};

export const updateSession = (sessionId: number, input: SessionInput) => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Session title is required.');
  }

  const db = getDatabase();
  const result = db
    .prepare(
      'UPDATE sessions SET title = ?, config = ?, sessionDetails = ?, map = ? WHERE id = ?',
    )
    .run(
      title,
      JSON.stringify(input.config),
      input.sessionDetails.trim(),
      input.map.trim(),
      sessionId,
    );

  if (result.changes === 0) {
    throw new Error('Session not found.');
  }

  const row = db
    .prepare(
      'SELECT id, campaign_id, title, config, sessionDetails, map, created_at FROM sessions WHERE id = ?',
    )
    .get(sessionId) as SessionRow | undefined;

  if (!row) {
    throw new Error('Failed to update session.');
  }

  return mapSession(row);
};
