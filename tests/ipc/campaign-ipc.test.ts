import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  handleMock,
  createCampaignMock,
  listCampaignsMock,
  getCampaignByIdMock,
  updateCampaignDetailsMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  createCampaignMock: vi.fn(),
  listCampaignsMock: vi.fn(),
  getCampaignByIdMock: vi.fn(),
  updateCampaignDetailsMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: handleMock },
}));

vi.mock('../../src/main/repositories/campaign-repo', () => ({
  createCampaign: createCampaignMock,
  listCampaigns: listCampaignsMock,
  getCampaignById: getCampaignByIdMock,
  updateCampaignDetails: updateCampaignDetailsMock,
}));

import { registerCampaignIpc } from '../../src/main/ipc/campaign-ipc';

describe('campaign-ipc', () => {
  beforeEach(() => {
    handleMock.mockReset();
  });

  it('registers expected handlers', () => {
    registerCampaignIpc();
    expect(handleMock).toHaveBeenCalledTimes(4);
  });
});
