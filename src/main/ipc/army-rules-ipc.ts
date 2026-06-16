import { ipcMain } from 'electron';
import {
  createArmyRulebook,
  getArmyRulebookById,
  listArmyRulebooksByCampaign,
  updateArmyRulebook,
  shareArmyRulebookWithCampaign,
  removeArmyRulebookShare,
  type ArmyRulebook,
} from '../repositories/army-rules-repo';

export const registerArmyRulesIpc = () => {
  ipcMain.handle(
    'armyRules:create',
    (_event, campaignId: number, input: Pick<ArmyRulebook, 'name' | 'description'>) =>
      createArmyRulebook(campaignId, input)
  );

  ipcMain.handle('armyRules:get', (_event, id: number) => {
    return getArmyRulebookById(id);
  });

  ipcMain.handle('armyRules:listByCampaign', (_event, campaignId: number) => {
    return listArmyRulebooksByCampaign(campaignId);
  });

  ipcMain.handle(
    'armyRules:update',
    (_event, id: number, input: Pick<ArmyRulebook, 'name' | 'description'>) =>
      updateArmyRulebook(id, input)
  );

  ipcMain.handle(
    'armyRules:share',
    (_event, armyRuleId: number, campaignId: number) =>
      shareArmyRulebookWithCampaign(armyRuleId, campaignId)
  );

  ipcMain.handle(
    'armyRules:unshare',
    (_event, armyRuleId: number, campaignId: number) =>
      removeArmyRulebookShare(armyRuleId, campaignId)
  );
};
