import { ipcMain } from 'electron';
import {
  createMission,
  listMissionsByCampaign,
  updateMission,
  type MissionInput,
} from '../repositories/mission-repo';
import {
  listMissionMatches,
  replaceMissionMatches,
  type MissionMatch,
} from '../repositories/mission-match-repo';

export const registerMissionIpc = () => {
  ipcMain.handle('missions:listByCampaign', (_event, campaignId: number) =>
    listMissionsByCampaign(campaignId),
  );

  ipcMain.handle(
    'missions:create',
    (_event, campaignId: number, input: MissionInput) =>
      createMission(campaignId, input),
  );

  ipcMain.handle('missions:update', (_event, missionId: number, input: MissionInput) =>
    updateMission(missionId, input),
  );

  ipcMain.handle('missions:listMatches', (_event, missionId: number) =>
    listMissionMatches(missionId),
  );

  ipcMain.handle(
    'missions:replaceMatches',
    (_event, missionId: number, matches: MissionMatch[]) =>
      replaceMissionMatches(missionId, matches),
  );
};
