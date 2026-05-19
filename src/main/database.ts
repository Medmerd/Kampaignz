import { app } from 'electron';
import path from 'node:path';
import knex, { Knex } from 'knex';
import * as dotenv from 'dotenv';
// @ts-ignore
const knexConfig = require('../../knexfile.js');

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
    if (config.connection.filename === './dev.sqlite3') {
      config.connection.filename = path.join(app.getPath('userData'), 'kampaignz.db');
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
