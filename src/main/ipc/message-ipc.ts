import { ipcMain } from 'electron';
import {
  createMessage,
  listMessagesByCampaign,
  updateMessage,
  type MessageInput,
} from '../repositories/message-repo';
import { generateMessageFromConfig } from '../services/message-generator';
import { sendMessageToDiscord } from '../services/discord-message-sender';

export const registerMessageIpc = () => {
  ipcMain.handle('messages:listByCampaign', (_event, campaignId: number) =>
    listMessagesByCampaign(campaignId),
  );

  ipcMain.handle(
    'messages:create',
    (_event, campaignId: number, input: MessageInput) =>
      createMessage(campaignId, input),
  );

  ipcMain.handle('messages:update', (_event, messageId: number, input: MessageInput) =>
    updateMessage(messageId, input),
  );

  ipcMain.handle(
    'messages:generateFromConfig',
    (_event, config: Record<string, unknown>) =>
      generateMessageFromConfig(config),
  );

  ipcMain.handle('messages:sendToDiscord', (_event, content: string) =>
    sendMessageToDiscord(content),
  );
};
