import { Router } from 'express';
import { updatePlayer } from '../repositories/player-repo';

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
