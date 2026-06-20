import knex, { Knex } from 'knex';
import * as dotenv from 'dotenv';
import knexConfig from '../../../knexfile';

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

  const environment = process.env.VITE_DB_CLIENT || 'devpostgresql';
  const config = knexConfig[environment];
  console.log('Using database environment:', environment, config);

  if (!config) {
    throw new Error(`Knex configuration not found for environment: ${environment}`);
  }

  db = knex(config);

  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (!db) {
    return;
  }

  await db.destroy();
  db = null;
};
