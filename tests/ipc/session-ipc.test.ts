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

import { registerSessionIpc } from '../../src/main/ipc/session-ipc';

describe('session-ipc', () => {
  beforeEach(() => {
    handleMock.mockReset();
  });

  it('registers expected handlers', () => {
    registerSessionIpc();
    expect(handleMock).toHaveBeenCalledTimes(3);
  });
});
