import { ipcMain } from 'electron';
import { assignRuleToPlayer, unassignRuleFromPlayer, listPlayerRules } from '../repositories/player-rules-repo';

export const registerPlayerRulesIpc = () => {
  ipcMain.handle('playerRules:assign', async (event, playerId: number, ruleId: number) => {
    return await assignRuleToPlayer(playerId, ruleId);
  });

  ipcMain.handle('playerRules:unassign', async (event, playerRuleId: number) => {
    return await unassignRuleFromPlayer(playerRuleId);
  });

  ipcMain.handle('playerRules:list', async (event, playerId: number) => {
    return await listPlayerRules(playerId);
  });
};
