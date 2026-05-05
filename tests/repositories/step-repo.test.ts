import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getDatabaseMock } = vi.hoisted(() => ({
  getDatabaseMock: vi.fn(),
}));

vi.mock('../../src/main/database', () => ({
  getDatabase: getDatabaseMock,
}));

import {
  createStep,
  listStepsByCampaign,
  updateStep,
  type StepInput,
} from '../../src/main/repositories/step-repo';

describe('step-repo', () => {
  beforeEach(() => {
    getDatabaseMock.mockReset();
  });

  it('lists steps with parsed config and session ids', () => {
    const rows = [
      {
        id: 1,
        campaign_id: 10,
        title: 'Step A',
        notes: 'Notes',
        config: '{"mode":"x"}',
        created_at: '2026-05-03T00:00:00Z',
      },
    ];

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('FROM steps WHERE campaign_id')) {
          return { all: vi.fn(() => rows) };
        }

        return { all: vi.fn(() => [{ session_id: 5 }, { session_id: 7 }]) };
      }),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(listStepsByCampaign(10)).toEqual([
      {
        id: 1,
        campaign_id: 10,
        title: 'Step A',
        notes: 'Notes',
        config: { mode: 'x' },
        session_ids: [5, 7],
        created_at: '2026-05-03T00:00:00Z',
      },
    ]);
  });

  it('creates step with linked sessions', () => {
    const input: StepInput = {
      title: 'Step B',
      notes: 'N',
      config: { tone: 'grim' },
      sessionIds: [2, 3],
    };

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('SELECT id FROM sessions')) {
          return { all: vi.fn(() => [{ id: 2 }, { id: 3 }]) };
        }
        if (sql.includes('INSERT INTO steps')) {
          return { run: vi.fn(() => ({ lastInsertRowid: 11 })) };
        }
        if (sql.includes('INSERT INTO step_sessions')) {
          return { run: vi.fn(() => ({ changes: 1 })) };
        }
        if (sql.includes('FROM steps WHERE id = ?')) {
          return {
            get: vi.fn(() => ({
              id: 11,
              campaign_id: 10,
              title: 'Step B',
              notes: 'N',
              config: '{"tone":"grim"}',
              created_at: '2026-05-03T00:00:00Z',
            })),
          };
        }

        return { all: vi.fn(() => [{ session_id: 2 }, { session_id: 3 }]) };
      }),
      transaction: vi.fn((fn: () => unknown) => fn),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(createStep(10, input)).toEqual({
      id: 11,
      campaign_id: 10,
      title: 'Step B',
      notes: 'N',
      config: { tone: 'grim' },
      session_ids: [2, 3],
      created_at: '2026-05-03T00:00:00Z',
    });
  });

  it('updates step and linked sessions', () => {
    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('SELECT id, campaign_id FROM steps')) {
          return { get: vi.fn(() => ({ id: 9, campaign_id: 10 })) };
        }
        if (sql.includes('SELECT id FROM sessions')) {
          return { all: vi.fn(() => [{ id: 8 }]) };
        }
        if (sql.includes('UPDATE steps SET')) {
          return { run: vi.fn(() => ({ changes: 1 })) };
        }
        if (sql.includes('DELETE FROM step_sessions')) {
          return { run: vi.fn(() => ({ changes: 1 })) };
        }
        if (sql.includes('INSERT INTO step_sessions')) {
          return { run: vi.fn(() => ({ changes: 1 })) };
        }
        if (sql.includes('FROM steps WHERE id = ?')) {
          return {
            get: vi.fn(() => ({
              id: 9,
              campaign_id: 10,
              title: 'Step C',
              notes: 'Updated',
              config: '{"x":1}',
              created_at: '2026-05-03T00:00:00Z',
            })),
          };
        }

        return { all: vi.fn(() => [{ session_id: 8 }]) };
      }),
      transaction: vi.fn((fn: () => unknown) => fn),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(
      updateStep(9, {
        title: 'Step C',
        notes: 'Updated',
        config: { x: 1 },
        sessionIds: [8],
      }),
    ).toEqual({
      id: 9,
      campaign_id: 10,
      title: 'Step C',
      notes: 'Updated',
      config: { x: 1 },
      session_ids: [8],
      created_at: '2026-05-03T00:00:00Z',
    });
  });

  it('validates title and campaign session ownership', () => {
    expect(() =>
      createStep(10, { title: ' ', notes: '', config: {}, sessionIds: [] }),
    ).toThrow('Step title is required.');

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('SELECT id FROM sessions')) {
          return { all: vi.fn(() => [{ id: 3 }]) };
        }

        return { get: vi.fn(() => ({ id: 1, campaign_id: 10 })) };
      }),
      transaction: vi.fn((fn: () => unknown) => fn),
    };
    getDatabaseMock.mockReturnValue(db);

    expect(() =>
      updateStep(1, { title: 'ok', notes: '', config: {}, sessionIds: [3, 4] }),
    ).toThrow('One or more selected sessions do not belong to this campaign.');
  });
});
