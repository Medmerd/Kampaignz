import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/api/src/app';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

// Mock the database layer
vi.mock('../../apps/api/src/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

describe('Sessions API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    const db = getTestDatabase();
    // Seed a campaign to attach sessions to
    await db('campaigns').insert({ id: 1, name: 'Session Campaign', expectedSessions: 1, config: '{}' });
    // Seed a mission to attach to sessions
    await db('missions').insert({ id: 1, campaign_id: 1, title: 'Sample Mission', config: '{}', missionDetails: '', map: '' });
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/campaigns/:id/sessions', () => {
    it('returns a 200 status and an empty array when no sessions exist', async () => {
      const response = await request(app).get('/api/campaigns/1/sessions');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/campaigns/:id/sessions', () => {
    it('creates a new session and returns a 201 status', async () => {
      const newSession = {
        title: 'Session 1',
        notes: 'First game',
        config: { weather: 'rain' },
        missionIds: [1]
      };

      const response = await request(app)
        .post('/api/campaigns/1/sessions')
        .send(newSession);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newSession.title);
      expect(response.body.mission_ids).toEqual([1]);
    });

    it('returns a 400 status if title is missing', async () => {
      const invalidSession = {
        title: '   ',
        notes: '',
        config: {},
        missionIds: []
      };

      const response = await request(app)
        .post('/api/campaigns/1/sessions')
        .send(invalidSession);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/sessions/:id', () => {
    it('updates a session and returns a 200 status', async () => {
      // Assuming ID 1 was created by the POST test above
      const updatedSession = {
        title: 'Session 1 Updated',
        notes: 'Still the first game',
        config: { weather: 'clear' },
        missionIds: []
      };

      const response = await request(app)
        .put('/api/sessions/1')
        .send(updatedSession);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe(updatedSession.title);
      expect(response.body.mission_ids).toEqual([]);
    });

    it('returns a 404 status if session not found', async () => {
      const updatedSession = {
        title: 'Ghost Session',
        notes: '',
        config: {},
        missionIds: []
      };

      const response = await request(app)
        .put('/api/sessions/999')
        .send(updatedSession);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });
});
