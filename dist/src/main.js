"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const electron_squirrel_startup_1 = __importDefault(require("electron-squirrel-startup"));
const database_1 = require("./main/database");
const campaign_ipc_1 = require("./main/ipc/campaign-ipc");
const message_ipc_1 = require("./main/ipc/message-ipc");
const player_ipc_1 = require("./main/ipc/player-ipc");
const mission_ipc_1 = require("./main/ipc/mission-ipc");
const session_ipc_1 = require("./main/ipc/session-ipc");
const army_rules_ipc_1 = require("./main/ipc/army-rules-ipc");
const rules_ipc_1 = require("./main/ipc/rules-ipc");
const player_rules_ipc_1 = require("./main/ipc/player-rules-ipc");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electron_squirrel_startup_1.default) {
    electron_1.app.quit();
}
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        width: 1500,
        height: 1000,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, 'preload.js'),
        },
    });
    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    }
    else {
        mainWindow.loadFile(node_path_1.default.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', async () => {
    await (0, database_1.initializeDatabase)();
    (0, campaign_ipc_1.registerCampaignIpc)();
    (0, player_ipc_1.registerPlayerIpc)();
    (0, message_ipc_1.registerMessageIpc)();
    (0, mission_ipc_1.registerMissionIpc)();
    (0, session_ipc_1.registerSessionIpc)();
    (0, army_rules_ipc_1.registerArmyRulesIpc)();
    (0, rules_ipc_1.registerRulesIpc)();
    (0, player_rules_ipc_1.registerPlayerRulesIpc)();
    createWindow();
});
electron_1.app.on('before-quit', async () => {
    await (0, database_1.closeDatabase)();
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//# sourceMappingURL=main.js.map