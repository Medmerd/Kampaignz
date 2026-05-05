import { contextBridge, ipcRenderer } from 'electron';

type Campaign = {
  id: number;
  name: string;
  expectedSessions: number;
  config: Record<string, unknown>;
  created_at: string;
};

type CampaignDetailsInput = {
  name: string;
  expectedSessions: number;
  config: Record<string, unknown>;
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

type Message = {
  id: number;
  campaign_id: number;
  content: string;
  config: Record<string, unknown>;
  player_ids: number[];
  created_at: string;
};

type MessageInput = {
  content: string;
  config: Record<string, unknown>;
  playerIds: number[];
};

type Session = {
  id: number;
  campaign_id: number;
  title: string;
  config: Record<string, unknown>;
  sessionDetails: string;
  map: string;
  created_at: string;
};

type SessionInput = {
  title: string;
  config: Record<string, unknown>;
  sessionDetails: string;
  map: string;
};

type Step = {
  id: number;
  campaign_id: number;
  title: string;
  notes: string;
  config: Record<string, unknown>;
  session_ids: number[];
  created_at: string;
};

type StepInput = {
  title: string;
  notes: string;
  config: Record<string, unknown>;
  sessionIds: number[];
};

const api = {
  createCampaign: (name: string) =>
    ipcRenderer.invoke('campaigns:create', name) as Promise<Campaign>,
  listCampaigns: () => ipcRenderer.invoke('campaigns:list') as Promise<Campaign[]>,
  getCampaign: (id: number) =>
    ipcRenderer.invoke('campaigns:get', id) as Promise<Campaign>,
  updateCampaignDetails: (id: number, input: CampaignDetailsInput) =>
    ipcRenderer.invoke('campaigns:updateDetails', id, input) as Promise<Campaign>,
  listPlayersByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('players:listByCampaign', campaignId) as Promise<Player[]>,
  createPlayer: (campaignId: number, input: PlayerInput) =>
    ipcRenderer.invoke('players:create', campaignId, input) as Promise<Player>,
  updatePlayer: (playerId: number, input: PlayerInput) =>
    ipcRenderer.invoke('players:update', playerId, input) as Promise<Player>,
  listMessagesByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('messages:listByCampaign', campaignId) as Promise<Message[]>,
  createMessage: (campaignId: number, input: MessageInput) =>
    ipcRenderer.invoke('messages:create', campaignId, input) as Promise<Message>,
  updateMessage: (messageId: number, input: MessageInput) =>
    ipcRenderer.invoke('messages:update', messageId, input) as Promise<Message>,
  generateMessageFromConfig: (config: Record<string, unknown>) =>
    ipcRenderer.invoke('messages:generateFromConfig', config) as Promise<string>,
  sendMessageToDiscord: (content: string) =>
    ipcRenderer.invoke('messages:sendToDiscord', content) as Promise<void>,
  listSessionsByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('sessions:listByCampaign', campaignId) as Promise<Session[]>,
  createSession: (campaignId: number, input: SessionInput) =>
    ipcRenderer.invoke('sessions:create', campaignId, input) as Promise<Session>,
  updateSession: (sessionId: number, input: SessionInput) =>
    ipcRenderer.invoke('sessions:update', sessionId, input) as Promise<Session>,
  listStepsByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('steps:listByCampaign', campaignId) as Promise<Step[]>,
  createStep: (campaignId: number, input: StepInput) =>
    ipcRenderer.invoke('steps:create', campaignId, input) as Promise<Step>,
  updateStep: (stepId: number, input: StepInput) =>
    ipcRenderer.invoke('steps:update', stepId, input) as Promise<Step>,
};

contextBridge.exposeInMainWorld('api', api);

export type KampaignzApi = typeof api;
