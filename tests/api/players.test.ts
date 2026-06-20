import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/api/src/app';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

// Mock the database layer
vi.mock('../../apps/api/src/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

describe('Players API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    const db = getTestDatabase();
    // Seed a campaign to attach players to
    await db('campaigns').insert({ id: 1, name: 'Player Campaign', expectedSessions: 1, config: '{}' });
    // Seed an army rule so we can test foreign key connections
    await db('army_rules').insert({ id: 1, name: 'Space Marines', description: 'They know no fear.', original_campaign_id: 1 });
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/campaigns/:id/players', () => {
    it('returns a 200 status and an empty array when no players exist', async () => {
      const response = await request(app).get('/api/campaigns/1/players');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/campaigns/:id/players', () => {
    it('creates a new player and returns a 201 status', async () => {
      const newPlayer = {
        playerName: 'John Doe',
        army_rule_id: 1,
        notes: 'Plays Ultramarines',
        config: '{}'
      };

      const response = await request(app)
        .post('/api/campaigns/1/players')
        .send(newPlayer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.playerName).toBe(newPlayer.playerName);
      expect(response.body.army_rule_name).toBe('Space Marines');
    });

    it('returns a 400 status if playerName is missing', async () => {
      const invalidPlayer = {
        playerName: '   ',
        army_rule_id: null,
        notes: '',
        config: '{}'
      };

      const response = await request(app)
        .post('/api/campaigns/1/players')
        .send(invalidPlayer);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/players/:id', () => {
    it('updates a player and returns a 200 status', async () => {
      // Assuming ID 1 was created by the POST test above
      const updatedPlayer = {
        playerName: 'John Doe Updated',
        army_rule_id: null,
        notes: 'Changed faction',
        config: '{"color": "blue"}'
      };

      const response = await request(app)
        .put('/api/players/1')
        .send(updatedPlayer);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.playerName).toBe(updatedPlayer.playerName);
      expect(response.body.army_rule_id).toBeNull();
    });

    it('returns a 404 status if player not found', async () => {
      const updatedPlayer = {
        playerName: 'Ghost Player',
        army_rule_id: null,
        notes: '',
        config: '{}'
      };

      const response = await request(app)
        .put('/api/players/999')
        .send(updatedPlayer);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });
});
