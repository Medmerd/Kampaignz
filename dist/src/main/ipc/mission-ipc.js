"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMissionIpc = void 0;
const electron_1 = require("electron");
const mission_repo_1 = require("../repositories/mission-repo");
const mission_match_repo_1 = require("../repositories/mission-match-repo");
const registerMissionIpc = () => {
    electron_1.ipcMain.handle('missions:listByCampaign', (_event, campaignId) => (0, mission_repo_1.listMissionsByCampaign)(campaignId));
    electron_1.ipcMain.handle('missions:create', (_event, campaignId, input) => (0, mission_repo_1.createMission)(campaignId, input));
    electron_1.ipcMain.handle('missions:update', (_event, missionId, input) => (0, mission_repo_1.updateMission)(missionId, input));
    electron_1.ipcMain.handle('missions:listMatches', (_event, missionId) => (0, mission_match_repo_1.listMissionMatches)(missionId));
    electron_1.ipcMain.handle('missions:replaceMatches', (_event, missionId, matches) => (0, mission_match_repo_1.replaceMissionMatches)(missionId, matches));
};
exports.registerMissionIpc = registerMissionIpc;
//# sourceMappingURL=mission-ipc.js.map