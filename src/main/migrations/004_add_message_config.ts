import type { Migration } from './migration-types';

type TableInfoRow = {
  name: string;
};

export const migration004AddMessageConfig: Migration = {
  id: '004_add_message_config',
  up: (db) => {
    const columns = db
      .prepare('PRAGMA table_info(messages)')
      .all() as TableInfoRow[];

    const hasConfig = columns.some((column) => column.name === 'config');
    if (!hasConfig) {
      db.exec(
        "ALTER TABLE messages ADD COLUMN config TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config))",
      );
    }
  },
};
