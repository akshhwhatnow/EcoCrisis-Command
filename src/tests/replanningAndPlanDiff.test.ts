import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { replanningService } from '../../server/services/replanningService.js';
import { planDiffService } from '../../server/services/planDiffService.js';
import { solveDeterministicAllocation } from '../../src/services/optimizationEngine.js';
import { generateTradeoffAnalysis } from '../../src/services/riskImpactEngine.js';

describe('Phase 4: Dynamic Replanning & Plan Diff Engine', () => {
  const app = createApp();

  describe('1. Plan Diff Calculation Engine (planDiffService)', () => {
    it('computes structured itemized diff between T0 baseline and T1 target allocations', () => {
      const baseAssignments = [
        { resource_id: 'RES-VEH-A', incident_id: 'I-1', resource_name: 'Evacuation Vehicle A', incident_name: 'I-1 Hillside Village Community Evacuation' },
        { resource_id: 'RES-TEAM-B', incident_id: 'I-2', resource_name: 'Transport Team B', incident_name: 'I-2 Valley Dairy Farm & Livestock Emergency' },
        { resource_id: 'RES-TEAM-C', incident_id: 'I-3', resource_name: 'Rescue Team C', incident_name: 'I-3 Pine Ridge Wildlife Sanctuary Emergency' },
        { resource_id: 'RES-BOAT-1', incident_id: 'I-1', resource_name: 'Boat 1', incident_name: 'I-1 Hillside Village Community Evacuation' },
      ];

      const targetAssignments = [
        { resource_id: 'RES-TEAM-B', incident_id: 'I-4', resource_name: 'Transport Team B', incident_name: 'I-4 Cut-Off Settlement Evacuation', action: 'Reallocate' },
        { resource_id: 'RES-TEAM-C', incident_id: 'I-1', resource_name: 'Rescue Team C', incident_name: 'I-1 Hillside Village Community Evacuation', action: 'Reallocate' },
        { resource_id: 'RES-BOAT-1', incident_id: 'I-1', resource_name: 'Boat 1', incident_name: 'I-1 Hillside Village Community Evacuation', action: 'Assign' },
      ];

      const diff = planDiffService.computeDiff(baseAssignments, targetAssignments, {
        targetPlanId: 'PLAN-T1-REVISED',
        parentPlanId: 'PLAN-T0-BASE',
        unavailableResourceIds: ['RES-VEH-A'],
        delayedIncidents: [
          { id: 'I-2', name: 'Valley Dairy Farm', reason: '[AGENT-DERIVED / RECOMMENDATION] Agricultural response delayed temporarily based on simulated safe smoke buffer (3.5 hr [SIMULATED — DEMO DATA]); transport assets prioritized for life-safety evacuation [FROM GATEWAYS].' },
          { id: 'I-3', name: 'Pine Ridge Sanctuary', reason: '[AGENT-DERIVED / RECOMMENDATION] Wildlife ground containment team diverted to emergency community evacuation [FROM GATEWAYS]; recommend monitoring via aerial drone reconnaissance [RECOMMENDATION].' },
        ],
      });


      expect(diff.planId).toBe('PLAN-T1-REVISED');
      expect(diff.parentPlanId).toBe('PLAN-T0-BASE');
      expect(diff.reallocatedCount).toBe(2);
      expect(diff.removedCount).toBe(1);
      expect(diff.delayedCount).toBe(2);
      expect(diff.preservedCount).toBe(1);
      expect(diff.totalChanges).toBe(5); // 2 reallocated + 1 removed + 2 delayed

      // Check specific itemized diffs
      const removedVehA = diff.items.find((i) => i.resource_id === 'RES-VEH-A');
      expect(removedVehA).toBeDefined();
      expect(removedVehA?.change_type).toBe('removed');
      expect(removedVehA?.previous_assignment).toContain('I-1');

      const reallocatedTeamB = diff.items.find((i) => i.resource_id === 'RES-TEAM-B');
      expect(reallocatedTeamB).toBeDefined();
      expect(reallocatedTeamB?.change_type).toBe('reallocated');
      expect(reallocatedTeamB?.new_assignment).toContain('I-4');
      expect(reallocatedTeamB?.reason).toContain('Transport Team B');

      const reallocatedTeamC = diff.items.find((i) => i.resource_id === 'RES-TEAM-C');
      expect(reallocatedTeamC).toBeDefined();
      expect(reallocatedTeamC?.change_type).toBe('reallocated');
      expect(reallocatedTeamC?.new_assignment).toContain('I-1');

      const preservedBoat = diff.items.find((i) => i.resource_id === 'RES-BOAT-1');
      expect(preservedBoat).toBeDefined();
      expect(preservedBoat?.change_type).toBe('preserved');
    });
  });

  describe('2. Scenario T1 Disruption & Replanning Service (replanningService)', () => {
    it('executes full replanning workflow on T1 disruption and returns structured plan with human approval gate', async () => {
      const result = await replanningService.triggerT1Scenario('TEST-CORR-T1');

      expect(result.sourceScenario).toBe('T1');


      expect(result.plan.id).toBe('PLAN-T1-REVISED');
      expect(result.plan.version).toBe(2);
      expect(result.plan.status).toBe('Pending Approval');
      expect(result.requiresHumanApproval).toBe(true);
      expect(result.plan.metadata.requiresHumanApproval).toBe(true);
      expect(result.plan.metadata.parentPlanId).toBe('PLAN-T0-BASE');

      // Check diff items
      expect(result.diff.items.length).toBeGreaterThanOrEqual(4);
      expect(result.diff.reallocatedCount).toBeGreaterThanOrEqual(2);

      // Check trade-offs
      expect(result.tradeoffs.length).toBeGreaterThanOrEqual(2);
      expect(result.tradeoffs[0].ethicalRuleJustification).toBeDefined();

      // Check affected incidents structure
      expect(result.affectedIncidents.directlyAffected).toContain('I-4');
      expect(result.affectedIncidents.reallocated).toContain('RES-TEAM-B');
      expect(result.affectedIncidents.reallocated).toContain('RES-TEAM-C');
      expect(result.affectedIncidents.preserved).toContain('RES-BOAT-1');

      // Check agent pipeline results exist
      expect(result.agentResults['INCIDENT_ASSESSMENT']).toBeDefined();
      expect(result.agentResults['VERIFICATION_CONFIDENCE']).toBeDefined();
      expect(result.agentResults['COMMAND_PLANNING']).toBeDefined();
    });

    it('handles repeated T1 triggers idempotently without corrupted state', async () => {
      const run1 = await replanningService.triggerT1Scenario('TEST-CORR-IDEMPOTENT-1');
      const run2 = await replanningService.triggerT1Scenario('TEST-CORR-IDEMPOTENT-2');

      expect(run1.plan.id).toBe('PLAN-T1-REVISED');
      expect(run2.plan.id).toBe('PLAN-T1-REVISED');
      expect(run1.diff.totalChanges).toBe(run2.diff.totalChanges);
      expect(run1.plan.status).toBe('Pending Approval');
      expect(run2.plan.status).toBe('Pending Approval');
    });
  });

  describe('3. REST API Endpoints for Scenario & Replanning', () => {
    it('POST /api/v1/scenario/t1 triggers T1 scenario and returns complete replanning data', async () => {
      const res = await request(app)
        .post('/api/v1/scenario/t1')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.plan.id).toBe('PLAN-T1-REVISED');
      expect(res.body.data.plan.status).toBe('Pending Approval');
      expect(res.body.data.requiresHumanApproval).toBe(true);
      expect(res.body.meta.scenario).toBe('T1');
      expect(res.body.meta.requiresHumanApproval).toBe(true);
      expect(res.body.data.diff.items.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/scenario/state returns operational state reflecting active incidents and resources', async () => {
      const res = await request(app)
        .get('/api/v1/scenario/state')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.currentPhase).toBeDefined();
      expect(res.body.data.activeIncidentsCount).toBeGreaterThanOrEqual(3);
    });

    it('POST /api/v1/replanning/run triggers dynamic replanning on demand', async () => {
      const res = await request(app)
        .post('/api/v1/replanning/run')
        .expect(200);

      expect(res.body.data.plan.id).toBe('PLAN-T1-REVISED');
      expect(res.body.data.requiresHumanApproval).toBe(true);
      expect(res.body.meta.requiresHumanApproval).toBe(true);
    });

    it('GET /api/v1/plans/:id/diff returns computed plan diff for PLAN-T1-REVISED', async () => {
      const res = await request(app)
        .get('/api/v1/plans/PLAN-T1-REVISED/diff')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.planId).toBe('PLAN-T1-REVISED');
      expect(res.body.data.parentPlanId).toBe('PLAN-T0-BASE');
      expect(res.body.data.items).toBeInstanceOf(Array);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/replanning/diff/:planId returns plan diff via replanning router', async () => {
      const res = await request(app)
        .get('/api/v1/replanning/diff/PLAN-T1-REVISED')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.planId).toBe('PLAN-T1-REVISED');
    });
  });
});
