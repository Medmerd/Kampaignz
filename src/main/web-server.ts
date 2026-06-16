import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';
import { setupMissionIPC } from './ipc/mission-ipc';
import { setupArmyRulesIPC } from './ipc/army-rules-ipc';
import { setupRulesIPC } from './ipc/rules-ipc';
import { setupPlayerRulesIPC } from './ipc/player-rules-ipc';

// Import repositories and services
import {
  createCampaign,
  listCampaigns,
  getCampaignById,
  updateCampaignDetails,
} from './repositories/campaign-repo';

import {
  createPlayer,
  updatePlayer,
  listPlayersByCampaign,
} from './repositories/player-repo';

import {
  createMessage,
  updateMessage,
  listMessagesByCampaign,
} from './repositories/message-repo';

import { generateMessageFromConfig } from './services/message-generator';
import { sendMessageToDiscord } from './services/discord-message-sender';

// Wargaming Missions
import {
  createMission,
  updateMission,
  listMissionsByCampaign,
} from './repositories/mission-repo';

import {
  replaceMissionMatches,
  listMissionMatches,
} from './repositories/mission-match-repo';

// Chronological RPG Sessions
import {
  createSession,
  updateSession,
  listSessionsByCampaign,
} from './repositories/session-repo';

// Army Rules
import {
  createArmyRulebook,
  getArmyRulebookById,
  listArmyRulebooksByCampaign,
  updateArmyRulebook,
  shareArmyRulebookWithCampaign,
  removeArmyRulebookShare,
} from './repositories/army-rules-repo';

// Generic Rules
import {
  createRule,
  getRuleById,
  listRulesByArmyRulebook,
  listRulesByCampaign,
  listRulesByMission,
  updateRule,
  deleteRule,
} from './repositories/rules-repo';
import {
  assignRuleToPlayer,
  unassignRuleFromPlayer,
  listPlayerRules,
} from './repositories/player-rules-repo';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// RPC Gateway Dispatcher
const RPC_DISPATCH_MAP: Record<string, (...args: any[]) => Promise<any>> = {
  'campaigns:create': (name: string) => createCampaign(name),
  'campaigns:list': () => listCampaigns(),
  'campaigns:get': (id: number) => getCampaignById(id),
  'campaigns:updateDetails': (id: number, input: any) => updateCampaignDetails(id, input),
  'players:listByCampaign': (campaignId: number) => listPlayersByCampaign(campaignId),
  'players:create': (campaignId: number, input: any) => createPlayer(campaignId, input),
  'players:update': (playerId: number, input: any) => updatePlayer(playerId, input),
  'messages:listByCampaign': (campaignId: number) => listMessagesByCampaign(campaignId),
  'messages:create': (campaignId: number, input: any) => createMessage(campaignId, input),
  'messages:update': (messageId: number, input: any) => updateMessage(messageId, input),
  'messages:generateFromConfig': (config: any) => generateMessageFromConfig(config),
  'messages:sendToDiscord': (content: string) => sendMessageToDiscord(content),
  
  // Wargaming Missions
  'missions:listByCampaign': (campaignId: number) => listMissionsByCampaign(campaignId),
  'missions:create': (campaignId: number, input: any) => createMission(campaignId, input),
  'missions:update': (missionId: number, input: any) => updateMission(missionId, input),
  'missions:listMatches': (missionId: number) => listMissionMatches(missionId),
  'missions:replaceMatches': (missionId: number, matches: any[]) => replaceMissionMatches(missionId, matches),
  
  // Chronological RPG Sessions
  'sessions:listByCampaign': (campaignId: number) => listSessionsByCampaign(campaignId),
  'sessions:create': (campaignId: number, input: any) => createSession(campaignId, input),
  'sessions:update': (sessionId: number, input: any) => updateSession(sessionId, input),
  
  // Army Rules
  'armyRules:create': (campaignId: number, input: any) => createArmyRulebook(campaignId, input),
  'armyRules:get': (id: number) => getArmyRulebookById(id),
  'armyRules:listByCampaign': (campaignId: number) => listArmyRulebooksByCampaign(campaignId),
  'armyRules:update': (id: number, input: any) => updateArmyRulebook(id, input),
  'armyRules:share': (armyRuleId: number, campaignId: number) => shareArmyRulebookWithCampaign(armyRuleId, campaignId),
  'armyRules:unshare': (armyRuleId: number, campaignId: number) => removeArmyRulebookShare(armyRuleId, campaignId),
  
  // Generic Rules
  'rules:create': (input: any) => createRule(input),
  'rules:get': (id: number) => getRuleById(id),
  'rules:listByArmyRulebook': (armyRuleId: number) => listRulesByArmyRulebook(armyRuleId),
  'rules:listByCampaign': (campaignId: number) => listRulesByCampaign(campaignId),
  'rules:listByMission': (missionId: number) => listRulesByMission(missionId),
  'rules:update': (id: number, input: any) => updateRule(id, input),
  'rules:delete': (id: number) => deleteRule(id),

  // Player Rules
  'playerRules:assign': (playerId: number, ruleId: number) => assignRuleToPlayer(playerId, ruleId),
  'playerRules:unassign': (playerRuleId: number) => unassignRuleFromPlayer(playerRuleId),
  'playerRules:list': (playerId: number) => listPlayerRules(playerId),
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
  } catch (error: any) {
    console.error(`[RPC Execution Error] Channel '${channel}':`, error);
    res.status(500).json({ message: error.message || String(error) });
  }
});

const start = async () => {
  try {
    console.log('Initializing database connection...');
    await initializeDatabase();
    console.log('Database initialized successfully.');

    app.listen(port, () => {
      console.log(`Kampaignz Web Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start Kampaignz web server:', error);
    process.exit(1);
  }
};

start();
