import { contextBridge, ipcRenderer } from 'electron';
import { Message, MessageInput, ArmyRulebook, Rule, PlayerRule } from './renderer/types';

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

type Mission = {
  id: number;
  campaign_id: number;
  title: string;
  config: Record<string, unknown>;
  missionDetails: string;
  map: string;
  created_at: string;
};

type MissionInput = {
  title: string;
  config: Record<string, unknown>;
  missionDetails: string;
  map: string;
};

type Session = {
  id: number;
  campaign_id: number;
  title: string;
  notes: string;
  config: Record<string, unknown>;
  mission_ids: number[];
  created_at: string;
};

type SessionInput = {
  title: string;
  notes: string;
  config: Record<string, unknown>;
  missionIds: number[];
};

type MissionMatch = {
  matchType: 1 | 2 | 4;
  teamAPlayerIds: number[];
  teamBPlayerIds: number[];
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
  
  // Wargaming Missions (formerly Sessions)
  listMissionsByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('missions:listByCampaign', campaignId) as Promise<Mission[]>,
  createMission: (campaignId: number, input: MissionInput) =>
    ipcRenderer.invoke('missions:create', campaignId, input) as Promise<Mission>,
  updateMission: (missionId: number, input: MissionInput) =>
    ipcRenderer.invoke('missions:update', missionId, input) as Promise<Mission>,
  listMissionMatches: (missionId: number) =>
    ipcRenderer.invoke('missions:listMatches', missionId) as Promise<MissionMatch[]>,
  replaceMissionMatches: (missionId: number, matches: MissionMatch[]) =>
    ipcRenderer.invoke('missions:replaceMatches', missionId, matches) as Promise<void>,
  
  // Chronological RPG Sessions (formerly Steps)
  listSessionsByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('sessions:listByCampaign', campaignId) as Promise<Session[]>,
  createSession: (campaignId: number, input: SessionInput) =>
    ipcRenderer.invoke('sessions:create', campaignId, input) as Promise<Session>,
  updateSession: (sessionId: number, input: SessionInput) =>
    ipcRenderer.invoke('sessions:update', sessionId, input) as Promise<Session>,

  // Army Rules
  createArmyRulebook: (campaignId: number, input: Pick<ArmyRulebook, 'name' | 'description'>) =>
    ipcRenderer.invoke('armyRules:create', campaignId, input) as Promise<ArmyRulebook>,
  getArmyRulebook: (id: number) =>
    ipcRenderer.invoke('armyRules:get', id) as Promise<ArmyRulebook>,
  listArmyRulebooksByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('armyRules:listByCampaign', campaignId) as Promise<ArmyRulebook[]>,
  updateArmyRulebook: (id: number, input: Pick<ArmyRulebook, 'name' | 'description'>) =>
    ipcRenderer.invoke('armyRules:update', id, input) as Promise<ArmyRulebook>,
  shareArmyRulebookWithCampaign: (armyRuleId: number, campaignId: number) =>
    ipcRenderer.invoke('armyRules:share', armyRuleId, campaignId) as Promise<void>,
  removeArmyRulebookShare: (armyRuleId: number, campaignId: number) =>
    ipcRenderer.invoke('armyRules:unshare', armyRuleId, campaignId) as Promise<void>,

  // Generic Rules
  createRule: (input: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) =>
    ipcRenderer.invoke('rules:create', input) as Promise<Rule>,
  getRule: (id: number) =>
    ipcRenderer.invoke('rules:get', id) as Promise<Rule>,
  listRulesByArmyRulebook: (armyRuleId: number) =>
    ipcRenderer.invoke('rules:listByArmyRulebook', armyRuleId) as Promise<Rule[]>,
  listRulesByCampaign: (campaignId: number) =>
    ipcRenderer.invoke('rules:listByCampaign', campaignId) as Promise<Rule[]>,
  listRulesByMission: (missionId: number) =>
    ipcRenderer.invoke('rules:listByMission', missionId) as Promise<Rule[]>,
  updateRule: (id: number, input: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) =>
    ipcRenderer.invoke('rules:update', id, input) as Promise<Rule>,
  deleteRule: (id: number) =>
    ipcRenderer.invoke('rules:delete', id) as Promise<void>,

  // Player Rules
  assignRuleToPlayer: (playerId: number, ruleId: number) =>
    ipcRenderer.invoke('playerRules:assign', playerId, ruleId) as Promise<PlayerRule>,
  unassignRuleFromPlayer: (playerRuleId: number) =>
    ipcRenderer.invoke('playerRules:unassign', playerRuleId) as Promise<void>,
  listPlayerRules: (playerId: number) =>
    ipcRenderer.invoke('playerRules:list', playerId) as Promise<PlayerRule[]>,
};

contextBridge.exposeInMainWorld('api', api);

export type KampaignzApi = typeof api;
