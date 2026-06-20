import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/api/src/app';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../apps/api/src/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

describe('Army Rulebooks API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    const db = getTestDatabase();
    await db('campaigns').insert([
      { id: 1, name: 'Main Campaign', expectedSessions: 1, config: '{}' },
      { id: 2, name: 'Other Campaign', expectedSessions: 1, config: '{}' },
    ]);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/campaigns/:id/army-rulebooks', () => {
    it('returns a 200 status and an empty array when no army rulebooks exist', async () => {
      const response = await request(app).get('/api/campaigns/1/army-rulebooks');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/campaigns/:id/army-rulebooks', () => {
    it('creates a new army rulebook and returns a 201 status', async () => {
      const newRulebook = {
        name: 'Space Marines',
        description: 'They know no fear.'
      };

      const response = await request(app)
        .post('/api/campaigns/1/army-rulebooks')
        .send(newRulebook);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newRulebook.name);
      expect(response.body.original_campaign_id).toBe(1);
    });

    it('returns a 400 status if name is missing', async () => {
      const invalidRulebook = {
        name: '   ',
        description: 'Missing name'
      };

      const response = await request(app)
        .post('/api/campaigns/1/army-rulebooks')
        .send(invalidRulebook);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/army-rulebooks/:id', () => {
    it('returns an army rulebook by id', async () => {
      const response = await request(app).get('/api/army-rulebooks/1');
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Space Marines');
    });

    it('returns 404 if army rulebook not found', async () => {
      const response = await request(app).get('/api/army-rulebooks/999');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/army-rulebooks/:id', () => {
    it('updates an army rulebook and returns a 200 status', async () => {
      const updatedRulebook = {
        name: 'Adeptus Astartes',
        description: 'Updated description.'
      };

      const response = await request(app)
        .put('/api/army-rulebooks/1')
        .send(updatedRulebook);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe(updatedRulebook.name);
    });
  });

  describe('POST /api/army-rulebooks/:id/share', () => {
    it('shares an army rulebook with another campaign', async () => {
      const response = await request(app)
        .post('/api/army-rulebooks/1/share')
        .send({ campaignId: 2 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('returns 400 if trying to share with original campaign', async () => {
      const response = await request(app)
        .post('/api/army-rulebooks/1/share')
        .send({ campaignId: 1 });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/army-rulebooks/:id/share/:campaignId', () => {
    it('removes a share from a campaign', async () => {
      const response = await request(app)
        .delete('/api/army-rulebooks/1/share/2');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });
});
