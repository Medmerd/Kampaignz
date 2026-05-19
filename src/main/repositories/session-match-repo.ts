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

export const listSessionMatches = async (sessionId: number): Promise<SessionMatch[]> => {
  const db = getDatabase();
  const rows = await db('missionMatchTeam')
    .select('matchId', 'teamAId', 'teamBId', 'matchType')
    .where({ missionId: sessionId })
    .orderBy('matchId', 'asc');

  const matches = [];
  for (const row of rows) {
    const pairs = await db('missionMatch')
      .select('playerAId', 'playerBId')
      .where({ teamAId: row.teamAId, teamBId: row.teamBId });

    matches.push({
      matchType: row.matchType as 1 | 2 | 4,
      teamAPlayerIds: pairs.map((pair: any) => pair.playerAId),
      teamBPlayerIds: pairs.map((pair: any) => pair.playerBId),
    });
  }

  return matches;
};

export const replaceSessionMatches = async (sessionId: number, matches: SessionMatch[]): Promise<void> => {
  validateMatches(matches);
  const db = getDatabase();

  const session = await db('missions')
    .select('id', 'campaign_id')
    .where({ id: sessionId })
    .first();

  if (!session) {
    throw new Error('Session not found.');
  }

  const playerIds = matches.flatMap((match) => [
    ...match.teamAPlayerIds,
    ...match.teamBPlayerIds,
  ]);

  if (playerIds.length > 0) {
    const unique = Array.from(new Set(playerIds));
    const rows = await db('players')
      .select('id')
      .where({ campaign_id: session.campaign_id })
      .whereIn('id', unique);

    const found = new Set(rows.map((row: any) => row.id));

    for (const id of unique) {
      if (!found.has(id)) {
        throw new Error('One or more selected players do not belong to this campaign.');
      }
    }
  }

  return db.transaction(async (trx) => {
    const current = await trx('missionMatchTeam')
      .select('teamAId', 'teamBId')
      .where({ missionId: sessionId });

    for (const team of current) {
      await trx('missionMatch')
        .where({ teamAId: team.teamAId, teamBId: team.teamBId })
        .delete();
    }

    await trx('missionMatchTeam').where({ missionId: sessionId }).delete();

    let nextTeamId = Date.now();
    let nextMatchId = Date.now();

    for (const match of matches) {
      const teamAId = nextTeamId++;
      const teamBId = nextTeamId++;
      const matchId = nextMatchId++;

      await trx('missionMatchTeam').insert({
        matchId,
        missionId: sessionId,
        teamAId,
        teamBId,
        matchType: match.matchType,
      });

      const pairs = [];
      for (let i = 0; i < match.matchType; i += 1) {
        pairs.push({
          teamAId,
          teamBId,
          playerAId: match.teamAPlayerIds[i],
          playerBId: match.teamBPlayerIds[i]
        });
      }

      if (pairs.length > 0) {
        await trx('missionMatch').insert(pairs);
      }
    }
  });
};
