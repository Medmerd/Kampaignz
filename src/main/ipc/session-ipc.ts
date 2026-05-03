import { ipcMain } from 'electron';
import {
  createSession,
  listSessionsByCampaign,
  updateSession,
  type SessionInput,
} from '../repositories/session-repo';

export const registerSessionIpc = () => {
  ipcMain.handle('sessions:listByCampaign', (_event, campaignId: number) =>
    listSessionsByCampaign(campaignId),
  );

  ipcMain.handle(
    'sessions:create',
    (_event, campaignId: number, input: SessionInput) =>
      createSession(campaignId, input),
  );

  ipcMain.handle('sessions:update', (_event, sessionId: number, input: SessionInput) =>
    updateSession(sessionId, input),
  );
};
