"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMessageIpc = void 0;
const electron_1 = require("electron");
const message_repo_1 = require("../repositories/message-repo");
const message_generator_1 = require("../services/message-generator");
const discord_message_sender_1 = require("../services/discord-message-sender");
const registerMessageIpc = () => {
    electron_1.ipcMain.handle('messages:listByCampaign', (_event, campaignId) => (0, message_repo_1.listMessagesByCampaign)(campaignId));
    electron_1.ipcMain.handle('messages:create', (_event, campaignId, input) => (0, message_repo_1.createMessage)(campaignId, input));
    electron_1.ipcMain.handle('messages:update', (_event, messageId, input) => (0, message_repo_1.updateMessage)(messageId, input));
    electron_1.ipcMain.handle('messages:generateFromConfig', (_event, config) => (0, message_generator_1.generateMessageFromConfig)(config));
    electron_1.ipcMain.handle('messages:sendToDiscord', (_event, content) => (0, discord_message_sender_1.sendMessageToDiscord)(content));
};
exports.registerMessageIpc = registerMessageIpc;
//# sourceMappingURL=message-ipc.js.map