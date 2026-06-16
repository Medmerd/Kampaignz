"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { handleMock, listMissionsByCampaignMock, createMissionMock, updateMissionMock, } = vitest_1.vi.hoisted(() => ({
    handleMock: vitest_1.vi.fn(),
    listMissionsByCampaignMock: vitest_1.vi.fn(),
    createMissionMock: vitest_1.vi.fn(),
    updateMissionMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('electron', () => ({
    ipcMain: { handle: handleMock },
}));
vitest_1.vi.mock('../../src/main/repositories/mission-repo', () => ({
    listMissionsByCampaign: listMissionsByCampaignMock,
    createMission: createMissionMock,
    updateMission: updateMissionMock,
}));
vitest_1.vi.mock('../../src/main/repositories/mission-match-repo', () => ({
    listMissionMatches: vitest_1.vi.fn(),
    replaceMissionMatches: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../../knexfile.js', () => ({
    default: {
        development: { client: 'sqlite3', connection: ':memory:' },
    },
}));
const mission_ipc_1 = require("../../src/main/ipc/mission-ipc");
(0, vitest_1.describe)('mission-ipc', () => {
    (0, vitest_1.beforeEach)(() => {
        handleMock.mockReset();
    });
    (0, vitest_1.it)('registers expected handlers', () => {
        (0, mission_ipc_1.registerMissionIpc)();
        (0, vitest_1.expect)(handleMock).toHaveBeenCalledTimes(5);
    });
});
//# sourceMappingURL=mission-ipc.test.js.map