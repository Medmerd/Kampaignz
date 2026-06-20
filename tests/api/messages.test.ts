import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/api/src/app';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../apps/api/src/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

describe('Messages API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    const db = getTestDatabase();
    await db('campaigns').insert([{ id: 1, name: 'Main Campaign', expectedSessions: 1, config: '{}' }]);
    await db('players').insert([
      { id: 1, campaign_id: 1, playerName: 'Player 1', notes: '', config: '{}' },
      { id: 2, campaign_id: 1, playerName: 'Player 2', notes: '', config: '{}' }
    ]);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/campaigns/:id/messages', () => {
    it('returns an empty array when a campaign has no messages', async () => {
      const response = await request(app).get('/api/campaigns/1/messages');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/campaigns/:id/messages', () => {
    it('creates a new message with no players', async () => {
      const newMessage = {
        content: 'System started.',
        config: '{}',
        playerIds: []
      };

      const response = await request(app)
        .post('/api/campaigns/1/messages')
        .send(newMessage);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe('System started.');
      expect(response.body.player_ids).toEqual([]);
    });

    it('creates a new message assigned to players', async () => {
      const newMessage = {
        content: 'Hello players',
        config: '{}',
        playerIds: [1, 2]
      };

      const response = await request(app)
        .post('/api/campaigns/1/messages')
        .send(newMessage);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.player_ids).toEqual([1, 2]);
    });

    it('returns 400 if message content and config are missing', async () => {
      const response = await request(app)
        .post('/api/campaigns/1/messages')
        .send({ content: '', config: '', playerIds: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('is required');
    });

    it('returns 400 if players do not belong to the campaign', async () => {
      const response = await request(app)
        .post('/api/campaigns/1/messages')
        .send({ content: 'test', config: '{}', playerIds: [999] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('do not belong to this campaign');
    });
  });

  describe('PUT /api/messages/:id', () => {
    it('updates a message', async () => {
      const response = await request(app)
        .put('/api/messages/1') // Assuming ID 1 is the 'System started.' message
        .send({ content: 'System updated.', config: '{}', playerIds: [1] });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('System updated.');
      expect(response.body.player_ids).toEqual([1]);
    });

    it('returns 404 if message not found', async () => {
      const response = await request(app)
        .put('/api/messages/999')
        .send({ content: 'test', config: '{}', playerIds: [] });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });
});
