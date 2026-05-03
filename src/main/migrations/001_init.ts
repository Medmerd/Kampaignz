import type { Migration } from './migration-types';

export const migration001Init: Migration = {
  id: '001_init',
  up: (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_campaigns_created_at
        ON campaigns(created_at);

      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        playerName TEXT NOT NULL,
        army TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        config TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_players_campaign_id
        ON players(campaign_id);

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        config TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_messages_campaign_id
        ON messages(campaign_id);

      CREATE TABLE IF NOT EXISTS message_players (
        message_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        PRIMARY KEY (message_id, player_id),
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_message_players_player_id
        ON message_players(player_id);

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        config TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config)),
        sessionDetails TEXT NOT NULL DEFAULT '',
        map TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_campaign_id
        ON sessions(campaign_id);
    `);
  },
};
