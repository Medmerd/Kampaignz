import { ipcMain } from 'electron';
import {
  createStep,
  listStepsByCampaign,
  updateStep,
  type StepInput,
} from '../repositories/step-repo';

export const registerStepIpc = () => {
  ipcMain.handle('steps:listByCampaign', (_event, campaignId: number) =>
    listStepsByCampaign(campaignId),
  );

  ipcMain.handle('steps:create', (_event, campaignId: number, input: StepInput) =>
    createStep(campaignId, input),
  );

  ipcMain.handle('steps:update', (_event, stepId: number, input: StepInput) =>
    updateStep(stepId, input),
  );
};
