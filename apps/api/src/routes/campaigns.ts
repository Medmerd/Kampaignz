import { Router } from 'express';
import { listCampaigns, createCampaign, getCampaignById, updateCampaignDetails } from '../repositories/campaign-repo';
import { listMissionsByCampaign, createMission } from '../repositories/mission-repo';
import { listSessionsByCampaign, createSession } from '../repositories/session-repo';
import { listPlayersByCampaign, createPlayer } from '../repositories/player-repo';
import { listArmyRulebooksByCampaign, createArmyRulebook } from '../repositories/army-rules-repo';
import { listRulesByCampaign } from '../repositories/rules-repo';
import { listMessagesByCampaign, createMessage } from '../repositories/message-repo';

export const campaignsRouter = Router();

campaignsRouter.get('/', async (req, res, next) => {
  try {
    const campaigns = await listCampaigns();
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    const campaign = await createCampaign(name);
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const campaign = await getCampaignById(id);
    res.json(campaign || {});
  } catch (error) {
    next(error);
  }
});

campaignsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateCampaignDetails(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.get('/:id/missions', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const missions = await listMissionsByCampaign(id);
    res.json(missions);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.post('/:id/missions', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const newMission = await createMission(id, req.body);
    res.status(201).json(newMission);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.get('/:id/sessions', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sessions = await listSessionsByCampaign(id);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.post('/:id/sessions', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const newSession = await createSession(id, req.body);
    res.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.get('/:id/players', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const players = await listPlayersByCampaign(id);
    res.json(players);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.post('/:id/players', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const newPlayer = await createPlayer(id, req.body);
    res.status(201).json(newPlayer);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.get('/:id/army-rulebooks', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rulebooks = await listArmyRulebooksByCampaign(id);
    res.json(rulebooks);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.post('/:id/army-rulebooks', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const newRulebook = await createArmyRulebook(id, req.body);
    res.status(201).json(newRulebook);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.get('/:id/rules', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rules = await listRulesByCampaign(id);
    res.json(rules);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.get('/:id/messages', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const messages = await listMessagesByCampaign(id);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

campaignsRouter.post('/:id/messages', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const newMessage = await createMessage(id, req.body);
    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
});
