"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { handleMock, listMessagesByCampaignMock, createMessageMock, updateMessageMock, generateMessageFromConfigMock, sendMessageToDiscordMock, } = vitest_1.vi.hoisted(() => ({
    handleMock: vitest_1.vi.fn(),
    listMessagesByCampaignMock: vitest_1.vi.fn(),
    createMessageMock: vitest_1.vi.fn(),
    updateMessageMock: vitest_1.vi.fn(),
    generateMessageFromConfigMock: vitest_1.vi.fn(),
    sendMessageToDiscordMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('electron', () => ({
    ipcMain: { handle: handleMock },
}));
vitest_1.vi.mock('../../src/main/repositories/message-repo', () => ({
    listMessagesByCampaign: listMessagesByCampaignMock,
    createMessage: createMessageMock,
    updateMessage: updateMessageMock,
}));
vitest_1.vi.mock('../../src/main/services/message-generator', () => ({
    generateMessageFromConfig: generateMessageFromConfigMock,
}));
vitest_1.vi.mock('../../src/main/services/discord-message-sender', () => ({
    sendMessageToDiscord: sendMessageToDiscordMock,
}));
const message_ipc_1 = require("../../src/main/ipc/message-ipc");
(0, vitest_1.describe)('message-ipc', () => {
    (0, vitest_1.beforeEach)(() => {
        handleMock.mockReset();
    });
    (0, vitest_1.it)('registers expected handlers', () => {
        (0, message_ipc_1.registerMessageIpc)();
        (0, vitest_1.expect)(handleMock).toHaveBeenCalledTimes(5);
    });
});
//# sourceMappingURL=message-ipc.test.js.map