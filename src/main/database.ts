import path from 'node:path';
import knex, { Knex } from 'knex';
import * as dotenv from 'dotenv';
import knexConfig from '../../knexfile';

dotenv.config();

let db: Knex | null = null;

export const getDatabase = (): Knex => {
  if (!db) {
    throw new Error('Database is not initialized.');
  }

  return db;
};

export const initializeDatabase = async (): Promise<Knex> => {
  if (db) {
    return db;
  }

  const environment = process.env.VITE_DB_CLIENT || 'development';
  const config = knexConfig[environment];
  console.log('Using database environment:', environment, config);

  if (!config) {
    throw new Error(`Knex configuration not found for environment: ${environment}`);
  }

  if (config.client === 'sqlite3' || config.client === 'better-sqlite3') {
    if (!config.connection) {
      config.connection = {};
    }

    const conn = config.connection as { filename?: string };

    if (conn.filename === './dev.sqlite3') {
      try {
        const { app } = require('electron');
        conn.filename = path.join(app.getPath('userData'), 'kampaignz.db');
      } catch (err) {
        // Safe fallback when running outside Electron (e.g. standalone web-server pod)
        conn.filename = path.join(process.cwd(), 'dev.sqlite3');
      }
    }
    config.useNullAsDefault = true;
  }

  db = knex(config);

  if (config.client === 'sqlite3' || config.client === 'better-sqlite3') {
    await db.migrate.latest(config.migrations);
  }

  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (!db) {
    return;
  }

  await db.destroy();
  db = null;
};
