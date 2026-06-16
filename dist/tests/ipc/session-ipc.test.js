"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { handleMock, listSessionsByCampaignMock, createSessionMock, updateSessionMock, } = vitest_1.vi.hoisted(() => ({
    handleMock: vitest_1.vi.fn(),
    listSessionsByCampaignMock: vitest_1.vi.fn(),
    createSessionMock: vitest_1.vi.fn(),
    updateSessionMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('electron', () => ({
    ipcMain: { handle: handleMock },
}));
vitest_1.vi.mock('../../src/main/repositories/session-repo', () => ({
    listSessionsByCampaign: listSessionsByCampaignMock,
    createSession: createSessionMock,
    updateSession: updateSessionMock,
}));
const session_ipc_1 = require("../../src/main/ipc/session-ipc");
(0, vitest_1.describe)('session-ipc', () => {
    (0, vitest_1.beforeEach)(() => {
        handleMock.mockReset();
    });
    (0, vitest_1.it)('registers expected handlers', () => {
        (0, session_ipc_1.registerSessionIpc)();
        (0, vitest_1.expect)(handleMock).toHaveBeenCalledTimes(3);
    });
});
//# sourceMappingURL=session-ipc.test.js.map