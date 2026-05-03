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
    `);
  },
};
