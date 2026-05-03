import { contextBridge, ipcRenderer } from 'electron';

type Campaign = {
  id: number;
  name: string;
  created_at: string;
};

type Player = {
  id: number;
  campaign_id: number;
  playerName: string;
  army: string;
  notes: string;
  config: Record<string, unknown>;
  created_at: string;
};

type PlayerInput = {
  playerName: string;
  army: string;
  notes: string;
  config: Record<string, unknown>;
};

const api = {
  createCampaign: (name: string) =>
    ipcRenderer.invoke('campaigns:create', name) as Promise<Campaign>,
  listCampaigns: () => ipcRenderer.invoke('campaigns:list') as Promise<Campaign[]>,
  getCampaign: (id: number) =>
    ipcRenderer.invoke('campaigns:get', id) as Promise<Campaign>,
  updateCampaignName: (id: number, name: string) =>
    ipcRenderer.invoke('campaigns:updateName', id, name) as Promise<Campaign>,
  listPlayersByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('players:listByCampaign', campaignId) as Promise<Player[]>,
  createPlayer: (campaignId: number, input: PlayerInput) =>
    ipcRenderer.invoke('players:create', campaignId, input) as Promise<Player>,
  updatePlayer: (playerId: number, input: PlayerInput) =>
    ipcRenderer.invoke('players:update', playerId, input) as Promise<Player>,
};

contextBridge.exposeInMainWorld('api', api);

export type KampaignzApi = typeof api;
