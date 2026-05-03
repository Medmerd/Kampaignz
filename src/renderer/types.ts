export type Campaign = {
  id: number;
  name: string;
  created_at: string;
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
  config: Record<string, unknown>;
};

export type Message = {
  id: number;
  campaign_id: number;
  content: string;
  config: Record<string, unknown>;
  player_ids: number[];
  created_at: string;
};

export type MessageInput = {
  content: string;
  config: Record<string, unknown>;
  playerIds: number[];
};

export type Route =
  | { name: 'campaign-list' }
  | { name: 'campaign-detail'; campaignId: number };
