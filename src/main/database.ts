import { app } from 'electron';
import path from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations } from './migrations/migration-runner';

let db: Database.Database | null = null;

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database is not initialized.');
  }

  return db;
};

export const initializeDatabase = () => {
  if (db) {
    return db;
  }

  const dbPath = path.join(app.getPath('userData'), 'kampaignz.db');

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);

  return db;
};

export const closeDatabase = () => {
  if (!db) {
    return;
  }

  db.close();
  db = null;
};
