import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  handleMock,
  listStepsByCampaignMock,
  createStepMock,
  updateStepMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  listStepsByCampaignMock: vi.fn(),
  createStepMock: vi.fn(),
  updateStepMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: handleMock },
}));

vi.mock('../../src/main/repositories/step-repo', () => ({
  listStepsByCampaign: listStepsByCampaignMock,
  createStep: createStepMock,
  updateStep: updateStepMock,
}));

import { registerStepIpc } from '../../src/main/ipc/step-ipc';

describe('step-ipc', () => {
  beforeEach(() => {
    handleMock.mockReset();
  });

  it('registers expected handlers', () => {
    registerStepIpc();
    expect(handleMock).toHaveBeenCalledTimes(3);
  });
});
