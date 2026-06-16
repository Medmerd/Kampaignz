"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerArmyRulesIpc = void 0;
const electron_1 = require("electron");
const army_rules_repo_1 = require("../repositories/army-rules-repo");
const registerArmyRulesIpc = () => {
    electron_1.ipcMain.handle('armyRules:create', (_event, campaignId, input) => (0, army_rules_repo_1.createArmyRulebook)(campaignId, input));
    electron_1.ipcMain.handle('armyRules:get', (_event, id) => {
        return (0, army_rules_repo_1.getArmyRulebookById)(id);
    });
    electron_1.ipcMain.handle('armyRules:listByCampaign', (_event, campaignId) => {
        return (0, army_rules_repo_1.listArmyRulebooksByCampaign)(campaignId);
    });
    electron_1.ipcMain.handle('armyRules:update', (_event, id, input) => (0, army_rules_repo_1.updateArmyRulebook)(id, input));
    electron_1.ipcMain.handle('armyRules:share', (_event, armyRuleId, campaignId) => (0, army_rules_repo_1.shareArmyRulebookWithCampaign)(armyRuleId, campaignId));
    electron_1.ipcMain.handle('armyRules:unshare', (_event, armyRuleId, campaignId) => (0, army_rules_repo_1.removeArmyRulebookShare)(armyRuleId, campaignId));
};
exports.registerArmyRulesIpc = registerArmyRulesIpc;
//# sourceMappingURL=army-rules-ipc.js.map