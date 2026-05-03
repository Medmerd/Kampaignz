import type Database from 'better-sqlite3';
import { migrations } from './index';

export const runMigrations = (db: Database.Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const appliedRows = db
    .prepare('SELECT id FROM schema_migrations')
    .all() as Array<{ id: string }>;
  const applied = new Set(appliedRows.map((row) => row.id));

  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      continue;
    }

    const transaction = db.transaction(() => {
      migration.up(db);
      db.prepare('INSERT INTO schema_migrations (id) VALUES (?)').run(migration.id);
    });

    transaction();
  }
};
