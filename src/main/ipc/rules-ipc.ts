import { ipcMain } from 'electron';
import {
  createRule,
  getRuleById,
  listRulesByArmyRulebook,
  listRulesByCampaign,
  listRulesByMission,
  updateRule,
  deleteRule,
} from '../repositories/rules-repo';

export const registerRulesIpc = () => {
  ipcMain.handle('rules:create', (_event, input: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => createRule(input));
  ipcMain.handle('rules:get', (_event, id: number) => getRuleById(id));
  ipcMain.handle('rules:listByArmyRulebook', (_event, armyRuleId: number) => listRulesByArmyRulebook(armyRuleId));
  ipcMain.handle('rules:listByCampaign', (_event, campaignId: number) => listRulesByCampaign(campaignId));
  ipcMain.handle('rules:listByMission', (_event, missionId: number) => listRulesByMission(missionId));
  ipcMain.handle('rules:update', (_event, id: number, input: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => updateRule(id, input));
  ipcMain.handle('rules:delete', (_event, id: number) => deleteRule(id));
};
