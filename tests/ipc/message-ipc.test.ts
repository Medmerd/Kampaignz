import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  handleMock,
  listMessagesByCampaignMock,
  createMessageMock,
  updateMessageMock,
  generateMessageFromConfigMock,
  sendMessageToDiscordMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  listMessagesByCampaignMock: vi.fn(),
  createMessageMock: vi.fn(),
  updateMessageMock: vi.fn(),
  generateMessageFromConfigMock: vi.fn(),
  sendMessageToDiscordMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: handleMock },
}));

vi.mock('../../src/main/repositories/message-repo', () => ({
  listMessagesByCampaign: listMessagesByCampaignMock,
  createMessage: createMessageMock,
  updateMessage: updateMessageMock,
}));

vi.mock('../../src/main/services/message-generator', () => ({
  generateMessageFromConfig: generateMessageFromConfigMock,
}));

vi.mock('../../src/main/services/discord-message-sender', () => ({
  sendMessageToDiscord: sendMessageToDiscordMock,
}));

import { registerMessageIpc } from '../../src/main/ipc/message-ipc';

describe('message-ipc', () => {
  beforeEach(() => {
    handleMock.mockReset();
  });

  it('registers expected handlers', () => {
    registerMessageIpc();
    expect(handleMock).toHaveBeenCalledTimes(5);
  });
});
