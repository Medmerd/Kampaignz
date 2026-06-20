import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/api/src/app';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../apps/api/src/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

describe('Player Rules API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    const db = getTestDatabase();
    await db('campaigns').insert([{ id: 1, name: 'Main Campaign', expectedSessions: 1, config: '{}' }]);
    await db('players').insert([{ id: 1, campaign_id: 1, playerName: 'test', config: '{}', notes: '' }]);
    await db('rules').insert([
      { id: 1, name: 'Campaign Rule', rule_category: 'test', description: 'desc', campaign_id: 1 },
      { id: 2, name: 'Army Rule', rule_category: 'test', description: 'desc', army_rule_id: 1 }
    ]);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/players/:id/rules', () => {
    it('returns an empty array when a player has no rules', async () => {
      const response = await request(app).get('/api/players/1/rules');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/players/:id/rules', () => {
    it('assigns a campaign rule to a player', async () => {
      const response = await request(app)
        .post('/api/players/1/rules')
        .send({ ruleId: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.player_id).toBe(1);
      expect(response.body.rule_id).toBe(1);
    });

    it('returns a 400 status if assigning an army rule', async () => {
      const response = await request(app)
        .post('/api/players/1/rules')
        .send({ ruleId: 2 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Only campaign rules can be assigned');
    });

    it('returns a 400 status if ruleId is missing', async () => {
      const response = await request(app)
        .post('/api/players/1/rules')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/player-rules/:id', () => {
    it('removes a rule from a player', async () => {
      // First get the assigned rule ID
      const listRes = await request(app).get('/api/players/1/rules');
      const playerRuleId = listRes.body[0].id;

      const response = await request(app).delete(`/api/player-rules/${playerRuleId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      const verifyRes = await request(app).get('/api/players/1/rules');
      expect(verifyRes.body.length).toBe(0);
    });
  });
});
