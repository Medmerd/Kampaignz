import { Router } from 'express';
import { updatePlayer } from '../repositories/player-repo';
import { listPlayerRules, assignRuleToPlayer } from '../repositories/player-rules-repo';

export const playersRouter = Router();

playersRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updatePlayer(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

playersRouter.get('/:id/rules', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rules = await listPlayerRules(id);
    res.json(rules);
  } catch (error) {
    next(error);
  }
});

playersRouter.post('/:id/rules', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { ruleId } = req.body;
    if (typeof ruleId !== 'number') {
      return res.status(400).json({ error: 'ruleId is required and must be a number.' });
    }
    const playerRule = await assignRuleToPlayer(id, ruleId);
    res.status(201).json(playerRule);
  } catch (error) {
    next(error);
  }
});
