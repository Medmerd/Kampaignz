import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { setupTestDatabase, getTestDatabase, closeTestDatabase } from '../db-setup';

// Mock the database layer to use our test database, just like repository tests
vi.mock('../../apps/api/src/database', () => ({
  getDatabase: () => getTestDatabase(),
}));

import { app } from '../../apps/api/src/app';

describe('Campaigns API', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/campaigns', () => {
    it('returns a 200 status and an empty array when no campaigns exist', async () => {
      const response = await request(app).get('/api/campaigns');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/campaigns', () => {
    it('creates a new campaign and returns a 201 status', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .send({ name: 'Test Campaign' });
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Campaign');
      expect(response.body.expectedSessions).toBe(1); // default from schema
      expect(response.body.id).toBeDefined();
    });
  });

  describe('GET /api/campaigns/:id', () => {
    it('returns a 200 status and the campaign details', async () => {
      // First create a campaign
      const createRes = await request(app)
        .post('/api/campaigns')
        .send({ name: 'Specific Campaign' });
      
      const campaignId = createRes.body.id;

      // Then fetch it by ID
      const response = await request(app).get(`/api/campaigns/${campaignId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(campaignId);
      expect(response.body.name).toBe('Specific Campaign');
    });

    it('returns a 200 status and an empty object if the campaign does not exist', async () => {
      const response = await request(app).get('/api/campaigns/9999');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('PUT /api/campaigns/:id', () => {
    it('updates a campaign and returns a 200 status with the updated data', async () => {
      // Create campaign
      const createRes = await request(app)
        .post('/api/campaigns')
        .send({ name: 'Old Name' });
      
      const campaignId = createRes.body.id;

      // Update it
      const response = await request(app)
        .put(`/api/campaigns/${campaignId}`)
        .send({ name: 'New Name', expectedSessions: 10, config: '{"theme":"dark"}' });
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New Name');
      expect(response.body.expectedSessions).toBe(10);
      expect(response.body.config).toBe('{"theme":"dark"}');
    });
  });

  describe('Error Handling', () => {
    it('returns a 400 status when a repository validation error occurs', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .send({ name: '   ' }); // Empty string throws "Campaign name is required."
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campaign name is required.');
    });
  });
});
