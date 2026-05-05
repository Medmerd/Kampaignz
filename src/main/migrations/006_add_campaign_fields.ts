import type { Migration } from './migration-types';

type TableInfoRow = {
  name: string;
};

export const migration006AddCampaignFields: Migration = {
  id: '006_add_campaign_fields',
  up: (db) => {
    const columns = db
      .prepare('PRAGMA table_info(campaigns)')
      .all() as TableInfoRow[];

    const hasExpectedSessions = columns.some(
      (column) => column.name === 'expectedSessions',
    );
    if (!hasExpectedSessions) {
      db.exec(
        'ALTER TABLE campaigns ADD COLUMN expectedSessions INTEGER NOT NULL DEFAULT 1',
      );
    }

    const hasConfig = columns.some((column) => column.name === 'config');
    if (!hasConfig) {
      db.exec(
        "ALTER TABLE campaigns ADD COLUMN config TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config))",
      );
    }
  },
};
