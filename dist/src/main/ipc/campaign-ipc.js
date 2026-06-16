"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCampaignIpc = void 0;
const electron_1 = require("electron");
const campaign_repo_1 = require("../repositories/campaign-repo");
const registerCampaignIpc = () => {
    electron_1.ipcMain.handle('campaigns:create', (_event, name) => (0, campaign_repo_1.createCampaign)(name));
    electron_1.ipcMain.handle('campaigns:list', () => (0, campaign_repo_1.listCampaigns)());
    electron_1.ipcMain.handle('campaigns:get', (_event, id) => {
        const campaign = (0, campaign_repo_1.getCampaignById)(id);
        if (!campaign) {
            throw new Error('Campaign not found.');
        }
        return campaign;
    });
    electron_1.ipcMain.handle('campaigns:updateDetails', (_event, id, input) => (0, campaign_repo_1.updateCampaignDetails)(id, input));
};
exports.registerCampaignIpc = registerCampaignIpc;
//# sourceMappingURL=campaign-ipc.js.map