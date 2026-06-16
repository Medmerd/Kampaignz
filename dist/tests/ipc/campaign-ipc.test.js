"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { handleMock, createCampaignMock, listCampaignsMock, getCampaignByIdMock, updateCampaignDetailsMock, } = vitest_1.vi.hoisted(() => ({
    handleMock: vitest_1.vi.fn(),
    createCampaignMock: vitest_1.vi.fn(),
    listCampaignsMock: vitest_1.vi.fn(),
    getCampaignByIdMock: vitest_1.vi.fn(),
    updateCampaignDetailsMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('electron', () => ({
    ipcMain: { handle: handleMock },
}));
vitest_1.vi.mock('../../src/main/repositories/campaign-repo', () => ({
    createCampaign: createCampaignMock,
    listCampaigns: listCampaignsMock,
    getCampaignById: getCampaignByIdMock,
    updateCampaignDetails: updateCampaignDetailsMock,
}));
const campaign_ipc_1 = require("../../src/main/ipc/campaign-ipc");
(0, vitest_1.describe)('campaign-ipc', () => {
    (0, vitest_1.beforeEach)(() => {
        handleMock.mockReset();
    });
    (0, vitest_1.it)('registers expected handlers', () => {
        (0, campaign_ipc_1.registerCampaignIpc)();
        (0, vitest_1.expect)(handleMock).toHaveBeenCalledTimes(4);
    });
});
//# sourceMappingURL=campaign-ipc.test.js.map