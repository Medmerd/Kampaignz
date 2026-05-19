import knex, { Knex } from 'knex';

let db: Knex | null = null;

export const setupTestDatabase = async (): Promise<Knex> => {
  if (db) {
    await db.destroy();
  }

  db = knex({
    // client: 'better-sqlite3',
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  });

  // Run the new knex migrations
  await db.migrate.latest({
    directory: './migrations',
  });

  return db;
};

export const getTestDatabase = () => {
  if (!db) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return db;
};

export const closeTestDatabase = async () => {
  if (db) {
    await db.destroy();
    db = null;
  }
};
