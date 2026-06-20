import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/api/src/app';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

vi.mock('../../apps/api/src/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

describe('Rules API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    const db = getTestDatabase();
    await db('campaigns').insert([{ id: 1, name: 'Main Campaign', expectedSessions: 1, config: '{}' }]);
    await db('missions').insert([{ id: 1, campaign_id: 1, title: 'Main Mission', config: '{}', missionDetails: '', map: '' }]);
    await db('army_rules').insert([{ id: 1, name: 'Main Army', description: 'desc', original_campaign_id: 1 }]);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/campaigns/:id/rules', () => {
    it('returns a 200 status and an empty array when no rules exist', async () => {
      const response = await request(app).get('/api/campaigns/1/rules');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/rules', () => {
    it('creates a new rule attached to a campaign and returns a 201 status', async () => {
      const newRule = {
        name: 'Campaign Rule',
        rule_category: 'test',
        description: 'desc',
        campaign_id: 1,
        metadata: null,
        parent_rule_id: null
      };

      const response = await request(app)
        .post('/api/rules')
        .send(newRule);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newRule.name);
      expect(response.body.campaign_id).toBe(1);
    });

    it('creates a new rule attached to a mission', async () => {
      const newRule = {
        name: 'Mission Rule',
        rule_category: 'test',
        description: 'desc',
        mission_id: 1
      };

      const response = await request(app)
        .post('/api/rules')
        .send(newRule);

      expect(response.status).toBe(201);
      expect(response.body.mission_id).toBe(1);
    });

    it('creates a new rule attached to an army rulebook', async () => {
      const newRule = {
        name: 'Army Rule',
        rule_category: 'test',
        description: 'desc',
        army_rule_id: 1
      };

      const response = await request(app)
        .post('/api/rules')
        .send(newRule);

      expect(response.status).toBe(201);
      expect(response.body.army_rule_id).toBe(1);
    });

    it('returns a 400 status if no associations are provided', async () => {
      const invalidRule = {
        name: 'Invalid Rule',
        rule_category: 'test',
        description: 'desc'
      };

      const response = await request(app)
        .post('/api/rules')
        .send(invalidRule);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    it('returns a 400 status if multiple associations are provided', async () => {
      const invalidRule = {
        name: 'Invalid Rule',
        rule_category: 'test',
        description: 'desc',
        campaign_id: 1,
        mission_id: 1
      };

      const response = await request(app)
        .post('/api/rules')
        .send(invalidRule);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/missions/:id/rules', () => {
    it('returns rules associated with a mission', async () => {
      const response = await request(app).get('/api/missions/1/rules');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Mission Rule');
    });
  });

  describe('GET /api/army-rulebooks/:id/rules', () => {
    it('returns rules associated with an army rulebook', async () => {
      const response = await request(app).get('/api/army-rulebooks/1/rules');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Army Rule');
    });
  });

  describe('PUT /api/rules/:id', () => {
    it('updates a rule and returns a 200 status', async () => {
      const updatedRule = {
        name: 'Updated Campaign Rule',
        rule_category: 'test-updated',
        description: 'updated desc'
      };

      const response = await request(app)
        .put('/api/rules/1') // Assuming ID 1 is 'Campaign Rule'
        .send(updatedRule);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe(updatedRule.name);
      expect(response.body.rule_category).toBe(updatedRule.rule_category);
    });

    it('returns a 404 status if rule not found', async () => {
      const updatedRule = {
        name: 'Ghost Rule',
        rule_category: 'test',
        description: 'desc'
      };

      const response = await request(app)
        .put('/api/rules/999')
        .send(updatedRule);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /api/rules/:id', () => {
    it('deletes a rule and returns a 200 status', async () => {
      const response = await request(app).delete('/api/rules/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });
});
