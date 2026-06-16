import { getDatabase } from '../database';

export type Player = {
  id: number;
  campaign_id: number;
  playerName: string;
  army_rule_id: number | null;
  army_rule_name?: string;
  notes: string;
  config: string;
  created_at: string;
};

export type PlayerInput = {
  playerName: string;
  army_rule_id: number | null;
  notes: string;
  config: string;
};

export const listPlayersByCampaign = async (campaignId: number): Promise<Player[]> => {
  const db = getDatabase();
  return db('players')
    .leftJoin('army_rules', 'players.army_rule_id', 'army_rules.id')
    .select(
      'players.id',
      'players.campaign_id',
      'players.playerName',
      'players.army_rule_id',
      'army_rules.name as army_rule_name',
      'players.notes',
      'players.config',
      'players.created_at'
    )
    .where({ 'players.campaign_id': campaignId })
    .orderBy('players.id', 'desc') as Promise<Player[]>;
};

export const createPlayer = async (campaignId: number, input: PlayerInput): Promise<Player> => {
  const playerName = input.playerName.trim();

  if (!playerName) {
    throw new Error('Player name is required.');
  }

  const db = getDatabase();
  
  return db.transaction(async (trx) => {
    const insertResult = await trx('players').insert({
      campaign_id: campaignId,
      playerName,
      army_rule_id: input.army_rule_id,
      notes: input.notes.trim(),
      config: input.config,
    }).returning('id');

    const insertedId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

    const row = await trx('players')
      .leftJoin('army_rules', 'players.army_rule_id', 'army_rules.id')
      .select(
        'players.id',
        'players.campaign_id',
        'players.playerName',
        'players.army_rule_id',
        'army_rules.name as army_rule_name',
        'players.notes',
        'players.config',
        'players.created_at'
      )
      .where({ 'players.id': insertedId })
      .first() as Promise<Player | undefined>;

    if (!row) {
      throw new Error('Failed to create player.');
    }

    return row;
  });
};

export const updatePlayer = async (playerId: number, input: PlayerInput): Promise<Player> => {
  const playerName = input.playerName.trim();

  if (!playerName) {
    throw new Error('Player name is required.');
  }

  const db = getDatabase();

  const changes = await db('players')
    .where({ id: playerId })
    .update({
      playerName,
      army_rule_id: input.army_rule_id,
      notes: input.notes.trim(),
      config: input.config,
    });

  if (changes === 0) {
    throw new Error('Player not found.');
  }

  const row = await db('players')
    .leftJoin('army_rules', 'players.army_rule_id', 'army_rules.id')
    .select(
      'players.id',
      'players.campaign_id',
      'players.playerName',
      'players.army_rule_id',
      'army_rules.name as army_rule_name',
      'players.notes',
      'players.config',
      'players.created_at'
    )
    .where({ 'players.id': playerId })
    .first() as Promise<Player | undefined>;

  if (!row) {
    throw new Error('Failed to update player.');
  }

  return row;
};
