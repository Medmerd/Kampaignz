import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/api/src/app';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

// Mock the database layer
vi.mock('../../apps/api/src/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

describe('Missions API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    const db = getTestDatabase();
    // Seed a campaign to attach missions to
    await db('campaigns').insert({ id: 1, name: 'Mission Campaign', expectedSessions: 1, config: '{}' });
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/campaigns/:id/missions', () => {
    it('returns a 200 status and an empty array when no missions exist', async () => {
      const response = await request(app).get('/api/campaigns/1/missions');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/campaigns/:id/missions', () => {
    it('creates a new mission and returns a 201 status', async () => {
      const newMission = {
        title: 'Strike Force',
        config: { obj: 'Hold' },
        missionDetails: 'Defend the objective',
        map: 'Sector Imperialis'
      };

      const response = await request(app)
        .post('/api/campaigns/1/missions')
        .send(newMission);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newMission.title);
      expect(response.body.campaign_id).toBe(1);
    });

    it('returns a 400 status if title is missing', async () => {
      const invalidMission = {
        title: '   ',
        config: {},
        missionDetails: '',
        map: ''
      };

      const response = await request(app)
        .post('/api/campaigns/1/missions')
        .send(invalidMission);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/missions/:id', () => {
    it('updates a mission and returns a 200 status', async () => {
      // Assuming ID 1 was created by the POST test above
      const updatedMission = {
        title: 'Strike Force Updated',
        config: { obj: 'Push' },
        missionDetails: 'Attack the objective',
        map: 'Sector Mechanicus'
      };

      const response = await request(app)
        .put('/api/missions/1')
        .send(updatedMission);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe(updatedMission.title);
      expect(response.body.map).toBe(updatedMission.map);
    });

    it('returns a 404 status if mission not found', async () => {
      const updatedMission = {
        title: 'Ghost Mission',
        config: {},
        missionDetails: '',
        map: ''
      };

      const response = await request(app)
        .put('/api/missions/999')
        .send(updatedMission);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });
});
