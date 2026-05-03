import { getDatabase } from '../database';

export type Message = {
  id: number;
  campaign_id: number;
  content: string;
  config: Record<string, unknown>;
  player_ids: number[];
  created_at: string;
};

export type MessageInput = {
  content: string;
  config: Record<string, unknown>;
  playerIds: number[];
};

type MessageRow = {
  id: number;
  campaign_id: number;
  content: string;
  config: string;
  created_at: string;
};

const getPlayerIdsForMessage = (messageId: number) => {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT player_id FROM message_players WHERE message_id = ? ORDER BY player_id ASC')
    .all(messageId) as Array<{ player_id: number }>;

  return rows.map((row) => row.player_id);
};

const mapMessage = (row: MessageRow): Message => ({
  ...row,
  config: JSON.parse(row.config) as Record<string, unknown>,
  player_ids: getPlayerIdsForMessage(row.id),
});

const hasConfigContent = (config: Record<string, unknown>) =>
  Object.keys(config).length > 0;

const validateAndNormalizePlayerIds = (campaignId: number, playerIds: number[]) => {
  const normalized = Array.from(new Set(playerIds.map((id) => Number(id)).filter(Number.isFinite)));
  if (normalized.length === 0) {
    return normalized;
  }

  const db = getDatabase();
  const placeholders = normalized.map(() => '?').join(',');
  const sql = `SELECT id FROM players WHERE campaign_id = ? AND id IN (${placeholders})`;
  const rows = db.prepare(sql).all(campaignId, ...normalized) as Array<{ id: number }>;
  const found = new Set(rows.map((row) => row.id));

  for (const id of normalized) {
    if (!found.has(id)) {
      throw new Error('One or more selected players do not belong to this campaign.');
    }
  }

  return normalized;
};

export const listMessagesByCampaign = (campaignId: number) => {
  const db = getDatabase();
  const rows = db
    .prepare('SELECT id, campaign_id, content, config, created_at FROM messages WHERE campaign_id = ? ORDER BY id DESC')
    .all(campaignId) as MessageRow[];

  return rows.map(mapMessage);
};

export const createMessage = (campaignId: number, input: MessageInput) => {
  const content = input.content.trim();
  const config = input.config;

  if (!content && !hasConfigContent(config)) {
    throw new Error('Message content or config is required.');
  }

  const playerIds = validateAndNormalizePlayerIds(campaignId, input.playerIds);
  const db = getDatabase();

  const transaction = db.transaction(() => {
    const result = db
      .prepare('INSERT INTO messages (campaign_id, content, config) VALUES (?, ?, ?)')
      .run(campaignId, content, JSON.stringify(config));
    const messageId = Number(result.lastInsertRowid);

    const insertLink = db.prepare('INSERT INTO message_players (message_id, player_id) VALUES (?, ?)');
    for (const playerId of playerIds) {
      insertLink.run(messageId, playerId);
    }

    const row = db
      .prepare('SELECT id, campaign_id, content, config, created_at FROM messages WHERE id = ?')
      .get(messageId) as MessageRow | undefined;

    if (!row) {
      throw new Error('Failed to create message.');
    }

    return mapMessage(row);
  });

  return transaction();
};

export const updateMessage = (messageId: number, input: MessageInput) => {
  const content = input.content.trim();
  const config = input.config;

  if (!content && !hasConfigContent(config)) {
    throw new Error('Message content or config is required.');
  }

  const db = getDatabase();
  const existing = db
    .prepare('SELECT id, campaign_id, content, config, created_at FROM messages WHERE id = ?')
    .get(messageId) as MessageRow | undefined;

  if (!existing) {
    throw new Error('Message not found.');
  }

  const playerIds = validateAndNormalizePlayerIds(existing.campaign_id, input.playerIds);

  const transaction = db.transaction(() => {
    db
      .prepare('UPDATE messages SET content = ?, config = ? WHERE id = ?')
      .run(content, JSON.stringify(config), messageId);
    db.prepare('DELETE FROM message_players WHERE message_id = ?').run(messageId);

    const insertLink = db.prepare('INSERT INTO message_players (message_id, player_id) VALUES (?, ?)');
    for (const playerId of playerIds) {
      insertLink.run(messageId, playerId);
    }

    const row = db
      .prepare('SELECT id, campaign_id, content, config, created_at FROM messages WHERE id = ?')
      .get(messageId) as MessageRow | undefined;

    if (!row) {
      throw new Error('Failed to update message.');
    }

    return mapMessage(row);
  });

  return transaction();
};
