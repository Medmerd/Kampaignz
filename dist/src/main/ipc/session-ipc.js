"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSessionIpc = void 0;
const electron_1 = require("electron");
const session_repo_1 = require("../repositories/session-repo");
const registerSessionIpc = () => {
    electron_1.ipcMain.handle('sessions:listByCampaign', (_event, campaignId) => (0, session_repo_1.listSessionsByCampaign)(campaignId));
    electron_1.ipcMain.handle('sessions:create', (_event, campaignId, input) => (0, session_repo_1.createSession)(campaignId, input));
    electron_1.ipcMain.handle('sessions:update', (_event, sessionId, input) => (0, session_repo_1.updateSession)(sessionId, input));
};
exports.registerSessionIpc = registerSessionIpc;
//# sourceMappingURL=session-ipc.js.map