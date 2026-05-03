import { getDatabase } from '../database';

export type Player = {
  id: number;
  campaign_id: number;
  playerName: string;
  army: string;
  notes: string;
  config: Record<string, unknown>;
  created_at: string;
};

export type PlayerInput = {
  playerName: string;
  army: string;
  notes: string;
  config: Record<string, unknown>;
};

type PlayerRow = Omit<Player, 'config'> & { config: string };

const mapPlayerRow = (row: PlayerRow): Player => ({
  ...row,
  config: JSON.parse(row.config) as Record<string, unknown>,
});

export const listPlayersByCampaign = (campaignId: number) => {
  const db = getDatabase();
  const rows = db
    .prepare(
      'SELECT id, campaign_id, playerName, army, notes, config, created_at FROM players WHERE campaign_id = ? ORDER BY id DESC',
    )
    .all(campaignId) as PlayerRow[];

  return rows.map(mapPlayerRow);
};

export const createPlayer = (campaignId: number, input: PlayerInput) => {
  const playerName = input.playerName.trim();
  const army = input.army.trim();

  if (!playerName) {
    throw new Error('Player name is required.');
  }

  if (!army) {
    throw new Error('Army is required.');
  }

  const db = getDatabase();
  const result = db
    .prepare(
      'INSERT INTO players (campaign_id, playerName, army, notes, config) VALUES (?, ?, ?, ?, ?)',
    )
    .run(
      campaignId,
      playerName,
      army,
      input.notes.trim(),
      JSON.stringify(input.config),
    );

  const row = db
    .prepare(
      'SELECT id, campaign_id, playerName, army, notes, config, created_at FROM players WHERE id = ?',
    )
    .get(result.lastInsertRowid) as PlayerRow | undefined;

  if (!row) {
    throw new Error('Failed to create player.');
  }

  return mapPlayerRow(row);
};

export const updatePlayer = (playerId: number, input: PlayerInput) => {
  const playerName = input.playerName.trim();
  const army = input.army.trim();

  if (!playerName) {
    throw new Error('Player name is required.');
  }

  if (!army) {
    throw new Error('Army is required.');
  }

  const db = getDatabase();
  const result = db
    .prepare(
      'UPDATE players SET playerName = ?, army = ?, notes = ?, config = ? WHERE id = ?',
    )
    .run(playerName, army, input.notes.trim(), JSON.stringify(input.config), playerId);

  if (result.changes === 0) {
    throw new Error('Player not found.');
  }

  const row = db
    .prepare(
      'SELECT id, campaign_id, playerName, army, notes, config, created_at FROM players WHERE id = ?',
    )
    .get(playerId) as PlayerRow | undefined;

  if (!row) {
    throw new Error('Failed to update player.');
  }

  return mapPlayerRow(row);
};
