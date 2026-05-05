import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  handleMock,
  listPlayersByCampaignMock,
  createPlayerMock,
  updatePlayerMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  listPlayersByCampaignMock: vi.fn(),
  createPlayerMock: vi.fn(),
  updatePlayerMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: handleMock },
}));

vi.mock('../../src/main/repositories/player-repo', () => ({
  listPlayersByCampaign: listPlayersByCampaignMock,
  createPlayer: createPlayerMock,
  updatePlayer: updatePlayerMock,
}));

import { registerPlayerIpc } from '../../src/main/ipc/player-ipc';

describe('player-ipc', () => {
  beforeEach(() => {
    handleMock.mockReset();
  });

  it('registers expected handlers', () => {
    registerPlayerIpc();
    expect(handleMock).toHaveBeenCalledTimes(3);
  });
});
