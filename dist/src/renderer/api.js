"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// Safely determine if running inside Electron or a standard Web browser
const isElectron = typeof window !== 'undefined' && window.api !== undefined;
// Fallback client for Web pod environments mirroring Electron's native IPC bridge
const rpcClient = async (channel, ...args) => {
    const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel, args }),
    });
    if (!response.ok) {
        const errorDetails = await response.json().catch(() => ({}));
        throw new Error(errorDetails.message || `RPC request to '${channel}' failed with status ${response.status}`);
    }
    return response.json();
};
exports.api = {
    createCampaign: (name) => isElectron ? window.api.createCampaign(name) : rpcClient('campaigns:create', name),
    listCampaigns: () => isElectron ? window.api.listCampaigns() : rpcClient('campaigns:list'),
    getCampaign: (id) => isElectron ? window.api.getCampaign(id) : rpcClient('campaigns:get', id),
    updateCampaignDetails: (id, input) => isElectron ? window.api.updateCampaignDetails(id, input) : rpcClient('campaigns:updateDetails', id, input),
    listPlayersByCampaign: (campaignId) => isElectron ? window.api.listPlayersByCampaign(campaignId) : rpcClient('players:listByCampaign', campaignId),
    createPlayer: (campaignId, input) => isElectron ? window.api.createPlayer(campaignId, input) : rpcClient('players:create', campaignId, input),
    updatePlayer: (playerId, input) => isElectron ? window.api.updatePlayer(playerId, input) : rpcClient('players:update', playerId, input),
    listMessagesByCampaign: (campaignId) => isElectron ? window.api.listMessagesByCampaign(campaignId) : rpcClient('messages:listByCampaign', campaignId),
    createMessage: (campaignId, input) => isElectron ? window.api.createMessage(campaignId, input) : rpcClient('messages:create', campaignId, input),
    updateMessage: (messageId, input) => isElectron ? window.api.updateMessage(messageId, input) : rpcClient('messages:update', messageId, input),
    generateMessageFromConfig: (config) => isElectron ? window.api.generateMessageFromConfig(config) : rpcClient('messages:generateFromConfig', config),
    sendMessageToDiscord: (content) => isElectron ? window.api.sendMessageToDiscord(content) : rpcClient('messages:sendToDiscord', content),
    // Wargaming Missions (formerly Sessions)
    listMissionsByCampaign: (campaignId) => isElectron ? window.api.listMissionsByCampaign(campaignId) : rpcClient('missions:listByCampaign', campaignId),
    createMission: (campaignId, input) => isElectron ? window.api.createMission(campaignId, input) : rpcClient('missions:create', campaignId, input),
    updateMission: (missionId, input) => isElectron ? window.api.updateMission(missionId, input) : rpcClient('missions:update', missionId, input),
    listMissionMatches: (missionId) => isElectron ? window.api.listMissionMatches(missionId) : rpcClient('missions:listMatches', missionId),
    replaceMissionMatches: (missionId, matches) => isElectron ? window.api.replaceMissionMatches(missionId, matches) : rpcClient('missions:replaceMatches', missionId, matches),
    // Chronological RPG Sessions (formerly Steps)
    listSessionsByCampaign: (campaignId) => isElectron ? window.api.listSessionsByCampaign(campaignId) : rpcClient('sessions:listByCampaign', campaignId),
    createSession: (campaignId, input) => isElectron ? window.api.createSession(campaignId, input) : rpcClient('sessions:create', campaignId, input),
    updateSession: (sessionId, input) => isElectron ? window.api.updateSession(sessionId, input) : rpcClient('sessions:update', sessionId, input),
    // Army Rules
    createArmyRulebook: (campaignId, input) => isElectron ? window.api.createArmyRulebook(campaignId, input) : rpcClient('armyRules:create', campaignId, input),
    getArmyRulebook: (id) => isElectron ? window.api.getArmyRulebook(id) : rpcClient('armyRules:get', id),
    listArmyRulebooksByCampaign: (campaignId) => isElectron ? window.api.listArmyRulebooksByCampaign(campaignId) : rpcClient('armyRules:listByCampaign', campaignId),
    updateArmyRulebook: (id, input) => isElectron ? window.api.updateArmyRulebook(id, input) : rpcClient('armyRules:update', id, input),
    shareArmyRulebookWithCampaign: (armyRuleId, campaignId) => isElectron ? window.api.shareArmyRulebookWithCampaign(armyRuleId, campaignId) : rpcClient('armyRules:share', armyRuleId, campaignId),
    removeArmyRulebookShare: (armyRuleId, campaignId) => isElectron ? window.api.removeArmyRulebookShare(armyRuleId, campaignId) : rpcClient('armyRules:unshare', armyRuleId, campaignId),
    // Generic Rules
    createRule: (input) => isElectron ? window.api.createRule(input) : rpcClient('rules:create', input),
    getRule: (id) => isElectron ? window.api.getRule(id) : rpcClient('rules:get', id),
    listRulesByArmyRulebook: (armyRuleId) => isElectron ? window.api.listRulesByArmyRulebook(armyRuleId) : rpcClient('rules:listByArmyRulebook', armyRuleId),
    listRulesByCampaign: (campaignId) => isElectron ? window.api.listRulesByCampaign(campaignId) : rpcClient('rules:listByCampaign', campaignId),
    listRulesByMission: (missionId) => isElectron ? window.api.listRulesByMission(missionId) : rpcClient('rules:listByMission', missionId),
    updateRule: (id, input) => isElectron ? window.api.updateRule(id, input) : rpcClient('rules:update', id, input),
    deleteRule: (id) => isElectron ? window.api.deleteRule(id) : rpcClient('rules:delete', id),
    // Player Rules
    assignRuleToPlayer: (playerId, ruleId) => isElectron ? window.api.assignRuleToPlayer(playerId, ruleId) : rpcClient('playerRules:assign', playerId, ruleId),
    unassignRuleFromPlayer: (playerRuleId) => isElectron ? window.api.unassignRuleFromPlayer(playerRuleId) : rpcClient('playerRules:unassign', playerRuleId),
    listPlayerRules: (playerId) => isElectron ? window.api.listPlayerRules(playerId) : rpcClient('playerRules:list', playerId),
};
//# sourceMappingURL=api.js.map