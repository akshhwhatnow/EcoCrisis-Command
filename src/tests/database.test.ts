import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { incidentRepository } from '../../server/db/repositories/incidentRepository.js';
import { resourceRepository } from '../../server/db/repositories/resourceRepository.js';
import { planRepository } from '../../server/db/repositories/planRepository.js';
import { auditRepository } from '../../server/db/repositories/auditRepository.js';
import { checkConnection, checkPostGIS } from '../../server/db/pool.js';

describe('Phase 1: Database Schema & PostGIS DDL Integrity', () => {
  const schemaPath = path.resolve(process.cwd(), 'server/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  it('declares PostGIS extension setup with standard spatial SRID', () => {
    expect(schemaSql).toContain('CREATE EXTENSION IF NOT EXISTS postgis;');
    expect(schemaSql).toContain('geometry(Point, 4326)');
  });

  it('contains all mandatory tables from the GATEWAYS architecture and proposed schema', () => {
    const requiredTables = [
      'CREATE TABLE incidents',
      'CREATE TABLE incident_events',
      'CREATE TABLE resources',
      'CREATE TABLE plans',
      'CREATE TABLE plan_assignments',
      'CREATE TABLE plan_changes',
      'CREATE TABLE resource_assignments',
      'CREATE TABLE agent_runs',
      'CREATE TABLE agent_findings',
      'CREATE TABLE approval_decisions',
      'CREATE TABLE audit_events',
      'CREATE TABLE spatial_layers',
    ];

    for (const tableDdl of requiredTables) {
      expect(schemaSql).toContain(tableDdl);
    }
  });

  it('defines GiST spatial indexes for geometry columns', () => {
    expect(schemaSql).toContain('CREATE INDEX idx_incidents_location_geom ON incidents USING GIST(location_geom);');
    expect(schemaSql).toContain('CREATE INDEX idx_incidents_perimeter_geom ON incidents USING GIST(perimeter_geom);');
    expect(schemaSql).toContain('CREATE INDEX idx_resources_location_geom ON resources USING GIST(location_geom);');
    expect(schemaSql).toContain('CREATE INDEX idx_spatial_layers_geom ON spatial_layers USING GIST(geom);');
  });

  it('enforces relational integrity and unique constraints', () => {
    expect(schemaSql).toContain('UNIQUE(plan_id, resource_id)');
    expect(schemaSql).toContain('REFERENCES plans(id) ON DELETE CASCADE');
    expect(schemaSql).toContain('REFERENCES resources(id) ON DELETE RESTRICT');
    expect(schemaSql).toContain('REFERENCES incidents(id) ON DELETE RESTRICT');
  });
});

describe('Phase 1: Repository Layer Contract Verification', () => {
  it('exposes incidentRepository with spatial query methods', () => {
    expect(incidentRepository).toBeDefined();
    expect(typeof incidentRepository.findAllActive).toBe('function');
    expect(typeof incidentRepository.findById).toBe('function');
    expect(typeof incidentRepository.findWithinRadius).toBe('function');
    expect(typeof incidentRepository.upsert).toBe('function');
  });

  it('exposes resourceRepository with status and nearest methods', () => {
    expect(resourceRepository).toBeDefined();
    expect(typeof resourceRepository.findAll).toBe('function');
    expect(typeof resourceRepository.findAvailable).toBe('function');
    expect(typeof resourceRepository.findById).toBe('function');
    expect(typeof resourceRepository.findNearestTo).toBe('function');
    expect(typeof resourceRepository.updateStatus).toBe('function');
  });

  it('exposes planRepository with atomic transaction methods', () => {
    expect(planRepository).toBeDefined();
    expect(typeof planRepository.findActivePlan).toBe('function');
    expect(typeof planRepository.createPlanWithAssignments).toBe('function');
  });

  it('exposes auditRepository with append and query methods', () => {
    expect(auditRepository).toBeDefined();
    expect(typeof auditRepository.logEvent).toBe('function');
    expect(typeof auditRepository.findRecent).toBe('function');
    expect(typeof auditRepository.findByCorrelationId).toBe('function');
  });
});

describe('Phase 1: T0 Baseline Scenario Seed Integrity', () => {
  const seedPath = path.resolve(process.cwd(), 'server/db/seed.ts');
  const seedCode = fs.readFileSync(seedPath, 'utf8');

  it('contains the authoritative T0 incidents (I-1, I-2, I-3)', () => {
    expect(seedCode).toContain("'I-1'");
    expect(seedCode).toContain("'Community Evacuation'");
    expect(seedCode).toContain("'I-2'");
    expect(seedCode).toContain("'Farm and Livestock Emergency'");
    expect(seedCode).toContain("'I-3'");
    expect(seedCode).toContain("'Wildlife Habitat Emergency'");
  });

  it('contains the authoritative initial resource allocations for T0', () => {
    expect(seedCode).toContain("'RES-VEH-A'");
    expect(seedCode).toContain("'RES-TEAM-B'");
    expect(seedCode).toContain("'RES-TEAM-C'");
    expect(seedCode).toContain("'RES-BOAT-1'");

    // Vehicle A -> I-1, Transport Team B -> I-2, Rescue Team C -> I-3, Boat 1 -> I-1
    expect(seedCode).toContain("resourceId: 'RES-VEH-A'");
    expect(seedCode).toContain("incidentId: 'I-1'");
    expect(seedCode).toContain("resourceId: 'RES-TEAM-B'");
    expect(seedCode).toContain("incidentId: 'I-2'");
    expect(seedCode).toContain("resourceId: 'RES-TEAM-C'");
    expect(seedCode).toContain("incidentId: 'I-3'");
    expect(seedCode).toContain("resourceId: 'RES-BOAT-1'");
  });

  it('does NOT pre-seed T1 as the initial active database state', () => {
    // T1 scenario is dynamically triggered later; initial database state must be T0
    expect(seedCode).toContain("'PLAN-T0-BASE'");
    expect(seedCode).not.toContain("'PLAN-T1-REVISED'");
  });
});

describe('Phase 1: Live Database Environment Check (Conditional)', () => {
  it('checks PostgreSQL connection status gracefully', async () => {
    const status = await checkConnection();
    if (status.connected) {
      console.log(`[TEST LIVE PG]: PostgreSQL is connected (${status.version})`);
      const postgis = await checkPostGIS();
      console.log(`[TEST LIVE PG]: PostGIS available = ${postgis.postgisAvailable}`);
    } else {
      console.log(`[TEST OFFLINE]: Standalone mode, PostgreSQL connection refused (${status.error})`);
    }
    expect(typeof status.connected).toBe('boolean');
  });
});
