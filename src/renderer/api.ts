import type {
  CampaignDetailsInput,
  MessageInput,
  PlayerInput,
  MissionInput,
  MissionMatch,
  SessionInput,
  ArmyRulebook
} from './types';

// Safely determine if running inside Electron or a standard Web browser
const isElectron = typeof window !== 'undefined' && (window as any).api !== undefined;

// Fallback client for Web pod environments mirroring Electron's native IPC bridge
const rpcClient = async (channel: string, ...args: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[]): Promise<any> => {
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

  // Army Rules
  createArmyRulebook: (campaignId: number, input: Pick<ArmyRulebook, 'name' | 'description'>) =>
    isElectron ? (window as any).api.createArmyRulebook(campaignId, input) : rpcClient('armyRules:create', campaignId, input),
  getArmyRulebook: (id: number) =>
    isElectron ? (window as any).api.getArmyRulebook(id) : rpcClient('armyRules:get', id),
  listArmyRulebooksByCampaign: (campaignId: number) =>
    isElectron ? (window as any).api.listArmyRulebooksByCampaign(campaignId) : rpcClient('armyRules:listByCampaign', campaignId),
  updateArmyRulebook: (id: number, input: Pick<ArmyRulebook, 'name' | 'description'>) =>
    isElectron ? (window as any).api.updateArmyRulebook(id, input) : rpcClient('armyRules:update', id, input),
  shareArmyRulebookWithCampaign: (armyRuleId: number, campaignId: number) =>
    isElectron ? (window as any).api.shareArmyRulebookWithCampaign(armyRuleId, campaignId) : rpcClient('armyRules:share', armyRuleId, campaignId),
  removeArmyRulebookShare: (armyRuleId: number, campaignId: number) =>
    isElectron ? (window as any).api.removeArmyRulebookShare(armyRuleId, campaignId) : rpcClient('armyRules:unshare', armyRuleId, campaignId),

  // Generic Rules
  createRule: (input: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) =>
    isElectron ? (window as any).api.createRule(input) : rpcClient('rules:create', input),
  getRule: (id: number) =>
    isElectron ? (window as any).api.getRule(id) : rpcClient('rules:get', id),
  listRulesByArmyRulebook: (armyRuleId: number) =>
    isElectron ? (window as any).api.listRulesByArmyRulebook(armyRuleId) : rpcClient('rules:listByArmyRulebook', armyRuleId),
  listRulesByCampaign: (campaignId: number) =>
    isElectron ? (window as any).api.listRulesByCampaign(campaignId) : rpcClient('rules:listByCampaign', campaignId),
  listRulesByMission: (missionId: number) =>
    isElectron ? (window as any).api.listRulesByMission(missionId) : rpcClient('rules:listByMission', missionId),
  updateRule: (id: number, input: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) =>
    isElectron ? (window as any).api.updateRule(id, input) : rpcClient('rules:update', id, input),
  deleteRule: (id: number) =>
    isElectron ? (window as any).api.deleteRule(id) : rpcClient('rules:delete', id),

  // Player Rules
  assignRuleToPlayer: (playerId: number, ruleId: number) =>
    isElectron ? (window as any).api.assignRuleToPlayer(playerId, ruleId) : rpcClient('playerRules:assign', playerId, ruleId),
  unassignRuleFromPlayer: (playerRuleId: number) =>
    isElectron ? (window as any).api.unassignRuleFromPlayer(playerRuleId) : rpcClient('playerRules:unassign', playerRuleId),
  listPlayerRules: (playerId: number) =>
    isElectron ? (window as any).api.listPlayerRules(playerId) : rpcClient('playerRules:list', playerId),
};
