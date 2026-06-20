import { Router } from 'express';
import { unassignRuleFromPlayer } from '../repositories/player-rules-repo';

export const playerRulesRouter = Router();

playerRulesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await unassignRuleFromPlayer(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
