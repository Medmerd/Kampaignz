export type Campaign = {
  id: number;
  name: string;
  expectedSessions: number;
  config: string;
  created_at: string;
};

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotifyFunction = (type: NotificationType, title: string, description?: string) => void;

export type TabOptions = {
  campaignId: number;
  notify?: NotifyFunction;
};

export type SessionModalOptions = {
  session?: Session;
  sessionId: number;
  campaignId: number;
  isOpen: boolean;
  onClose: () => void;
  notify?: NotifyFunction;
};

export type MissionModalOptions = {
  mission?: Mission;
  missionId: number;
  campaignId: number;
  isOpen: boolean;
  onClose: () => void;
  notify?: NotifyFunction;
};

export type PlayerModalOptions = {
  playerId: number | null;
  campaignId: number;
  isOpen: boolean;
  onClose: () => void;
  notify?: NotifyFunction;
};

export type CampaignDetailsInput = {
  name: string;
  expectedSessions: number;
  config: string;
};

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

export type JSONString<T> = string & { __brand: T };

export interface messageConfig {
  prompt: string;
}

export type Message = {
  id: number;
  campaign_id: number;
  content: string;
  config: string;
  player_ids: number[];
  created_at: string;
};

export type MessageInput = {
  content: string;
  config: string;
  playerIds: number[];
};

export type Mission = {
  id: number;
  campaign_id: number;
  title: string;
  config: string;
  missionDetails: string;
  map: string;
  created_at: string;
};

export type MissionInput = {
  title: string;
  config: string;
  missionDetails: string;
  map: string;
};

export type MissionMatch = {
  matchType: 1 | 2 | 4;
  teamAPlayerIds: number[];
  teamBPlayerIds: number[];
};

export type Session = {
  id: number;
  campaign_id: number;
  title: string;
  notes: string;
  config: string;
  mission_ids: number[];
  created_at: string;
};

export type SessionInput = {
  title: string;
  campaignId: number;
  notes: string;
  config: string;
  missionIds: number[];
};

