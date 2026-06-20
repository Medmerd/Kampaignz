import { Router } from 'express';
import { updateSession } from '../repositories/session-repo';

export const sessionsRouter = Router();

sessionsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateSession(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});
