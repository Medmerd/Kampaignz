"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { handleMock, listPlayersByCampaignMock, createPlayerMock, updatePlayerMock, } = vitest_1.vi.hoisted(() => ({
    handleMock: vitest_1.vi.fn(),
    listPlayersByCampaignMock: vitest_1.vi.fn(),
    createPlayerMock: vitest_1.vi.fn(),
    updatePlayerMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('electron', () => ({
    ipcMain: { handle: handleMock },
}));
vitest_1.vi.mock('../../src/main/repositories/player-repo', () => ({
    listPlayersByCampaign: listPlayersByCampaignMock,
    createPlayer: createPlayerMock,
    updatePlayer: updatePlayerMock,
}));
const player_ipc_1 = require("../../src/main/ipc/player-ipc");
(0, vitest_1.describe)('player-ipc', () => {
    (0, vitest_1.beforeEach)(() => {
        handleMock.mockReset();
    });
    (0, vitest_1.it)('registers expected handlers', () => {
        (0, player_ipc_1.registerPlayerIpc)();
        (0, vitest_1.expect)(handleMock).toHaveBeenCalledTimes(3);
    });
});
//# sourceMappingURL=player-ipc.test.js.map