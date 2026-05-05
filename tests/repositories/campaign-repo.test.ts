import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getDatabaseMock } = vi.hoisted(() => ({
  getDatabaseMock: vi.fn(),
}));

vi.mock('../../src/main/database', () => ({
  getDatabase: getDatabaseMock,
}));

import {
  createCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaignDetails,
} from '../../src/main/repositories/campaign-repo';

describe('campaign-repo', () => {
  beforeEach(() => {
    getDatabaseMock.mockReset();
  });

  it('creates a campaign and returns the inserted row', () => {
    const inserted = {
      id: 11,
      name: 'Alpha',
      expectedSessions: 1,
      config: '{"prompt":"x"}',
      created_at: '2026-05-03T00:00:00Z',
    };

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('INSERT INTO campaigns')) {
          return { run: vi.fn(() => ({ lastInsertRowid: 11 })) };
        }

        return { get: vi.fn(() => inserted) };
      }),
      transaction: vi.fn((fn: (name: string) => unknown) => fn),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(createCampaign('  Alpha  ')).toEqual({
      ...inserted,
      config: { prompt: 'x' },
    });
  });

  it('lists campaigns in descending order', () => {
    const rows = [
      {
        id: 1,
        name: 'A',
        expectedSessions: 1,
        config: '{}',
        created_at: '2026-05-03T00:00:00Z',
      },
    ];
    const db = {
      prepare: vi.fn(() => ({ all: vi.fn(() => rows) })),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(listCampaigns()).toEqual([
      {
        ...rows[0],
        config: {},
      },
    ]);
  });

  it('gets campaign by id', () => {
    const row = {
      id: 2,
      name: 'B',
      expectedSessions: 2,
      config: '{"theme":"grim"}',
      created_at: '2026-05-03T00:00:00Z',
    };
    const db = {
      prepare: vi.fn(() => ({ get: vi.fn(() => row) })),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(getCampaignById(2)).toEqual({
      ...row,
      config: { theme: 'grim' },
    });
  });

  it('updates campaign details and returns updated row', () => {
    const updated = {
      id: 3,
      name: 'Updated',
      expectedSessions: 4,
      config: '{"tone":"dark"}',
      created_at: '2026-05-03T00:00:00Z',
    };
    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('UPDATE campaigns')) {
          return { run: vi.fn(() => ({ changes: 1 })) };
        }

        return { get: vi.fn(() => updated) };
      }),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(
      updateCampaignDetails(3, {
        name: '  Updated  ',
        expectedSessions: 4,
        config: { tone: 'dark' },
      }),
    ).toEqual({ ...updated, config: { tone: 'dark' } });
  });

  it('throws on empty campaign name', () => {
    expect(() => createCampaign('   ')).toThrow('Campaign name is required.');
    expect(() =>
      updateCampaignDetails(1, { name: '   ', expectedSessions: 1, config: {} }),
    ).toThrow('Campaign name is required.');
  });
});
