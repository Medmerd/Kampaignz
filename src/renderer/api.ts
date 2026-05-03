import type {
  Campaign,
  Message,
  MessageInput,
  Player,
  PlayerInput,
  Session,
  SessionInput,
} from './types';

export const api = {
  createCampaign: (name: string) => window.api.createCampaign(name) as Promise<Campaign>,
  listCampaigns: () => window.api.listCampaigns() as Promise<Campaign[]>,
  getCampaign: (id: number) => window.api.getCampaign(id) as Promise<Campaign>,
  updateCampaignName: (id: number, name: string) =>
    window.api.updateCampaignName(id, name) as Promise<Campaign>,
  listPlayersByCampaign: (campaignId: number) =>
    window.api.listPlayersByCampaign(campaignId) as Promise<Player[]>,
  createPlayer: (campaignId: number, input: PlayerInput) =>
    window.api.createPlayer(campaignId, input) as Promise<Player>,
  updatePlayer: (playerId: number, input: PlayerInput) =>
    window.api.updatePlayer(playerId, input) as Promise<Player>,
  listMessagesByCampaign: (campaignId: number) =>
    window.api.listMessagesByCampaign(campaignId) as Promise<Message[]>,
  createMessage: (campaignId: number, input: MessageInput) =>
    window.api.createMessage(campaignId, input) as Promise<Message>,
  updateMessage: (messageId: number, input: MessageInput) =>
    window.api.updateMessage(messageId, input) as Promise<Message>,
  generateMessageFromConfig: (config: Record<string, unknown>) =>
    window.api.generateMessageFromConfig(config) as Promise<string>,
  sendMessageToDiscord: (content: string) =>
    window.api.sendMessageToDiscord(content) as Promise<void>,
  listSessionsByCampaign: (campaignId: number) =>
    window.api.listSessionsByCampaign(campaignId) as Promise<Session[]>,
  createSession: (campaignId: number, input: SessionInput) =>
    window.api.createSession(campaignId, input) as Promise<Session>,
  updateSession: (sessionId: number, input: SessionInput) =>
    window.api.updateSession(sessionId, input) as Promise<Session>,
};
