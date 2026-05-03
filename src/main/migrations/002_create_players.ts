import type { Migration } from './migration-types';

export const migration002CreatePlayers: Migration = {
  id: '002_create_players',
  up: (db) => {
    db.exec(`
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
    `);
  },
};
