import { ipcMain } from 'electron';
import { createCampaign, listCampaigns } from '../repositories/campaign-repo';

export const registerCampaignIpc = () => {
  ipcMain.handle('campaigns:create', (_event, name: string) =>
    createCampaign(name),
  );

  ipcMain.handle('campaigns:list', () => listCampaigns());
};
