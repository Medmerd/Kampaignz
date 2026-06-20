import { Router } from 'express';
import { updateMessage } from '../repositories/message-repo';

export const messagesRouter = Router();

messagesRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateMessage(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});
