"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRulesIpc = void 0;
const electron_1 = require("electron");
const rules_repo_1 = require("../repositories/rules-repo");
const registerRulesIpc = () => {
    electron_1.ipcMain.handle('rules:create', (_event, input) => (0, rules_repo_1.createRule)(input));
    electron_1.ipcMain.handle('rules:get', (_event, id) => (0, rules_repo_1.getRuleById)(id));
    electron_1.ipcMain.handle('rules:listByArmyRulebook', (_event, armyRuleId) => (0, rules_repo_1.listRulesByArmyRulebook)(armyRuleId));
    electron_1.ipcMain.handle('rules:listByCampaign', (_event, campaignId) => (0, rules_repo_1.listRulesByCampaign)(campaignId));
    electron_1.ipcMain.handle('rules:listByMission', (_event, missionId) => (0, rules_repo_1.listRulesByMission)(missionId));
    electron_1.ipcMain.handle('rules:update', (_event, id, input) => (0, rules_repo_1.updateRule)(id, input));
    electron_1.ipcMain.handle('rules:delete', (_event, id) => (0, rules_repo_1.deleteRule)(id));
};
exports.registerRulesIpc = registerRulesIpc;
//# sourceMappingURL=rules-ipc.js.map