import { Router } from 'express';
import { updateMission } from '../repositories/mission-repo';

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
