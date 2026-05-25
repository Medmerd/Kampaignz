import type {
  Campaign,
  CampaignDetailsInput,
  Message,
  MessageInput,
  Player,
  PlayerInput,
  Mission,
  MissionInput,
  MissionMatch,
  Session,
  SessionInput,
} from './types';

// Safely determine if running inside Electron or a standard Web browser
const isElectron = typeof window !== 'undefined' && (window as any).api !== undefined;

// Fallback client for Web pod environments mirroring Electron's native IPC bridge
const rpcClient = async (channel: string, ...args: any[]): Promise<any> => {
  const response = await fetch('/api/rpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, args }),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}));
    throw new Error(errorDetails.message || `RPC request to '${channel}' failed with status ${response.status}`);
  }

  return response.json();
};

export const api = {
  createCampaign: (name: string) =>
    isElectron ? (window as any).api.createCampaign(name) : rpcClient('campaigns:create', name),
  listCampaigns: () =>
    isElectron ? (window as any).api.listCampaigns() : rpcClient('campaigns:list'),
  getCampaign: (id: number) =>
    isElectron ? (window as any).api.getCampaign(id) : rpcClient('campaigns:get', id),
  updateCampaignDetails: (id: number, input: CampaignDetailsInput) =>
    isElectron ? (window as any).api.updateCampaignDetails(id, input) : rpcClient('campaigns:updateDetails', id, input),
  listPlayersByCampaign: (campaignId: number) =>
    isElectron ? (window as any).api.listPlayersByCampaign(campaignId) : rpcClient('players:listByCampaign', campaignId),
  createPlayer: (campaignId: number, input: PlayerInput) =>
    isElectron ? (window as any).api.createPlayer(campaignId, input) : rpcClient('players:create', campaignId, input),
  updatePlayer: (playerId: number, input: PlayerInput) =>
    isElectron ? (window as any).api.updatePlayer(playerId, input) : rpcClient('players:update', playerId, input),
  listMessagesByCampaign: (campaignId: number) =>
    isElectron ? (window as any).api.listMessagesByCampaign(campaignId) : rpcClient('messages:listByCampaign', campaignId),
  createMessage: (campaignId: number, input: MessageInput) =>
    isElectron ? (window as any).api.createMessage(campaignId, input) : rpcClient('messages:create', campaignId, input),
  updateMessage: (messageId: number, input: MessageInput) =>
    isElectron ? (window as any).api.updateMessage(messageId, input) : rpcClient('messages:update', messageId, input),
  generateMessageFromConfig: (config: Record<string, unknown>) =>
    isElectron ? (window as any).api.generateMessageFromConfig(config) : rpcClient('messages:generateFromConfig', config),
  sendMessageToDiscord: (content: string) =>
    isElectron ? (window as any).api.sendMessageToDiscord(content) : rpcClient('messages:sendToDiscord', content),
  
  // Wargaming Missions (formerly Sessions)
  listMissionsByCampaign: (campaignId: number) =>
    isElectron ? (window as any).api.listMissionsByCampaign(campaignId) : rpcClient('missions:listByCampaign', campaignId),
  createMission: (campaignId: number, input: MissionInput) =>
    isElectron ? (window as any).api.createMission(campaignId, input) : rpcClient('missions:create', campaignId, input),
  updateMission: (missionId: number, input: MissionInput) =>
    isElectron ? (window as any).api.updateMission(missionId, input) : rpcClient('missions:update', missionId, input),
  listMissionMatches: (missionId: number) =>
    isElectron ? (window as any).api.listMissionMatches(missionId) : rpcClient('missions:listMatches', missionId),
  replaceMissionMatches: (missionId: number, matches: MissionMatch[]) =>
    isElectron ? (window as any).api.replaceMissionMatches(missionId, matches) : rpcClient('missions:replaceMatches', missionId, matches),
  
  // Chronological RPG Sessions (formerly Steps)
  listSessionsByCampaign: (campaignId: number) =>
    isElectron ? (window as any).api.listSessionsByCampaign(campaignId) : rpcClient('sessions:listByCampaign', campaignId),
  createSession: (campaignId: number, input: SessionInput) =>
    isElectron ? (window as any).api.createSession(campaignId, input) : rpcClient('sessions:create', campaignId, input),
  updateSession: (sessionId: number, input: SessionInput) =>
    isElectron ? (window as any).api.updateSession(sessionId, input) : rpcClient('sessions:update', sessionId, input),
};
