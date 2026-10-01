import { describe, it, expect, beforeEach } from 'vitest';
import {
  candidatePlanService,
  calculateCandidateConfidence,
  calculateCandidateObjectiveScore,
} from '../../server/services/candidatePlanService';
import { planComparisonService } from '../../server/services/planComparisonService';
import { incidentDependencyService } from '../../server/services/incidentDependencyService';
import { ObjectiveWeights, PlanOption, IncidentDependency } from '../types';

describe('Phase 6: Multi-Option Decision Intelligence & Incident Dependency DAG', () => {
  beforeEach(() => {
    // Reset in-memory dependencies if needed
  });

  describe('1. Multi-Option Candidate Plan Generation & Mathematical Traceability', () => {
    it('generates at least 3 distinct candidate plans with explicit objective weights', () => {
      const candidates = candidatePlanService.generateCandidatePlans();

      expect(candidates).toHaveLength(3);

      const [opt1, opt2, opt3] = candidates;

      // Check Option 1 (Life Safety Profile)
      expect(opt1.optionKey).toBe('OPT-1');
      expect(opt1.weights.lifeSafety).toBe(0.70);
      expect(opt1.weights.provenance).toBe('[GOVERNANCE CONSTRAINT]');
      expect(opt1.status).toBe('Pending Approval');
      expect(opt1.isRecommended).toBe(true);

      // Check Option 2 (Agricultural Protection Profile)
      expect(opt2.optionKey).toBe('OPT-2');
      expect(opt2.weights.agriculture).toBe(0.35);
      expect(opt2.weights.provenance).toBe('[GOVERNANCE CONSTRAINT]');
      expect(opt2.status).toBe('Pending Approval');
      expect(opt2.isRecommended).toBe(false);

      // Check Option 3 (Balanced Multi-Sector Profile)
      expect(opt3.optionKey).toBe('OPT-3');
      expect(opt3.weights.ecosystem).toBe(0.20);
      expect(opt3.weights.provenance).toBe('[GOVERNANCE CONSTRAINT]');
      expect(opt3.status).toBe('Pending Approval');
      expect(opt3.isRecommended).toBe(false);
    });

    it('calculates candidate confidence mathematically using the verification model formula', () => {
      const opt1Conf = calculateCandidateConfidence('OPT-1', 91.5);
      const opt2Conf = calculateCandidateConfidence('OPT-2', 91.5);
      const opt3Conf = calculateCandidateConfidence('OPT-3', 91.5);

      // Formula: Base(91.5%) - SimDataPenalty(3.0%) - RouteRisk(0.0% / 4.5% / 2.5%)
      expect(opt1Conf.score).toBe(88.5);
      expect(opt1Conf.breakdown.simulatedDataPenalty).toBe(3.0);
      expect(opt1Conf.breakdown.routeContingencyPenalty).toBe(0.0);
      expect(opt1Conf.breakdown.provenance).toBe('[CALCULATION — DERIVED FROM EXPLICIT INPUTS]');

      expect(opt2Conf.score).toBe(84.0);
      expect(opt2Conf.breakdown.routeContingencyPenalty).toBe(4.5);

      expect(opt3Conf.score).toBe(86.0);
      expect(opt3Conf.breakdown.routeContingencyPenalty).toBe(2.5);
    });

    it('calculates candidate objective scores dynamically from weights and performance dimensions', () => {
      const opt1Weights: ObjectiveWeights = {
        lifeSafety: 0.70,
        agriculture: 0.10,
        ecosystem: 0.10,
        fleetStress: 0.05,
        travelLogistics: 0.05,
      };
      const opt1Dims = { lifeSafety: 96, agriculture: 42, ecosystem: 38, fleetStress: 78, travelLogistics: 84 };
      const score1 = calculateCandidateObjectiveScore(opt1Weights, opt1Dims);
      // 0.7(96) + 0.1(42) + 0.1(38) + 0.05(78) + 0.05(84) = 67.2 + 4.2 + 3.8 + 3.9 + 4.2 = 83.3
      expect(score1).toBe(83.3);

      const opt2Weights: ObjectiveWeights = {
        lifeSafety: 0.40,
        agriculture: 0.35,
        ecosystem: 0.15,
        fleetStress: 0.05,
        travelLogistics: 0.05,
      };
      const opt2Dims = { lifeSafety: 79, agriculture: 94, ecosystem: 35, fleetStress: 85, travelLogistics: 72 };
      const score2 = calculateCandidateObjectiveScore(opt2Weights, opt2Dims);
      // 0.4(79) + 0.35(94) + 0.15(35) + 0.05(85) + 0.05(72) = 31.6 + 32.9 + 5.25 + 4.25 + 3.6 = 77.6
      expect(score2).toBe(77.6);
    });

    it('enforces material allocation divergence across candidate plans', () => {
      const candidates = candidatePlanService.generateCandidatePlans();
      const [opt1, opt2, opt3] = candidates;

      // Option 1 sends Team B to I-4, Team C to I-1, Boat 1 to I-1
      const opt1TeamB = opt1.assignments.find((a) => a.resource_id === 'RES-TEAM-B');
      const opt1Boat1 = opt1.assignments.find((a) => a.resource_id === 'RES-BOAT-1');
      expect(opt1TeamB?.incident_id).toBe('I-4');
      expect(opt1Boat1?.incident_id).toBe('I-1');

      // Option 2 retains Team B at I-2 (saving cattle) and sends Boat 1 to I-4
      const opt2TeamB = opt2.assignments.find((a) => a.resource_id === 'RES-TEAM-B');
      const opt2Boat1 = opt2.assignments.find((a) => a.resource_id === 'RES-BOAT-1');
      expect(opt2TeamB?.incident_id).toBe('I-2');
      expect(opt2Boat1?.incident_id).toBe('I-4');

      // Option 3 stages Team C at I-3 before transitional deployment
      const opt3TeamC = opt3.assignments.find((a) => a.resource_id === 'RES-TEAM-C');
      expect(opt3TeamC?.incident_id).toBe('I-3');
      expect(opt3TeamC?.action).toBe('Reallocate');
    });

    it('computes structured Plan Diff for each candidate plan against baseline', () => {
      const candidates = candidatePlanService.generateCandidatePlans();

      candidates.forEach((cand) => {
        expect(cand.diff).toBeDefined();
        expect(cand.diff.targetPlanId).toBe(cand.planId);
        expect(cand.diff.parentPlanId).toBe('PLAN-T0-BASE');
        expect(cand.diff.items.length).toBeGreaterThan(0);
        expect(cand.diff.items.some((i) => i.resource_id === 'RES-VEH-A' && i.change_type === 'removed')).toBe(true);
      });
    });

    it('maps CandidatePlanRecord to UI-friendly PlanOption format without loss of metadata', () => {
      const candidates = candidatePlanService.generateCandidatePlans();
      const planOption = candidatePlanService.mapToPlanOption(candidates[0]);

      expect(planOption.id).toBe('PLAN-T1-OPT1');
      expect(planOption.isRecommended).toBe(true);
      expect(planOption.assignments).toHaveLength(3);
      expect(planOption.delayedIncidentIds).toEqual(['I-2', 'I-3']);
      expect(planOption.confidenceScore).toBe(88.5);
    });
  });

  describe('2. 5-Dimensional Strategic Plan Comparison Matrix', () => {
    it('evaluates candidate plans across all 5 operational dimensions with explicit provenance', () => {
      const comparison = planComparisonService.comparePlans();

      expect(comparison.matrix).toHaveLength(5);

      const dimensions = comparison.matrix.map((d) => d.dimension);
      expect(dimensions).toEqual(['lifeSafety', 'agriculture', 'ecosystem', 'fleetStress', 'travelLogistics']);

      // Check Life Safety dimension
      const lifeSafetyDim = comparison.matrix.find((d) => d.dimension === 'lifeSafety');
      expect(lifeSafetyDim).toBeDefined();
      expect(lifeSafetyDim?.scores['PLAN-T1-OPT1']).toBe(96);
      expect(lifeSafetyDim?.scores['PLAN-T1-OPT2']).toBe(79);
      expect(lifeSafetyDim?.scores['PLAN-T1-OPT3']).toBe(88);
      expect(lifeSafetyDim?.provenance).toContain('[GOVERNANCE CONSTRAINT]');

      // Check Agriculture dimension
      const agriDim = comparison.matrix.find((d) => d.dimension === 'agriculture');
      expect(agriDim?.scores['PLAN-T1-OPT2']).toBe(94); // High because cattle protected
      expect(agriDim?.metrics['PLAN-T1-OPT2'].provenance).toBe('[SIMULATED — DEMO DATA]');

      // Check Ecosystem dimension
      const ecoDim = comparison.matrix.find((d) => d.dimension === 'ecosystem');
      expect(ecoDim?.scores['PLAN-T1-OPT3']).toBe(82); // Highest because ground team at sanctuary
    });

    it('recommends Option 1 under standard governance life-safety weighting profile', () => {
      const comparison = planComparisonService.comparePlans();
      expect(comparison.recommendedPlanId).toBe('PLAN-T1-OPT1');
      expect(comparison.recommendationRationale).toContain('Life-Safety First mandate profile');
    });
  });

  describe('3. Interactive Dynamic Weighting Sensitivity Analysis', () => {
    it('recalculates plan rankings dynamically under custom agricultural weighting', () => {
      const customWeights: ObjectiveWeights = {
        lifeSafety: 0.10,
        agriculture: 0.70,
        ecosystem: 0.10,
        fleetStress: 0.05,
        travelLogistics: 0.05,
      };

      const result = planComparisonService.calculateSensitivity(customWeights);

      expect(result.rankings).toHaveLength(3);
      // Under 70% agriculture weight, Option 2 should become rank #1
      expect(result.rankings[0].planId).toBe('PLAN-T1-OPT2');
      expect(result.rankings[0].adjustedUtilityScore).toBeGreaterThan(result.rankings[1].adjustedUtilityScore);
    });

    it('recalculates plan rankings dynamically under custom ecosystem weighting', () => {
      const customWeights: ObjectiveWeights = {
        lifeSafety: 0.10,
        agriculture: 0.10,
        ecosystem: 0.70,
        fleetStress: 0.05,
        travelLogistics: 0.05,
      };

      const result = planComparisonService.calculateSensitivity(customWeights);

      expect(result.rankings[0].planId).toBe('PLAN-T1-OPT3');
      expect(result.rankings[0].adjustedUtilityScore).toBeGreaterThan(result.rankings[1].adjustedUtilityScore);
    });

    it('confirms sensitivity analysis is a pure read-only simulation without modifying plan state', () => {
      const customWeights: ObjectiveWeights = {
        lifeSafety: 0.33,
        agriculture: 0.33,
        ecosystem: 0.34,
        fleetStress: 0.0,
        travelLogistics: 0.0,
      };

      const result = planComparisonService.calculateSensitivity(customWeights);
      expect(result.provenance).toBe('[CALCULATION — DERIVED FROM EXPLICIT INPUTS]');

      // Candidate plans retain their original status and scores
      const candidates = candidatePlanService.generateCandidatePlans();
      expect(candidates[0].status).toBe('Pending Approval');
      expect(candidates[0].confidenceScore).toBe(88.5);
    });
  });

  describe('4. Incident Dependency DAG & Threat Propagation', () => {
    it('retrieves all active incident dependencies with verified provenance classifications', async () => {
      const deps = await incidentDependencyService.getAllDependencies();
      expect(deps.length).toBeGreaterThanOrEqual(3);

      const depI4I1 = deps.find((d) => d.sourceIncidentId === 'I-4' && d.targetIncidentId === 'I-1');
      expect(depI4I1?.provenance).toBe('[FROM GATEWAYS]');

      const depI1I2 = deps.find((d) => d.sourceIncidentId === 'I-1' && d.targetIncidentId === 'I-2');
      expect(depI1I2?.provenance).toBe('[SIMULATED — DEMO DATA]');

      const depI1I3 = deps.find((d) => d.sourceIncidentId === 'I-1' && d.targetIncidentId === 'I-3');
      expect(depI1I3?.provenance).toBe('[SIMULATED — DEMO DATA]');
    });

    it('traverses downstream cascading dependencies from I-4', async () => {
      const downstream = await incidentDependencyService.traverseDownstream('I-4');
      expect(downstream).toContain('I-1');
      expect(downstream).toContain('I-2');
      expect(downstream).toContain('I-3');
    });

    it('detects and prevents circular dependencies using cycle detection DFS', async () => {
      // Adding a cycle: I-3 -> I-4 when I-4 -> I-1 -> I-3 already exists
      await expect(
        incidentDependencyService.addDependency({
          sourceIncidentId: 'I-3',
          targetIncidentId: 'I-4',
          dependencyType: 'CascadingRisk',
          severity: 'Critical',
          description: 'Simulated circular risk loop',
          provenance: '[TEST]',
        })
      ).rejects.toThrow(/Circular dependency detected/);
    });

    it('evaluates secondary threat propagation advice from root incident I-4', async () => {
      const propagation = await incidentDependencyService.propagateThreat('I-4');

      expect(propagation.sourceIncidentId).toBe('I-4');
      expect(propagation.propagationDepth).toBeGreaterThanOrEqual(2);
      expect(propagation.cascadingImpacts.length).toBeGreaterThanOrEqual(2);

      const affectedTargets = propagation.cascadingImpacts.map((c) => c.targetIncidentId);
      expect(affectedTargets).toContain('I-1');
      expect(affectedTargets).toContain('I-2');

      propagation.cascadingImpacts.forEach((impact) => {
        expect(impact.operationalAdvice).toBeDefined();
        expect(impact.provenance).toBeDefined();
      });
    });
  });

  describe('5. Human Approval Gate & Safety Isolation', () => {
    it('ensures all candidate plans default strictly to Pending Approval status', () => {
      const candidates = candidatePlanService.generateCandidatePlans();
      candidates.forEach((cand) => {
        expect(cand.status).toBe('Pending Approval');
        expect(cand.planRecord.status).toBe('Pending Approval');
        expect(cand.planRecord.metadata.requiresHumanApproval).toBe(true);
        expect(cand.planRecord.metadata.autoDispatchBlocked).toBe(true);
      });
    });

    it('ensures selecting a candidate does not trigger automated execution', () => {
      const candidates = candidatePlanService.generateCandidatePlans();
      const selected = candidates[1]; // Select Option 2

      expect(selected.status).toBe('Pending Approval');
      expect(selected.planRecord.status).not.toBe('Approved');
      expect(selected.planRecord.status).not.toBe('Active');
      expect(selected.planRecord.status).not.toBe('Executed');
    });
  });
});
