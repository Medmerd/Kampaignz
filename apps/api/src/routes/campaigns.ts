import { Router } from 'express';
import { listCampaigns, createCampaign, getCampaignById, updateCampaignDetails } from '../repositories/campaign-repo';

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
