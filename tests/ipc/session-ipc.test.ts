import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  handleMock,
  listSessionsByCampaignMock,
  createSessionMock,
  updateSessionMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  listSessionsByCampaignMock: vi.fn(),
  createSessionMock: vi.fn(),
  updateSessionMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: handleMock },
}));

vi.mock('../../src/main/repositories/session-repo', () => ({
  listSessionsByCampaign: listSessionsByCampaignMock,
  createSession: createSessionMock,
  updateSession: updateSessionMock,
}));

vi.mock('../../src/main/repositories/session-match-repo', () => ({
  listSessionMatches: vi.fn(),
  replaceSessionMatches: vi.fn(),
}));

vi.mock('../../knexfile.js', () => ({
  default: {
    development: { client: 'sqlite3', connection: ':memory:' },
  },
}));

import { registerSessionIpc } from '../../src/main/ipc/session-ipc';

describe('session-ipc', () => {
  beforeEach(() => {
    handleMock.mockReset();
  });

  it('registers expected handlers', () => {
    registerSessionIpc();
    expect(handleMock).toHaveBeenCalledTimes(5);
  });
});
