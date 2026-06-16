"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api = {
    createCampaign: (name) => electron_1.ipcRenderer.invoke('campaigns:create', name),
    listCampaigns: () => electron_1.ipcRenderer.invoke('campaigns:list'),
    getCampaign: (id) => electron_1.ipcRenderer.invoke('campaigns:get', id),
    updateCampaignDetails: (id, input) => electron_1.ipcRenderer.invoke('campaigns:updateDetails', id, input),
    listPlayersByCampaign: (campaignId) => electron_1.ipcRenderer.invoke('players:listByCampaign', campaignId),
    createPlayer: (campaignId, input) => electron_1.ipcRenderer.invoke('players:create', campaignId, input),
    updatePlayer: (playerId, input) => electron_1.ipcRenderer.invoke('players:update', playerId, input),
    listMessagesByCampaign: (campaignId) => electron_1.ipcRenderer.invoke('messages:listByCampaign', campaignId),
    createMessage: (campaignId, input) => electron_1.ipcRenderer.invoke('messages:create', campaignId, input),
    updateMessage: (messageId, input) => electron_1.ipcRenderer.invoke('messages:update', messageId, input),
    generateMessageFromConfig: (config) => electron_1.ipcRenderer.invoke('messages:generateFromConfig', config),
    sendMessageToDiscord: (content) => electron_1.ipcRenderer.invoke('messages:sendToDiscord', content),
    // Wargaming Missions (formerly Sessions)
    listMissionsByCampaign: (campaignId) => electron_1.ipcRenderer.invoke('missions:listByCampaign', campaignId),
    createMission: (campaignId, input) => electron_1.ipcRenderer.invoke('missions:create', campaignId, input),
    updateMission: (missionId, input) => electron_1.ipcRenderer.invoke('missions:update', missionId, input),
    listMissionMatches: (missionId) => electron_1.ipcRenderer.invoke('missions:listMatches', missionId),
    replaceMissionMatches: (missionId, matches) => electron_1.ipcRenderer.invoke('missions:replaceMatches', missionId, matches),
    // Chronological RPG Sessions (formerly Steps)
    listSessionsByCampaign: (campaignId) => electron_1.ipcRenderer.invoke('sessions:listByCampaign', campaignId),
    createSession: (campaignId, input) => electron_1.ipcRenderer.invoke('sessions:create', campaignId, input),
    updateSession: (sessionId, input) => electron_1.ipcRenderer.invoke('sessions:update', sessionId, input),
    // Army Rules
    createArmyRulebook: (campaignId, input) => electron_1.ipcRenderer.invoke('armyRules:create', campaignId, input),
    getArmyRulebook: (id) => electron_1.ipcRenderer.invoke('armyRules:get', id),
    listArmyRulebooksByCampaign: (campaignId) => electron_1.ipcRenderer.invoke('armyRules:listByCampaign', campaignId),
    updateArmyRulebook: (id, input) => electron_1.ipcRenderer.invoke('armyRules:update', id, input),
    shareArmyRulebookWithCampaign: (armyRuleId, campaignId) => electron_1.ipcRenderer.invoke('armyRules:share', armyRuleId, campaignId),
    removeArmyRulebookShare: (armyRuleId, campaignId) => electron_1.ipcRenderer.invoke('armyRules:unshare', armyRuleId, campaignId),
    // Generic Rules
    createRule: (input) => electron_1.ipcRenderer.invoke('rules:create', input),
    getRule: (id) => electron_1.ipcRenderer.invoke('rules:get', id),
    listRulesByArmyRulebook: (armyRuleId) => electron_1.ipcRenderer.invoke('rules:listByArmyRulebook', armyRuleId),
    listRulesByCampaign: (campaignId) => electron_1.ipcRenderer.invoke('rules:listByCampaign', campaignId),
    listRulesByMission: (missionId) => electron_1.ipcRenderer.invoke('rules:listByMission', missionId),
    updateRule: (id, input) => electron_1.ipcRenderer.invoke('rules:update', id, input),
    deleteRule: (id) => electron_1.ipcRenderer.invoke('rules:delete', id),
    // Player Rules
    assignRuleToPlayer: (playerId, ruleId) => electron_1.ipcRenderer.invoke('playerRules:assign', playerId, ruleId),
    unassignRuleFromPlayer: (playerRuleId) => electron_1.ipcRenderer.invoke('playerRules:unassign', playerRuleId),
    listPlayerRules: (playerId) => electron_1.ipcRenderer.invoke('playerRules:list', playerId),
};
electron_1.contextBridge.exposeInMainWorld('api', api);
//# sourceMappingURL=preload.js.map