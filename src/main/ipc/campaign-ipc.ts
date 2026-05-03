import { ipcMain } from 'electron';
import {
  createCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaignName,
} from '../repositories/campaign-repo';

export const registerCampaignIpc = () => {
  ipcMain.handle('campaigns:create', (_event, name: string) =>
    createCampaign(name),
  );

  ipcMain.handle('campaigns:list', () => listCampaigns());

  ipcMain.handle('campaigns:get', (_event, id: number) => {
    const campaign = getCampaignById(id);

    if (!campaign) {
      throw new Error('Campaign not found.');
    }

    return campaign;
  });

  ipcMain.handle('campaigns:updateName', (_event, id: number, name: string) =>
    updateCampaignName(id, name),
  );
};
