import { getDatabase } from '../database';

export type SessionMatch = {
  matchType: 1 | 2 | 4;
  teamAPlayerIds: number[];
  teamBPlayerIds: number[];
};

const validateMatches = (matches: SessionMatch[]) => {
  const seen = new Set<number>();

  for (const match of matches) {
    if (match.matchType !== 1 && match.matchType !== 2 && match.matchType !== 4) {
      throw new Error('Invalid match type.');
    }

    if (
      match.teamAPlayerIds.length !== match.matchType ||
      match.teamBPlayerIds.length !== match.matchType
    ) {
      throw new Error('Team size does not match match type.');
    }

    const combined = [...match.teamAPlayerIds, ...match.teamBPlayerIds];
    if (new Set(combined).size !== combined.length) {
      throw new Error('A player cannot be selected more than once in a match.');
    }

    for (const id of combined) {
      if (seen.has(id)) {
        throw new Error('A player cannot be selected more than once in a session.');
      }
      seen.add(id);
    }
  }
};

export const listSessionMatches = (sessionId: number) => {
  const db = getDatabase();
  const rows = db
    .prepare(
      'SELECT matchId, teamAId, teamBId, matchType FROM sessionMatchTeam WHERE sessionId = ? ORDER BY matchId ASC',
    )
    .all(sessionId) as Array<{
    matchId: number;
    teamAId: number;
    teamBId: number;
    matchType: 1 | 2 | 4;
  }>;

  return rows.map((row) => {
    const pairs = db
      .prepare(
        'SELECT playerAId, playerBId FROM sessionMatch WHERE teamAId = ? AND teamBId = ?',
      )
      .all(row.teamAId, row.teamBId) as Array<{ playerAId: number; playerBId: number }>;

    return {
      matchType: row.matchType,
      teamAPlayerIds: pairs.map((pair) => pair.playerAId),
      teamBPlayerIds: pairs.map((pair) => pair.playerBId),
    } as SessionMatch;
  });
};

export const replaceSessionMatches = (sessionId: number, matches: SessionMatch[]) => {
  validateMatches(matches);
  const db = getDatabase();

  const session = db
    .prepare('SELECT id, campaign_id FROM sessions WHERE id = ?')
    .get(sessionId) as { id: number; campaign_id: number } | undefined;

  if (!session) {
    throw new Error('Session not found.');
  }

  const playerIds = matches.flatMap((match) => [
    ...match.teamAPlayerIds,
    ...match.teamBPlayerIds,
  ]);

  if (playerIds.length > 0) {
    const unique = Array.from(new Set(playerIds));
    const placeholders = unique.map(() => '?').join(',');
    const sql = `SELECT id FROM players WHERE campaign_id = ? AND id IN (${placeholders})`;
    const rows = db.prepare(sql).all(session.campaign_id, ...unique) as Array<{ id: number }>;
    const found = new Set(rows.map((row) => row.id));

    for (const id of unique) {
      if (!found.has(id)) {
        throw new Error('One or more selected players do not belong to this campaign.');
      }
    }
  }

  const transaction = db.transaction(() => {
    const current = db
      .prepare('SELECT teamAId, teamBId FROM sessionMatchTeam WHERE sessionId = ?')
      .all(sessionId) as Array<{ teamAId: number; teamBId: number }>;

    for (const team of current) {
      db.prepare('DELETE FROM sessionMatch WHERE teamAId = ? AND teamBId = ?').run(
        team.teamAId,
        team.teamBId,
      );
    }

    db.prepare('DELETE FROM sessionMatchTeam WHERE sessionId = ?').run(sessionId);

    let nextTeamId = Date.now();

    for (const match of matches) {
      const teamAId = nextTeamId++;
      const teamBId = nextTeamId++;

      db.prepare(
        'INSERT INTO sessionMatchTeam (sessionId, teamAId, teamBId, matchType) VALUES (?, ?, ?, ?)',
      ).run(sessionId, teamAId, teamBId, match.matchType);

      const insertPair = db.prepare(
        'INSERT INTO sessionMatch (teamAId, teamBId, playerAId, playerBId) VALUES (?, ?, ?, ?)',
      );

      for (let i = 0; i < match.matchType; i += 1) {
        insertPair.run(teamAId, teamBId, match.teamAPlayerIds[i], match.teamBPlayerIds[i]);
      }
    }
  });

  transaction();
};
