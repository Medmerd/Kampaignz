import { getDatabase } from '../database';
import { Message, MessageInput } from '../../renderer/types';

type MessageRow = {
  id: number;
  campaign_id: number;
  content: string;
  config: string;
  created_at: string;
};

const getPlayerIdsForMessage = async (messageId: number): Promise<number[]> => {
  const db = getDatabase();
  const rows = await db('message_players')
    .select('player_id')
    .where({ message_id: messageId })
    .orderBy('player_id', 'asc') as Array<{ player_id: number }>;

  return rows.map((row) => row.player_id);
};

const mapMessage = async (row: MessageRow): Promise<Message> => ({
  ...row,
  player_ids: await getPlayerIdsForMessage(row.id),
});

const hasConfigContent = (config: string) => config && config !== '{}' && config.length > 0;

const validateAndNormalizePlayerIds = async (campaignId: number, playerIds: number[]): Promise<number[]> => {
  const normalized = playerIds && playerIds.length > 0 ? Array.from(new Set(playerIds.map((id) => Number(id)).filter(Number.isFinite))) : [];
  if (normalized.length === 0) {
    return normalized;
  }

  const db = getDatabase();
  const rows = await db('players')
    .select('id')
    .where({ campaign_id: campaignId })
    .whereIn('id', normalized) as Array<{ id: number }>;
    
  const found = new Set(rows.map((row) => row.id));

  for (const id of normalized) {
    if (!found.has(id)) {
      throw new Error('One or more selected players do not belong to this campaign.');
    }
  }

  return normalized;
};

export const listMessagesByCampaign = async (campaignId: number): Promise<Message[]> => {
  const db = getDatabase();
  const rows = await db('messages')
    .select('id', 'campaign_id', 'content', 'config', 'created_at')
    .where({ campaign_id: campaignId })
    .orderBy('id', 'desc') as MessageRow[];

  return Promise.all(rows.map(mapMessage));
};

export const createMessage = async (campaignId: number, input: MessageInput): Promise<Message> => {
  const content = input.content.trim();
  const config = input.config;

  if (!content && !hasConfigContent(config)) {
    throw new Error('Message content or config is required.');
  }

  const playerIds = await validateAndNormalizePlayerIds(campaignId, input.playerIds);
  const db = getDatabase();

  return db.transaction(async (trx) => {
    const insertResult = await trx('messages').insert({
      campaign_id: campaignId,
      content,
      config,
    }).returning('id');

    const messageId = typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0];

    const messagePlayers = playerIds.map(playerId => ({
        message_id: messageId,
        player_id: playerId
    }));

    if (messagePlayers.length > 0) {
        await trx('message_players').insert(messagePlayers);
    }

    const row = await trx('messages')
      .select('id', 'campaign_id', 'content', 'config', 'created_at')
      .where({ id: messageId })
      .first() as MessageRow | undefined;

    if (!row) {
      throw new Error('Failed to create message.');
    }

    return {
        ...row,
        player_ids: playerIds
    };
  });
};

export const updateMessage = async (messageId: number, input: MessageInput): Promise<Message> => {
  const content = input.content.trim();
  const config = input.config;

  if (!content && !hasConfigContent(config)) {
    throw new Error('Message content or config is required.');
  }

  const db = getDatabase();
  const existing = await db('messages')
    .select('id', 'campaign_id', 'content', 'config', 'created_at')
    .where({ id: messageId })
    .first() as MessageRow | undefined;

  if (!existing) {
    throw new Error('Message not found.');
  }

  const playerIds = await validateAndNormalizePlayerIds(existing.campaign_id, input.playerIds);

  return db.transaction(async (trx) => {
    await trx('messages')
      .where({ id: messageId })
      .update({ content, config });
      
    await trx('message_players').where({ message_id: messageId }).delete();

    const messagePlayers = playerIds.map(playerId => ({
        message_id: messageId,
        player_id: playerId
    }));

    if (messagePlayers.length > 0) {
        await trx('message_players').insert(messagePlayers);
    }

    const row = await trx('messages')
      .select('id', 'campaign_id', 'content', 'config', 'created_at')
      .where({ id: messageId })
      .first() as MessageRow | undefined;

    if (!row) {
      throw new Error('Failed to update message.');
    }

    return {
        ...row,
        player_ids: playerIds
    };
  });
};
