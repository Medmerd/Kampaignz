import { getDatabase } from '../database';

export type Player = {
  id: number;
  campaign_id: number;
  playerName: string;
  army: string;
  notes: string;
  config: string;
  created_at: string;
};

export type PlayerInput = {
  playerName: string;
  army: string;
  notes: string;
  config: string;
};

export const listPlayersByCampaign = async (campaignId: number): Promise<Player[]> => {
  const db = getDatabase();
  return db('players')
    .select('id', 'campaign_id', 'playerName', 'army', 'notes', 'config', 'created_at')
    .where({ campaign_id: campaignId })
    .orderBy('id', 'desc') as Promise<Player[]>;
};

export const createPlayer = async (campaignId: number, input: PlayerInput): Promise<Player> => {
  const playerName = input.playerName.trim();
  const army = input.army.trim();

  if (!playerName) {
    throw new Error('Player name is required.');
  }

  if (!army) {
    throw new Error('Army is required.');
  }

  const db = getDatabase();
  
  return db.transaction(async (trx) => {
    const insertResult = await trx('players').insert({
      campaign_id: campaignId,
      playerName,
      army,
      notes: input.notes.trim(),
      config: input.config,
    }).returning('id');

    const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

    const row = await trx('players')
      .select('id', 'campaign_id', 'playerName', 'army', 'notes', 'config', 'created_at')
      .where({ id: insertedId })
      .first() as Promise<Player | undefined>;

    if (!row) {
      throw new Error('Failed to create player.');
    }

    return row;
  });
};

export const updatePlayer = async (playerId: number, input: PlayerInput): Promise<Player> => {
  const playerName = input.playerName.trim();
  const army = input.army.trim();

  if (!playerName) {
    throw new Error('Player name is required.');
  }

  if (!army) {
    throw new Error('Army is required.');
  }

  const db = getDatabase();

  const changes = await db('players')
    .where({ id: playerId })
    .update({
      playerName,
      army,
      notes: input.notes.trim(),
      config: input.config,
    });

  if (changes === 0) {
    throw new Error('Player not found.');
  }

  const row = await db('players')
    .select('id', 'campaign_id', 'playerName', 'army', 'notes', 'config', 'created_at')
    .where({ id: playerId })
    .first() as Promise<Player | undefined>;

  if (!row) {
    throw new Error('Failed to update player.');
  }

  return row;
};
