import type { Campaign, Player, PlayerInput } from './types';

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
};
