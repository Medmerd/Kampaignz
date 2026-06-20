import { Router } from 'express';
import { updateMission } from '../repositories/mission-repo';
import { listRulesByMission } from '../repositories/rules-repo';

export const missionsRouter = Router();

missionsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateMission(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

missionsRouter.get('/:id/rules', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rules = await listRulesByMission(id);
    res.json(rules);
  } catch (error) {
    next(error);
  }
});
