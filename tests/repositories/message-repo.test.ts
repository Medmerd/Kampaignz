import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getDatabaseMock } = vi.hoisted(() => ({
  getDatabaseMock: vi.fn(),
}));

vi.mock('../../src/main/database', () => ({
  getDatabase: getDatabaseMock,
}));

import {
  createMessage,
  listMessagesByCampaign,
  updateMessage,
  type MessageInput,
} from '../../src/main/repositories/message-repo';

describe('message-repo', () => {
  beforeEach(() => {
    getDatabaseMock.mockReset();
  });

  it('lists messages with parsed config and player ids', () => {
    const rows = [
      {
        id: 1,
        campaign_id: 10,
        content: 'Message A',
        config: '{"prompt":"abc"}',
        created_at: '2026-05-03T00:00:00Z',
      },
    ];

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('FROM messages WHERE campaign_id')) {
          return { all: vi.fn(() => rows) };
        }

        return { all: vi.fn(() => [{ player_id: 2 }, { player_id: 5 }]) };
      }),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(listMessagesByCampaign(10)).toEqual([
      {
        id: 1,
        campaign_id: 10,
        content: 'Message A',
        config: { prompt: 'abc' },
        player_ids: [2, 5],
        created_at: '2026-05-03T00:00:00Z',
      },
    ]);
  });

  it('creates a message with config-only content allowed', () => {
    const input: MessageInput = {
      content: '   ',
      config: { prompt: 'Generate a mission brief' },
      playerIds: [3, 4],
    };

    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('SELECT id FROM players')) {
          return { all: vi.fn(() => [{ id: 3 }, { id: 4 }]) };
        }

        if (sql.includes('INSERT INTO messages')) {
          return { run: vi.fn(() => ({ lastInsertRowid: 12 })) };
        }

        if (sql.includes('INSERT INTO message_players')) {
          return { run: vi.fn(() => ({ changes: 1 })) };
        }

        if (sql.includes('SELECT id, campaign_id, content, config, created_at FROM messages WHERE id = ?')) {
          return {
            get: vi.fn(() => ({
              id: 12,
              campaign_id: 10,
              content: '',
              config: '{"prompt":"Generate a mission brief"}',
              created_at: '2026-05-03T00:00:00Z',
            })),
          };
        }

        return { all: vi.fn(() => [{ player_id: 3 }, { player_id: 4 }]) };
      }),
      transaction: vi.fn((fn: () => unknown) => fn),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(createMessage(10, input)).toEqual({
      id: 12,
      campaign_id: 10,
      content: '',
      config: { prompt: 'Generate a mission brief' },
      player_ids: [3, 4],
      created_at: '2026-05-03T00:00:00Z',
    });
  });

  it('updates a message and rejects players outside campaign', () => {
    const db = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('SELECT id, campaign_id, content, config, created_at FROM messages WHERE id = ?')) {
          return {
            get: vi.fn(() => ({
              id: 20,
              campaign_id: 10,
              content: 'Old',
              config: '{}',
              created_at: '2026-05-03T00:00:00Z',
            })),
          };
        }

        if (sql.includes('SELECT id FROM players')) {
          return { all: vi.fn(() => [{ id: 7 }]) };
        }

        return { run: vi.fn(() => ({ changes: 1 })), get: vi.fn(), all: vi.fn(() => []) };
      }),
      transaction: vi.fn((fn: () => unknown) => fn),
    };

    getDatabaseMock.mockReturnValue(db);

    expect(() =>
      updateMessage(20, {
        content: 'Updated',
        config: {},
        playerIds: [7, 8],
      }),
    ).toThrow('One or more selected players do not belong to this campaign.');
  });

  it('requires content or config', () => {
    expect(() =>
      createMessage(10, {
        content: '   ',
        config: {},
        playerIds: [],
      }),
    ).toThrow('Message content or config is required.');
  });
});
