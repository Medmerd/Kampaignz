import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  handleMock,
  listMissionsByCampaignMock,
  createMissionMock,
  updateMissionMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  listMissionsByCampaignMock: vi.fn(),
  createMissionMock: vi.fn(),
  updateMissionMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: handleMock },
}));

vi.mock('../../src/main/repositories/mission-repo', () => ({
  listMissionsByCampaign: listMissionsByCampaignMock,
  createMission: createMissionMock,
  updateMission: updateMissionMock,
}));

vi.mock('../../src/main/repositories/mission-match-repo', () => ({
  listMissionMatches: vi.fn(),
  replaceMissionMatches: vi.fn(),
}));

vi.mock('../../knexfile.js', () => ({
  default: {
    development: { client: 'sqlite3', connection: ':memory:' },
  },
}));

import { registerMissionIpc } from '../../src/main/ipc/mission-ipc';

describe('mission-ipc', () => {
  beforeEach(() => {
    handleMock.mockReset();
  });

  it('registers expected handlers', () => {
    registerMissionIpc();
    expect(handleMock).toHaveBeenCalledTimes(5);
  });
});
