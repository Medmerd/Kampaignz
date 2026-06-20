import { Router } from 'express';
import {
  getArmyRulebookById,
  updateArmyRulebook,
  shareArmyRulebookWithCampaign,
  removeArmyRulebookShare
} from '../repositories/army-rules-repo';
import { listRulesByArmyRulebook } from '../repositories/rules-repo';

export const armyRulebooksRouter = Router();

armyRulebooksRouter.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rulebook = await getArmyRulebookById(id);
    if (!rulebook) {
      return res.status(404).json({ error: 'Army Rulebook not found.' });
    }
    res.json(rulebook);
  } catch (error) {
    next(error);
  }
});

armyRulebooksRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateArmyRulebook(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

armyRulebooksRouter.post('/:id/share', async (req, res, next) => {
  try {
    const armyRuleId = parseInt(req.params.id, 10);
    const campaignId = req.body.campaignId;
    if (typeof campaignId !== 'number') {
      return res.status(400).json({ error: 'campaignId is required and must be a number.' });
    }
    await shareArmyRulebookWithCampaign(armyRuleId, campaignId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

armyRulebooksRouter.delete('/:id/share/:campaignId', async (req, res, next) => {
  try {
    const armyRuleId = parseInt(req.params.id, 10);
    const campaignId = parseInt(req.params.campaignId, 10);
    await removeArmyRulebookShare(armyRuleId, campaignId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

armyRulebooksRouter.get('/:id/rules', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rules = await listRulesByArmyRulebook(id);
    res.json(rules);
  } catch (error) {
    next(error);
  }
});
