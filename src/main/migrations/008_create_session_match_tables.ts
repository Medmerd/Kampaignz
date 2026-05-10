import type { Migration } from './migration-types';

export const migration008CreateSessionMatchTables: Migration = {
  id: '008_create_session_match_tables',
  up: (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessionMatchTypes (
        typeId INTEGER PRIMARY KEY,
        type TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS sessionMatchTeam (
        matchId INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId INTEGER NOT NULL,
        teamAId INTEGER NOT NULL,
        teamBId INTEGER NOT NULL,
        matchType INTEGER NOT NULL,
        FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (matchType) REFERENCES sessionMatchTypes(typeId)
      );

      CREATE INDEX IF NOT EXISTS idx_sessionMatchTeam_sessionId
        ON sessionMatchTeam(sessionId);

      CREATE TABLE IF NOT EXISTS sessionMatch (
        teamAId INTEGER NOT NULL,
        teamBId INTEGER NOT NULL,
        playerAId INTEGER NOT NULL,
        playerBId INTEGER NOT NULL,
        FOREIGN KEY (playerAId) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY (playerBId) REFERENCES players(id) ON DELETE CASCADE,
        UNIQUE(teamAId, teamBId, playerAId, playerBId)
      );

      CREATE INDEX IF NOT EXISTS idx_sessionMatch_teamAId
        ON sessionMatch(teamAId);

      CREATE INDEX IF NOT EXISTS idx_sessionMatch_teamBId
        ON sessionMatch(teamBId);

      INSERT OR IGNORE INTO sessionMatchTypes (typeId, type) VALUES
        (1, '1v1'),
        (2, '2v2'),
        (4, '4v4');
    `);
  },
};
