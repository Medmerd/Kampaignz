import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getDatabaseMock } = vi.hoisted(() => ({
  getDatabaseMock: vi.fn(),
}));

vi.mock('../../src/main/database', () => ({
  getDatabase: getDatabaseMock,
}));

import {
  createPlayer,
  listPlayersByCampaign,
  updatePlayer,
  type PlayerInput,
} from '../../src/main/repositories/player-repo';

const baseInput: PlayerInput = {
  playerName: 'Alice',
  army: 'Lions',
  notes: 'Ready',
  config: { points: 1000 },
};

describe('player-repo', () => {
  beforeEach(() => {
    getDatabaseMock.mockReset();
  });

  it('lists players and parses config JSON', () => {
    const rows = [
      {
        id: 7,
        campaign_id: 1,
        playerName: 'Alice',
        army: 'Lions',
        notes: 'Ready',
        config: '{"points":1000}',
        created_at: '2026-05-03T00:00:00Z',
      },
    ];

    const db = {
      prepare: vi.fn(() => ({ all: vi.fn(() => rows) })),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(listPlayersByCampaign(1)).toEqual([
      {
        ...rows[0],
        config: { points: 1000 },
      },
    ]);
  });

  it('creates a player and returns parsed row', () => {
    const row = {
      id: 8,
      campaign_id: 1,
      playerName: 'Alice',
      army: 'Lions',
      notes: 'Ready',
      config: '{"points":1000}',
      created_at: '2026-05-03T00:00:00Z',
    };

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('INSERT INTO players')) {
          return { run: vi.fn(() => ({ lastInsertRowid: 8 })) };
        }

        return { get: vi.fn(() => row) };
      }),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(createPlayer(1, baseInput)).toEqual({ ...row, config: { points: 1000 } });
  });

  it('updates a player and returns parsed row', () => {
    const row = {
      id: 9,
      campaign_id: 1,
      playerName: 'Bob',
      army: 'Wolves',
      notes: 'Updated',
      config: '{"points":1500}',
      created_at: '2026-05-03T00:00:00Z',
    };

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('UPDATE players')) {
          return { run: vi.fn(() => ({ changes: 1 })) };
        }

        return { get: vi.fn(() => row) };
      }),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(
      updatePlayer(9, {
        playerName: 'Bob',
        army: 'Wolves',
        notes: 'Updated',
        config: { points: 1500 },
      }),
    ).toEqual({ ...row, config: { points: 1500 } });
  });

  it('validates player input', () => {
    expect(() => createPlayer(1, { ...baseInput, playerName: '   ' })).toThrow(
      'Player name is required.',
    );
    expect(() => createPlayer(1, { ...baseInput, army: '   ' })).toThrow(
      'Army is required.',
    );
  });
});
