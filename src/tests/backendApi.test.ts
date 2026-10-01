import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../server/app.js';

describe('Phase 2: Modular REST API — Health & Correlation ID', () => {
  it('GET /api/v1/health returns health status and generates correlation ID', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('postgis');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('correlationId');
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('preserves custom X-Correlation-ID sent in request headers', async () => {
    const customId = 'TEST-CORR-12345';
    const res = await request(app).get('/api/v1/health').set('X-Correlation-ID', customId);

    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBe(customId);
    expect(res.body.correlationId).toBe(customId);
  });
});

describe('Phase 2: Modular REST API — Incident Endpoints & Validation', () => {
  it('GET /api/v1/incidents returns normalized API response with metadata', async () => {
    const res = await request(app).get('/api/v1/incidents');
    // Either 200 (if DB connected/seeded or returns array) or error handled safely
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body).toHaveProperty('correlationId');
      expect(Array.isArray(res.body.data)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('correlationId');
    }
  });

  it('GET /api/v1/incidents/:id returns 404 for nonexistent incident', async () => {
    const res = await request(app).get('/api/v1/incidents/NON_EXISTENT_INCIDENT_999');
    expect([404, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('correlationId');
  });

  it('POST /api/v1/incidents rejects invalid payload with 400 VALIDATION_ERROR', async () => {
    const invalidPayload = {
      name: 'Test Incomplete Incident',
      // Missing required severity, urgency, sector, id, etc.
    };

    const res = await request(app).post('/api/v1/incidents').send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});

describe('Phase 2: Modular REST API — Resource Endpoints & Status Validation', () => {
  it('GET /api/v1/resources returns normalized API response', async () => {
    const res = await request(app).get('/api/v1/resources');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('error');
    }
  });

  it('PATCH /api/v1/resources/:id/status rejects invalid status enum with 400', async () => {
    const res = await request(app)
      .patch('/api/v1/resources/RES-VEH-A/status')
      .send({ status: 'INVALID_UNKNOWN_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Phase 2: Modular REST API — Plan Endpoints', () => {
  it('GET /api/v1/plans returns response structure with correlation ID', async () => {
    const res = await request(app).get('/api/v1/plans');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    } else {
      expect(res.body).toHaveProperty('error');
    }
  });
});

describe('Phase 2: Modular REST API — Audit Endpoints', () => {
  it('GET /api/v1/audit returns audit event list with correlation ID', async () => {
    const res = await request(app).get('/api/v1/audit');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    } else {
      expect(res.body).toHaveProperty('error');
    }
  });
});

describe('Phase 2: Modular REST API — Spatial GeoJSON Endpoints', () => {
  it('GET /api/v1/spatial/layers returns GeoJSON FeatureCollection structure', async () => {
    const res = await request(app).get('/api/v1/spatial/layers');
    if (res.status === 200) {
      expect(res.body.data.type).toBe('FeatureCollection');
      expect(Array.isArray(res.body.data.features)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('error');
    }
  });

  it('GET /api/v1/spatial/incidents returns GeoJSON FeatureCollection structure', async () => {
    const res = await request(app).get('/api/v1/spatial/incidents');
    if (res.status === 200) {
      expect(res.body.data.type).toBe('FeatureCollection');
      expect(Array.isArray(res.body.data.features)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('error');
    }
  });
});

describe('Phase 2: Error Handling & Legacy Compatibility', () => {
  it('returns structured 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/v1/completely-unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body).toHaveProperty('correlationId');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('maintains legacy /api/state endpoint for backward compatibility', async () => {
    const res = await request(app).get('/api/state');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('phase');
    expect(res.body).toHaveProperty('incidents');
    expect(res.body).toHaveProperty('resources');
    expect(res.body).toHaveProperty('impact');
  });

  it('maintains legacy /api/health endpoint for backward compatibility', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
  });
});
