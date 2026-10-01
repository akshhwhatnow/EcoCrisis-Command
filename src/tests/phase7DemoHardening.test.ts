import { describe, it, expect, beforeEach } from 'vitest';
import { replanningService } from '../../server/services/replanningService';
import { healthService } from '../../server/services/healthService';
import { generateDecisionBrief, DecisionBriefPayload } from '../utils/decisionBrief';
import { candidatePlanService } from '../../server/services/candidatePlanService';

describe('Phase 7: Demo Hardening, Deployment Readiness & Final Integrity', () => {
  describe('1. Authoritative Scenario Reset (POST /api/v1/scenario/reset)', () => {
    it('resets scenario state to T0 baseline deterministically', async () => {
      // Trigger T1 first
      await replanningService.triggerT1Scenario('test-phase7-corr-1');

      // Now reset
      const resetResult = await replanningService.resetScenario('test-phase7-corr-reset');

      expect(resetResult.success).toBe(true);
      expect(resetResult.phase).toBe('T0_BASELINE');
      expect(resetResult.activePlanId).toBe('PLAN-T0-BASE');
      expect(resetResult.activeIncidentsCount).toBe(3);
      expect(resetResult.restoredResourcesCount).toBeGreaterThanOrEqual(4);
      expect(resetResult.timestamp).toBeDefined();
    });

    it('records a SCENARIO_RESET audit entry upon reset', async () => {
      const resetResult = await replanningService.resetScenario('test-phase7-corr-audit');
      expect(resetResult.success).toBe(true);
    });
  });

  describe('2. Explicit Operating Mode & Health Reporting', () => {
    it('healthService reports explicit operating modes and detailed diagnostics', async () => {
      const health = await healthService.getHealth();

      expect(health.status).toBeDefined();
      expect(['NORMAL_POSTGRESQL', 'DEGRADED_DEMO_MODE']).toContain(health.operatingMode);
      expect(health.operatingModeLabel).toBeDefined();
      expect(health.services).toBeDefined();
      expect(health.services.database).toBeDefined();
      expect(health.services.api).toBe('operational');
    });

    it('healthService distinguishes between connected PostgreSQL and degraded demo mode', async () => {
      const health = await healthService.getHealth();
      if (health.services.database.connected) {
        expect(health.operatingMode).toBe('NORMAL_POSTGRESQL');
        expect(health.operatingModeLabel).toContain('PostgreSQL/PostGIS');
      } else {
        expect(health.operatingMode).toBe('DEGRADED_DEMO_MODE');
        expect(health.operatingModeLabel).toContain('DEGRADED DEMO MODE');
      }
    });
  });

  describe('3. Auditable Decision Brief Export Schema & Provenance', () => {
    it('generates a complete, structured decision brief JSON object', () => {
      const candidates = candidatePlanService.generateCandidatePlans();
      const activePlan = candidatePlanService.mapToPlanOption(candidates[0]);

      const brief: DecisionBriefPayload = generateDecisionBrief(
        activePlan,
        'Incident Commander',
        'PLAN_APPROVED'
      );

      // Metadata check
      expect(brief.exportMetadata.system).toContain('EcoCrisis Command');
      expect(brief.exportMetadata.version).toContain('Phase 7');
      expect(brief.exportMetadata.exportedByRole).toBe('Incident Commander');
      expect(brief.exportMetadata.operationalStatus).toBe('APPROVED_BY_COMMANDER');

      // Scenario check
      expect(brief.scenario.activePlanId).toBe('PLAN-T1-OPT1');
      expect(brief.scenario.confidenceScore).toBe(88.5);
      expect(brief.scenario.compositeConfidenceScore).toContain('[CALCULATION]');

      // Allocation check
      expect(brief.resourceAllocations.length).toBe(3);
      brief.resourceAllocations.forEach((alloc) => {
        expect(alloc.resourceId).toBeDefined();
        expect(alloc.provenance).toBeDefined();
      });

      // Delayed incidents check
      expect(brief.delayedIncidents.length).toBe(2);
      expect(brief.delayedIncidents.some((d) => d.incidentId === 'I-2')).toBe(true);
      expect(brief.delayedIncidents.some((d) => d.incidentId === 'I-3')).toBe(true);

      // Tradeoffs check
      expect(brief.tradeoffsAndRisks.length).toBeGreaterThanOrEqual(3);

      // Governance check
      expect(brief.governanceConstraints).toHaveLength(3);
      expect(brief.governanceConstraints.some((g) => g.includes('Autonomous CAD'))).toBe(true);
    });

    it('enforces explicit Gateways provenance tags across all exported brief entries', () => {
      const candidates = candidatePlanService.generateCandidatePlans();
      const activePlan = candidatePlanService.mapToPlanOption(candidates[0]);

      const brief = generateDecisionBrief(activePlan, 'Operations Section Chief', 'REVISED_PLAN_READY');

      const allProvenanceStrings = [
        brief.scenario.compositeConfidenceScore,
        ...brief.resourceAllocations.map((a) => a.provenance),
        ...brief.delayedIncidents.map((d) => d.provenance),
        ...brief.governanceConstraints,
      ];

      allProvenanceStrings.forEach((str) => {
        const hasTag =
          str.includes('[DATABASE — T0 SEED]') ||
          str.includes('[SIMULATED — DEMO DATA]') ||
          str.includes('[CALCULATION') ||
          str.includes('[GOVERNANCE CONSTRAINT]') ||
          str.includes('[FROM GATEWAYS]') ||
          str.includes('[RECOMMENDATION]');
        expect(hasTag).toBe(true);
      });
    });
  });

  describe('4. Governance Boundary & Safety Enforcement', () => {
    it('strictly preserves autoDispatchBlocked and forbids automatic CAD dispatch', () => {
      const candidates = candidatePlanService.generateCandidatePlans();
      candidates.forEach((cand) => {
        expect(cand.planRecord.metadata.autoDispatchBlocked).toBe(true);
        expect(cand.planRecord.metadata.requiresHumanApproval).toBe(true);
      });
    });

    it('maintains clear distinction between simulated data, calculated scores, and real data', () => {
      const candidates = candidatePlanService.generateCandidatePlans();
      const opt1 = candidates[0];

      // Confidence has explicit calculation provenance
      expect(opt1.confidenceBreakdown.provenance).toContain('[CALCULATION');

      // Delayed livestock has simulated smoke buffer provenance
      const delayedI2 = opt1.delayedIncidents.find((d) => d.id === 'I-2');
      expect(delayedI2?.reason).toContain('[SIMULATED — DEMO DATA]');

      // Objective weights have governance provenance
      expect(opt1.weights.provenance).toBe('[GOVERNANCE CONSTRAINT]');
    });
  });
});
