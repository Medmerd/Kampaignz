import { ipcMain } from 'electron';
import {
  createPlayer,
  listPlayersByCampaign,
  updatePlayer,
  type PlayerInput,
} from '../repositories/player-repo';

export const registerPlayerIpc = () => {
  ipcMain.handle('players:listByCampaign', (_event, campaignId: number) =>
    listPlayersByCampaign(campaignId),
  );

  ipcMain.handle(
    'players:create',
    (_event, campaignId: number, input: PlayerInput) =>
      createPlayer(campaignId, input),
  );

  ipcMain.handle('players:update', (_event, playerId: number, input: PlayerInput) =>
    updatePlayer(playerId, input),
  );
};
