"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlayerRulesIpc = void 0;
const electron_1 = require("electron");
const player_rules_repo_1 = require("../repositories/player-rules-repo");
const registerPlayerRulesIpc = () => {
    electron_1.ipcMain.handle('playerRules:assign', async (event, playerId, ruleId) => {
        return await (0, player_rules_repo_1.assignRuleToPlayer)(playerId, ruleId);
    });
    electron_1.ipcMain.handle('playerRules:unassign', async (event, playerRuleId) => {
        return await (0, player_rules_repo_1.unassignRuleFromPlayer)(playerRuleId);
    });
    electron_1.ipcMain.handle('playerRules:list', async (event, playerId) => {
        return await (0, player_rules_repo_1.listPlayerRules)(playerId);
    });
};
exports.registerPlayerRulesIpc = registerPlayerRulesIpc;
//# sourceMappingURL=player-rules-ipc.js.map