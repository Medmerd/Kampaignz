"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
// Import repositories and services
const campaign_repo_1 = require("./repositories/campaign-repo");
const player_repo_1 = require("./repositories/player-repo");
const message_repo_1 = require("./repositories/message-repo");
const message_generator_1 = require("./services/message-generator");
const discord_message_sender_1 = require("./services/discord-message-sender");
// Wargaming Missions
const mission_repo_1 = require("./repositories/mission-repo");
const mission_match_repo_1 = require("./repositories/mission-match-repo");
// Chronological RPG Sessions
const session_repo_1 = require("./repositories/session-repo");
// Army Rules
const army_rules_repo_1 = require("./repositories/army-rules-repo");
// Generic Rules
const rules_repo_1 = require("./repositories/rules-repo");
const player_rules_repo_1 = require("./repositories/player-rules-repo");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// RPC Gateway Dispatcher
const RPC_DISPATCH_MAP = {
    'campaigns:create': (name) => (0, campaign_repo_1.createCampaign)(name),
    'campaigns:list': () => (0, campaign_repo_1.listCampaigns)(),
    'campaigns:get': (id) => (0, campaign_repo_1.getCampaignById)(id),
    'campaigns:updateDetails': (id, input) => (0, campaign_repo_1.updateCampaignDetails)(id, input),
    'players:listByCampaign': (campaignId) => (0, player_repo_1.listPlayersByCampaign)(campaignId),
    'players:create': (campaignId, input) => (0, player_repo_1.createPlayer)(campaignId, input),
    'players:update': (playerId, input) => (0, player_repo_1.updatePlayer)(playerId, input),
    'messages:listByCampaign': (campaignId) => (0, message_repo_1.listMessagesByCampaign)(campaignId),
    'messages:create': (campaignId, input) => (0, message_repo_1.createMessage)(campaignId, input),
    'messages:update': (messageId, input) => (0, message_repo_1.updateMessage)(messageId, input),
    'messages:generateFromConfig': (config) => (0, message_generator_1.generateMessageFromConfig)(config),
    'messages:sendToDiscord': (content) => (0, discord_message_sender_1.sendMessageToDiscord)(content),
    // Wargaming Missions
    'missions:listByCampaign': (campaignId) => (0, mission_repo_1.listMissionsByCampaign)(campaignId),
    'missions:create': (campaignId, input) => (0, mission_repo_1.createMission)(campaignId, input),
    'missions:update': (missionId, input) => (0, mission_repo_1.updateMission)(missionId, input),
    'missions:listMatches': (missionId) => (0, mission_match_repo_1.listMissionMatches)(missionId),
    'missions:replaceMatches': (missionId, matches) => (0, mission_match_repo_1.replaceMissionMatches)(missionId, matches),
    // Chronological RPG Sessions
    'sessions:listByCampaign': (campaignId) => (0, session_repo_1.listSessionsByCampaign)(campaignId),
    'sessions:create': (campaignId, input) => (0, session_repo_1.createSession)(campaignId, input),
    'sessions:update': (sessionId, input) => (0, session_repo_1.updateSession)(sessionId, input),
    // Army Rules
    'armyRules:create': (campaignId, input) => (0, army_rules_repo_1.createArmyRulebook)(campaignId, input),
    'armyRules:get': (id) => (0, army_rules_repo_1.getArmyRulebookById)(id),
    'armyRules:listByCampaign': (campaignId) => (0, army_rules_repo_1.listArmyRulebooksByCampaign)(campaignId),
    'armyRules:update': (id, input) => (0, army_rules_repo_1.updateArmyRulebook)(id, input),
    'armyRules:share': (armyRuleId, campaignId) => (0, army_rules_repo_1.shareArmyRulebookWithCampaign)(armyRuleId, campaignId),
    'armyRules:unshare': (armyRuleId, campaignId) => (0, army_rules_repo_1.removeArmyRulebookShare)(armyRuleId, campaignId),
    // Generic Rules
    'rules:create': (input) => (0, rules_repo_1.createRule)(input),
    'rules:get': (id) => (0, rules_repo_1.getRuleById)(id),
    'rules:listByArmyRulebook': (armyRuleId) => (0, rules_repo_1.listRulesByArmyRulebook)(armyRuleId),
    'rules:listByCampaign': (campaignId) => (0, rules_repo_1.listRulesByCampaign)(campaignId),
    'rules:listByMission': (missionId) => (0, rules_repo_1.listRulesByMission)(missionId),
    'rules:update': (id, input) => (0, rules_repo_1.updateRule)(id, input),
    'rules:delete': (id) => (0, rules_repo_1.deleteRule)(id),
    // Player Rules
    'playerRules:assign': (playerId, ruleId) => (0, player_rules_repo_1.assignRuleToPlayer)(playerId, ruleId),
    'playerRules:unassign': (playerRuleId) => (0, player_rules_repo_1.unassignRuleFromPlayer)(playerRuleId),
    'playerRules:list': (playerId) => (0, player_rules_repo_1.listPlayerRules)(playerId),
};
app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
        <title>Kampaignz RPC Gateway</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0f0f12;
            color: #e4e4e7;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .card {
            max-width: 500px;
            padding: 40px;
            background: #18181b;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            border: 1px solid #27272a;
          }
          h1 {
            color: #a855f7;
            margin-top: 0;
            font-size: 2.2rem;
            font-weight: 800;
            letter-spacing: -0.025em;
          }
          p {
            font-size: 1rem;
            line-height: 1.6;
            color: #a1a1aa;
            margin-bottom: 24px;
          }
          .url-box {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            background: #09090b;
            padding: 14px 20px;
            border-radius: 8px;
            display: inline-block;
            margin-bottom: 24px;
            border: 1px solid #27272a;
          }
          .url-box a {
            color: #c084fc;
            text-decoration: none;
            font-weight: 700;
            font-size: 1.1rem;
            transition: color 0.2s;
          }
          .url-box a:hover {
            color: #d8b4fe;
            text-decoration: underline;
          }
          .footer {
            font-size: 0.8rem;
            color: #52525b;
            border-top: 1px solid #27272a;
            padding-top: 20px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Kampaignz RPC Gateway</h1>
          <p>This is the backend RPC service running on port <span style="font-weight: 600; color: #ffffff;">3000</span>.</p>
          <p>To view the premium tabletop campaign application interface, open your Vite Frontend server:</p>
          <div class="url-box">
            <a href="http://localhost:5173" target="_blank">http://localhost:5173</a>
          </div>
          <div class="footer">
            Symmetrical Hybrid API Gateway • Active Connection
          </div>
        </div>
      </body>
    </html>
  `);
});
app.post('/api/rpc', async (req, res) => {
    const { channel, args } = req.body;
    console.log(`[RPC Request] Channel: ${channel}, Args:`, args);
    const handler = RPC_DISPATCH_MAP[channel];
    if (!handler) {
        console.error(`[RPC Error] Channel '${channel}' not found.`);
        return res.status(404).json({ message: `RPC channel '${channel}' not found.` });
    }
    try {
        const result = await handler(...(args || []));
        res.json(result);
    }
    catch (error) {
        console.error(`[RPC Execution Error] Channel '${channel}':`, error);
        res.status(500).json({ message: error.message || String(error) });
    }
});
const start = async () => {
    try {
        console.log('Initializing database connection...');
        await (0, database_1.initializeDatabase)();
        console.log('Database initialized successfully.');
        app.listen(port, () => {
            console.log(`Kampaignz Web Server running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start Kampaignz web server:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=web-server.js.map