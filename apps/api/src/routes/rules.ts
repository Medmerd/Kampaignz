import { Router } from 'express';
import { createRule, updateRule, deleteRule } from '../repositories/rules-repo';

export const rulesRouter = Router();

rulesRouter.post('/', async (req, res, next) => {
  try {
    const newRule = await createRule(req.body);
    res.status(201).json(newRule);
  } catch (error) {
    next(error);
  }
});

rulesRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateRule(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

rulesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteRule(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
