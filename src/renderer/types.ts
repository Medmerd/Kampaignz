export type Campaign = {
  id: number;
  name: string;
  expectedSessions: number;
  config: Record<string, unknown>;
  created_at: string;
};

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotifyFunction = (type: NotificationType, title: string, description?: string) => void;

export type TabOptions = {
  campaignId: number;
  notify?: NotifyFunction;
};

export type StepModalOptions = {
  step: Step,
  stepId: number,
  campaignId: number;
  isOpen: boolean;
  onClose: () => void,
  notify?: NotifyFunction,
};

export type SessionModalOptions = {
  session?: Session,
  sessionId: number,
  campaignId: number;
  isOpen: boolean;
  onClose: () => void,
  notify?: NotifyFunction,
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
  config: Record<string, unknown>;
};

export type Player = {
  id: number;
  campaign_id: number;
  playerName: string;
  army: string;
  notes: string;
  config: Record<string, unknown>;
  created_at: string;
};

export type PlayerInput = {
  playerName: string;
  army: string;
  notes: string;
  config: string; // Record<string, unknown>;
};

export type JSONString<T> = string & { __brand: T };

export interface messageConfig {
  prompt: string;
}


export type Message = {
  id: number;
  campaign_id: number;
  content: string;
  config: string; // Record<string, unknown> | JSONString<messageConfig>;
  player_ids: number[];
  created_at: string;
};


export type MessageInput = {
  content: string;
  config: string; // Record<string, unknown> | JSONString<messageConfig>;
  playerIds: number[];
};

export type Session = {
  id: number;
  campaign_id: number;
  title: string;
  config: string, // Record<string, unknown>;
  sessionDetails: string;
  map: string;
  created_at: string;
};

export type SessionInput = {
  title: string;
  config: string, // Record<string, unknown>;
  sessionDetails: string;
  map: string;
};

export type SessionMatch = {
  matchType: 1 | 2 | 4;
  teamAPlayerIds: number[];
  teamBPlayerIds: number[];
};

export type Step = {
  id: number;
  campaign_id: number;
  title: string;
  notes: string;
  config: string, //Record<string, unknown>;
  session_ids: number[];
  created_at: string;
};

export type StepInput = {
  title: string;
  campaignId: number;
  notes: string;
  config: string;
  sessionIds: number[];
};

export type Route =
  | { name: 'campaign-list' }
  | { name: 'campaign-detail'; campaignId: number };
