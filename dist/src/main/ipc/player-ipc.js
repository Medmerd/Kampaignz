"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlayerIpc = void 0;
const electron_1 = require("electron");
const player_repo_1 = require("../repositories/player-repo");
const registerPlayerIpc = () => {
    electron_1.ipcMain.handle('players:listByCampaign', (_event, campaignId) => (0, player_repo_1.listPlayersByCampaign)(campaignId));
    electron_1.ipcMain.handle('players:create', (_event, campaignId, input) => (0, player_repo_1.createPlayer)(campaignId, input));
    electron_1.ipcMain.handle('players:update', (_event, playerId, input) => (0, player_repo_1.updatePlayer)(playerId, input));
};
exports.registerPlayerIpc = registerPlayerIpc;
//# sourceMappingURL=player-ipc.js.map