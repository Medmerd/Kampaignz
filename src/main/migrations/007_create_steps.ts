import type { Migration } from './migration-types';

type TableInfoRow = {
  name: string;
};

export const migration007CreateSteps: Migration = {
  id: '007_create_steps',
  up: (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        config TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_steps_campaign_id
        ON steps(campaign_id);

      CREATE TABLE IF NOT EXISTS step_sessions (
        step_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        PRIMARY KEY (step_id, session_id),
        FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_step_sessions_session_id
        ON step_sessions(session_id);

      CREATE TABLE IF NOT EXISTS step_messages (
        step_id INTEGER NOT NULL,
        message_id INTEGER NOT NULL,
        PRIMARY KEY (step_id, message_id),
        FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_step_messages_message_id
        ON step_messages(message_id);
    `);

    const sessionColumns = db
      .prepare('PRAGMA table_info(sessions)')
      .all() as TableInfoRow[];
    const hasStepSessionCampaign = sessionColumns.some(
      (column) => column.name === 'campaign_id',
    );

    if (hasStepSessionCampaign) {
      db.exec(`
        CREATE TRIGGER IF NOT EXISTS trg_step_sessions_same_campaign_insert
        BEFORE INSERT ON step_sessions
        FOR EACH ROW
        BEGIN
          SELECT
            CASE
              WHEN (
                (SELECT campaign_id FROM steps WHERE id = NEW.step_id) !=
                (SELECT campaign_id FROM sessions WHERE id = NEW.session_id)
              )
              THEN RAISE(ABORT, 'Session must belong to the same campaign as step')
            END;
        END;
      `);
    }

    db.exec(`
      CREATE TRIGGER IF NOT EXISTS trg_step_messages_same_campaign_insert
      BEFORE INSERT ON step_messages
      FOR EACH ROW
      BEGIN
        SELECT
          CASE
            WHEN (
              (SELECT campaign_id FROM steps WHERE id = NEW.step_id) !=
              (SELECT campaign_id FROM messages WHERE id = NEW.message_id)
            )
            THEN RAISE(ABORT, 'Message must belong to the same campaign as step')
          END;
      END;
    `);
  },
};
