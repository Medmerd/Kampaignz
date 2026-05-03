import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getDatabaseMock } = vi.hoisted(() => ({
  getDatabaseMock: vi.fn(),
}));

vi.mock('../../src/main/database', () => ({
  getDatabase: getDatabaseMock,
}));

import {
  createSession,
  listSessionsByCampaign,
  updateSession,
  type SessionInput,
} from '../../src/main/repositories/session-repo';

describe('session-repo', () => {
  beforeEach(() => {
    getDatabaseMock.mockReset();
  });

  it('lists sessions with parsed config', () => {
    const rows = [
      {
        id: 1,
        campaign_id: 10,
        title: 'Session One',
        config: '{"difficulty":"hard"}',
        sessionDetails: 'Intro mission',
        map: 'Valley',
        created_at: '2026-05-03T00:00:00Z',
      },
    ];

    const db = {
      prepare: vi.fn(() => ({ all: vi.fn(() => rows) })),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(listSessionsByCampaign(10)).toEqual([
      {
        ...rows[0],
        config: { difficulty: 'hard' },
      },
    ]);
  });

  it('creates session and returns parsed payload', () => {
    const input: SessionInput = {
      title: 'Session Two',
      config: { scene: 'forest' },
      sessionDetails: 'Scout mission',
      map: 'North Woods',
    };

    const row = {
      id: 2,
      campaign_id: 10,
      title: 'Session Two',
      config: '{"scene":"forest"}',
      sessionDetails: 'Scout mission',
      map: 'North Woods',
      created_at: '2026-05-03T00:00:00Z',
    };

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('INSERT INTO sessions')) {
          return { run: vi.fn(() => ({ lastInsertRowid: 2 })) };
        }

        return { get: vi.fn(() => row) };
      }),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(createSession(10, input)).toEqual({
      ...row,
      config: { scene: 'forest' },
    });
  });

  it('updates session and returns parsed payload', () => {
    const row = {
      id: 3,
      campaign_id: 10,
      title: 'Session Three',
      config: '{"scene":"city"}',
      sessionDetails: 'Urban operations',
      map: 'City Grid',
      created_at: '2026-05-03T00:00:00Z',
    };

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('UPDATE sessions')) {
          return { run: vi.fn(() => ({ changes: 1 })) };
        }

        return { get: vi.fn(() => row) };
      }),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(
      updateSession(3, {
        title: 'Session Three',
        config: { scene: 'city' },
        sessionDetails: 'Urban operations',
        map: 'City Grid',
      }),
    ).toEqual({
      ...row,
      config: { scene: 'city' },
    });
  });

  it('validates title for create and update', () => {
    const blankTitleInput: SessionInput = {
      title: '   ',
      config: {},
      sessionDetails: '',
      map: '',
    };

    expect(() => createSession(10, blankTitleInput)).toThrow(
      'Session title is required.',
    );
    expect(() => updateSession(1, blankTitleInput)).toThrow(
      'Session title is required.',
    );
  });
});
