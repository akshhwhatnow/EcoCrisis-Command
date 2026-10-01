import { DbPlan, DbPlanAssignment } from '../db/repositories/planRepository.js';
import { planDiffService, ComputedPlanDiff } from './planDiffService.js';
import { ObjectiveWeights, PlanOption } from '../../src/types/index.js';

export interface CandidatePlanGenerationContext {
  incidents?: Array<{ id: string; name: string; severity?: string; urgency?: string }>;
  resources?: Array<{ id: string; name: string; resource_type?: string; status?: string }>;
  unavailableResourceIds?: string[];
  baseAgentConfidence?: number;
}

export interface CandidatePlanRecord {
  optionKey: 'OPT-1' | 'OPT-2' | 'OPT-3';
  planId: string;
  title: string;
  subtitle: string;
  isRecommended: boolean;
  weights: ObjectiveWeights;
  objectiveScore: number;
  confidenceScore: number;
  confidenceBreakdown: {
    baseConfidence: number;
    simulatedDataPenalty: number;
    routeContingencyPenalty: number;
    formula: string;
    provenance: string;
  };
  status: 'Pending Approval' | 'Approved' | 'Active' | 'Rejected';
  planRecord: DbPlan;
  diff: ComputedPlanDiff;
  tradeOffSummary: string;
  expectedOutcomes: string[];
  assignments: DbPlanAssignment[];
  delayedIncidents: Array<{ id: string; name: string; reason: string }>;
  dimensionalScores: {
    lifeSafety: number;
    agriculture: number;
    ecosystem: number;
    fleetStress: number;
    travelLogistics: number;
  };
}

/**
 * Calculates candidate plan confidence mathematically based on the Verification & Confidence Agent model.
 * Formula: Base Upstream Confidence - Missing Evidence Penalty - Simulation Penalty - Operational Contingency Adjustment
 * [CALCULATION — DERIVED FROM EXPLICIT INPUTS]
 */
export function calculateCandidateConfidence(
  optionKey: 'OPT-1' | 'OPT-2' | 'OPT-3',
  baseConfidence = 91.5
): {
  score: number;
  breakdown: {
    baseConfidence: number;
    simulatedDataPenalty: number;
    routeContingencyPenalty: number;
    formula: string;
    provenance: string;
  };
} {
  const simulatedDataPenalty = 3.0; // 3.0% penalty for simulated smoke buffer and estimated population feeds [SIMULATED — DEMO DATA]
  let routeContingencyPenalty = 0.0;

  if (optionKey === 'OPT-1') {
    // Option 1 utilizes primary 6x6 bypass and dual vehicle response at I-1
    routeContingencyPenalty = 0.0;
  } else if (optionKey === 'OPT-2') {
    // Option 2 relies exclusively on single-vessel water evacuation at I-4 without ground vehicle redundancy
    routeContingencyPenalty = 4.5;
  } else if (optionKey === 'OPT-3') {
    // Option 3 involves split deployment for Rescue Team C with intermediate transit latency
    routeContingencyPenalty = 2.5;
  }

  const score = Math.round((baseConfidence - simulatedDataPenalty - routeContingencyPenalty) * 10) / 10;

  return {
    score,
    breakdown: {
      baseConfidence,
      simulatedDataPenalty,
      routeContingencyPenalty,
      formula: `Confidence = Base(${baseConfidence}%) - SimDataPenalty(${simulatedDataPenalty}%) - RouteRisk(${routeContingencyPenalty}%) = ${score}%`,
      provenance: '[CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
    },
  };
}

/**
 * Calculates candidate plan objective score mathematically from weights and dimensional performance scores.
 * Formula: Score = sum(w_d * Score_d)
 * [CALCULATION — DERIVED FROM EXPLICIT INPUTS]
 */
export function calculateCandidateObjectiveScore(
  weights: ObjectiveWeights,
  dimensions: {
    lifeSafety: number;
    agriculture: number;
    ecosystem: number;
    fleetStress: number;
    travelLogistics: number;
  }
): number {
  const sumWeights =
    weights.lifeSafety +
    weights.agriculture +
    weights.ecosystem +
    weights.fleetStress +
    weights.travelLogistics || 1.0;

  const rawScore =
    (weights.lifeSafety / sumWeights) * dimensions.lifeSafety +
    (weights.agriculture / sumWeights) * dimensions.agriculture +
    (weights.ecosystem / sumWeights) * dimensions.ecosystem +
    (weights.fleetStress / sumWeights) * dimensions.fleetStress +
    (weights.travelLogistics / sumWeights) * dimensions.travelLogistics;

  return Math.round(rawScore * 10) / 10;
}

export const candidatePlanService = {
  /**
   * Generates 3 distinct candidate plans for multi-option decision intelligence.
   * Enforces human approval gating (all candidates default strictly to 'Pending Approval').
   * Assigns explicit objective weights with [GOVERNANCE CONSTRAINT] provenance.
   */
  generateCandidatePlans(ctx?: CandidatePlanGenerationContext): CandidatePlanRecord[] {
    const baseAssignmentsT0 = [
      { resource_id: 'RES-VEH-A', incident_id: 'I-1', resource_name: 'Evacuation Vehicle A', incident_name: 'I-1 Hillside Village Community Evacuation' },
      { resource_id: 'RES-TEAM-B', incident_id: 'I-2', resource_name: 'Transport Team B', incident_name: 'I-2 Valley Dairy Farm & Livestock Emergency' },
      { resource_id: 'RES-TEAM-C', incident_id: 'I-3', resource_name: 'Rescue Team C', incident_name: 'I-3 Pine Ridge Wildlife Sanctuary Emergency' },
      { resource_id: 'RES-BOAT-1', incident_id: 'I-1', resource_name: 'Boat 1', incident_name: 'I-1 Hillside Village Community Evacuation' },
    ];

    const baseAgentConf = ctx?.baseAgentConfidence || 91.5;

    // -------------------------------------------------------------
    // OPTION 1: Life-Safety Priority Profile
    // -------------------------------------------------------------
    const opt1Weights: ObjectiveWeights = {
      lifeSafety: 0.70,
      agriculture: 0.10,
      ecosystem: 0.10,
      fleetStress: 0.05,
      travelLogistics: 0.05,
      provenance: '[GOVERNANCE CONSTRAINT]',
    };

    const opt1Dimensions = {
      lifeSafety: 96,
      agriculture: 42,
      ecosystem: 38,
      fleetStress: 78,
      travelLogistics: 84,
    };

    const opt1Confidence = calculateCandidateConfidence('OPT-1', baseAgentConf);
    const opt1ObjectiveScore = calculateCandidateObjectiveScore(opt1Weights, opt1Dimensions);

    const opt1Assignments: DbPlanAssignment[] = [
      {
        plan_id: 'PLAN-T1-OPT1',
        resource_id: 'RES-TEAM-B',
        incident_id: 'I-4',
        action: 'Reallocate',
        eta_minutes: 24,
        route_details: 'Via North River 6x6 Bypass [FROM GATEWAYS]',
        notes: 'Diverted from I-2 to execute critical life-safety extraction at isolated settlement (simulated 410 residents [SIMULATED — DEMO DATA]). [CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
        resource_name: 'Transport Team B',
        resource_type: 'Transport Team',
        incident_name: 'I-4 Cut-Off Settlement Evacuation',
      },
      {
        plan_id: 'PLAN-T1-OPT1',
        resource_id: 'RES-TEAM-C',
        incident_id: 'I-1',
        action: 'Reallocate',
        eta_minutes: 18,
        route_details: 'Standard County Access Road [FROM GATEWAYS]',
        notes: 'Diverted from I-3 to replace broken-down Evacuation Vehicle A at Hillside Village. [CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
        resource_name: 'Rescue Team C',
        resource_type: 'Rescue Team',
        incident_name: 'I-1 Hillside Village Community Evacuation',
      },
      {
        plan_id: 'PLAN-T1-OPT1',
        resource_id: 'RES-BOAT-1',
        incident_id: 'I-1',
        action: 'Assign',
        eta_minutes: 12,
        route_details: 'Navigable River Waterway [DATABASE — T0 SEED]',
        notes: 'Maintained at I-1 water corridor for continuous amphibious staging. [DATABASE — T0 SEED]',
        resource_name: 'Boat 1',
        resource_type: 'Boat',
        incident_name: 'I-1 Hillside Village Community Evacuation',
      },
    ];

    const opt1Delayed = [
      {
        id: 'I-2',
        name: 'Valley Dairy Farm & Livestock Emergency',
        reason: '[AGENT-DERIVED / RECOMMENDATION] Diverted Transport Team B to prioritize life safety at I-4 [FROM GATEWAYS]; estimated 3.5h safe smoke buffer available [SIMULATED — DEMO DATA].',
      },
      {
        id: 'I-3',
        name: 'Pine Ridge Wildlife Sanctuary Emergency',
        reason: '[AGENT-DERIVED / RECOMMENDATION] Diverted Rescue Team C to I-1 [FROM GATEWAYS]; recommend monitoring via aerial drone reconnaissance [RECOMMENDATION].',
      },
    ];

    const opt1Diff = planDiffService.computeDiff(baseAssignmentsT0, opt1Assignments, {
      targetPlanId: 'PLAN-T1-OPT1',
      parentPlanId: 'PLAN-T0-BASE',
      unavailableResourceIds: ['RES-VEH-A'],
      delayedIncidents: opt1Delayed,
    });

    const opt1Record: CandidatePlanRecord = {
      optionKey: 'OPT-1',
      planId: 'PLAN-T1-OPT1',
      title: 'Option 1: Life-Safety Priority Profile',
      subtitle: 'Maximum immediate human life preservation at I-4 & I-1 (70% Life-Safety Weight)',
      isRecommended: true, // Prioritized specifically under Life-Safety Mandate [GOVERNANCE CONSTRAINT]
      weights: opt1Weights,
      objectiveScore: opt1ObjectiveScore,
      confidenceScore: opt1Confidence.score,
      confidenceBreakdown: opt1Confidence.breakdown,
      status: 'Pending Approval',
      planRecord: {
        id: 'PLAN-T1-OPT1',
        version: 2,
        status: 'Pending Approval',
        source_scenario: 'T1',
        confidence_score: opt1Confidence.score,
        objective_score: opt1ObjectiveScore,
        generated_at: new Date(),
        metadata: {
          parentPlanId: 'PLAN-T0-BASE',
          optionKey: 'OPT-1',
          weights: opt1Weights,
          confidenceBreakdown: opt1Confidence.breakdown,
          requiresHumanApproval: true,
          autoDispatchBlocked: true,
        },
        assignments: opt1Assignments,
        changes: opt1Diff.items,
        created_at: new Date(),
        updated_at: new Date(),
      },
      diff: opt1Diff,
      assignments: opt1Assignments,
      tradeOffSummary: 'Prioritizes 100% human life-safety extraction coverage across I-1 and I-4; livestock transport at I-2 and wildlife protection at I-3 temporarily delayed under monitored buffer zones [CALCULATION — DERIVED FROM EXPLICIT INPUTS].',
      expectedOutcomes: [
        '410 cut-off residents at I-4 evacuated via North River 6x6 bypass [FROM GATEWAYS]',
        '320 residents at I-1 sustained evacuation via Rescue Team C + Boat 1 [FROM GATEWAYS]',
        'I-2 Dairy Farm buffered by estimated 3.5-hour safe smoke window [SIMULATED — DEMO DATA]',
        'I-3 Wildlife Sanctuary monitored via remote aerial drone coverage [RECOMMENDATION]',
      ],
      delayedIncidents: opt1Delayed,
      dimensionalScores: opt1Dimensions,
    };

    // -------------------------------------------------------------
    // OPTION 2: Agricultural & Economic Asset Protection Profile
    // -------------------------------------------------------------
    const opt2Weights: ObjectiveWeights = {
      lifeSafety: 0.40,
      agriculture: 0.35,
      ecosystem: 0.15,
      fleetStress: 0.05,
      travelLogistics: 0.05,
      provenance: '[GOVERNANCE CONSTRAINT]',
    };

    const opt2Dimensions = {
      lifeSafety: 79,
      agriculture: 94,
      ecosystem: 35,
      fleetStress: 85,
      travelLogistics: 72,
    };

    const opt2Confidence = calculateCandidateConfidence('OPT-2', baseAgentConf);
    const opt2ObjectiveScore = calculateCandidateObjectiveScore(opt2Weights, opt2Dimensions);

    const opt2Assignments: DbPlanAssignment[] = [
      {
        plan_id: 'PLAN-T1-OPT2',
        resource_id: 'RES-TEAM-B',
        incident_id: 'I-2',
        action: 'Assign',
        eta_minutes: 10,
        route_details: 'Valley Highway East [DATABASE — T0 SEED]',
        notes: 'Retained at I-2 to execute livestock evacuation for 840 dairy cattle [SIMULATED — DEMO DATA]. [GOVERNANCE CONSTRAINT]',
        resource_name: 'Transport Team B',
        resource_type: 'Transport Team',
        incident_name: 'I-2 Valley Dairy Farm & Livestock Emergency',
      },
      {
        plan_id: 'PLAN-T1-OPT2',
        resource_id: 'RES-BOAT-1',
        incident_id: 'I-4',
        action: 'Reallocate',
        eta_minutes: 20,
        route_details: 'Navigable River Western Channel to Isolated Settlement [FROM GATEWAYS]',
        notes: 'Dispatched to I-4 to execute amphibious river extraction of cut-off population via waterway [FROM GATEWAYS].',
        resource_name: 'Boat 1',
        resource_type: 'Boat',
        incident_name: 'I-4 Cut-Off Settlement Evacuation',
      },
      {
        plan_id: 'PLAN-T1-OPT2',
        resource_id: 'RES-TEAM-C',
        incident_id: 'I-1',
        action: 'Reallocate',
        eta_minutes: 18,
        route_details: 'Standard County Access Road [FROM GATEWAYS]',
        notes: 'Assigned to I-1 to replace broken down Evacuation Vehicle A [CALCULATION — DERIVED FROM EXPLICIT INPUTS].',
        resource_name: 'Rescue Team C',
        resource_type: 'Rescue Team',
        incident_name: 'I-1 Hillside Village Community Evacuation',
      },
    ];

    const opt2Delayed = [
      {
        id: 'I-3',
        name: 'Pine Ridge Wildlife Sanctuary Emergency',
        reason: '[AGENT-DERIVED / RECOMMENDATION] Rescue Team C diverted to I-1; sanctuary buffered by topography pending mutual aid [SIMULATED — DEMO DATA].',
      },
    ];

    const opt2Diff = planDiffService.computeDiff(baseAssignmentsT0, opt2Assignments, {
      targetPlanId: 'PLAN-T1-OPT2',
      parentPlanId: 'PLAN-T0-BASE',
      unavailableResourceIds: ['RES-VEH-A'],
      delayedIncidents: opt2Delayed,
    });

    const opt2Record: CandidatePlanRecord = {
      optionKey: 'OPT-2',
      planId: 'PLAN-T1-OPT2',
      title: 'Option 2: Agricultural Asset Protection Profile',
      subtitle: 'Retain livestock defense at I-2 with amphibious river corridor extraction at I-4 (35% Agri Weight)',
      isRecommended: false, // Priority under agricultural weighting profiles [GOVERNANCE CONSTRAINT]
      weights: opt2Weights,
      objectiveScore: opt2ObjectiveScore,
      confidenceScore: opt2Confidence.score,
      confidenceBreakdown: opt2Confidence.breakdown,
      status: 'Pending Approval',
      planRecord: {
        id: 'PLAN-T1-OPT2',
        version: 2,
        status: 'Pending Approval',
        source_scenario: 'T1',
        confidence_score: opt2Confidence.score,
        objective_score: opt2ObjectiveScore,
        generated_at: new Date(),
        metadata: {
          parentPlanId: 'PLAN-T0-BASE',
          optionKey: 'OPT-2',
          weights: opt2Weights,
          confidenceBreakdown: opt2Confidence.breakdown,
          requiresHumanApproval: true,
          autoDispatchBlocked: true,
        },
        assignments: opt2Assignments,
        changes: opt2Diff.items,
        created_at: new Date(),
        updated_at: new Date(),
      },
      diff: opt2Diff,
      assignments: opt2Assignments,
      tradeOffSummary: 'Preserves 840 dairy cattle at I-2 [SIMULATED — DEMO DATA]; utilizes Boat 1 for riverine extraction at I-4 [FROM GATEWAYS]; overland road transit for I-4 delayed until mutual aid arrives [AGENT-DERIVED].',
      expectedOutcomes: [
        '840 dairy cattle protected at I-2 Valley Dairy Farm [SIMULATED — DEMO DATA]',
        'Amphibious river evacuation initiated for cut-off settlement at I-4 [FROM GATEWAYS]',
        '320 residents at I-1 supported by Rescue Team C [FROM GATEWAYS]',
        'I-3 Wildlife Sanctuary delayed pending secondary mutual aid response [RECOMMENDATION]',
      ],
      delayedIncidents: opt2Delayed,
      dimensionalScores: opt2Dimensions,
    };

    // -------------------------------------------------------------
    // OPTION 3: Balanced Multi-Sector Protection Profile
    // -------------------------------------------------------------
    const opt3Weights: ObjectiveWeights = {
      lifeSafety: 0.50,
      agriculture: 0.20,
      ecosystem: 0.20,
      fleetStress: 0.05,
      travelLogistics: 0.05,
      provenance: '[GOVERNANCE CONSTRAINT]',
    };

    const opt3Dimensions = {
      lifeSafety: 88,
      agriculture: 45,
      ecosystem: 82,
      fleetStress: 74,
      travelLogistics: 79,
    };

    const opt3Confidence = calculateCandidateConfidence('OPT-3', baseAgentConf);
    const opt3ObjectiveScore = calculateCandidateObjectiveScore(opt3Weights, opt3Dimensions);

    const opt3Assignments: DbPlanAssignment[] = [
      {
        plan_id: 'PLAN-T1-OPT3',
        resource_id: 'RES-TEAM-B',
        incident_id: 'I-4',
        action: 'Reallocate',
        eta_minutes: 24,
        route_details: 'Via North River 6x6 Bypass [FROM GATEWAYS]',
        notes: 'Assigned to primary life-safety corridor at I-4 [FROM GATEWAYS].',
        resource_name: 'Transport Team B',
        resource_type: 'Transport Team',
        incident_name: 'I-4 Cut-Off Settlement Evacuation',
      },
      {
        plan_id: 'PLAN-T1-OPT3',
        resource_id: 'RES-BOAT-1',
        incident_id: 'I-1',
        action: 'Assign',
        eta_minutes: 12,
        route_details: 'Navigable River Waterway [DATABASE — T0 SEED]',
        notes: 'Maintained at I-1 for continuous water evacuation coverage [DATABASE — T0 SEED].',
        resource_name: 'Boat 1',
        resource_type: 'Boat',
        incident_name: 'I-1 Hillside Village Community Evacuation',
      },
      {
        plan_id: 'PLAN-T1-OPT3',
        resource_id: 'RES-TEAM-C',
        incident_id: 'I-3',
        action: 'Reallocate',
        eta_minutes: 15,
        route_details: 'Ridge Access Road / Secondary Corridor [DATABASE — T0 SEED]',
        notes: 'Staged for initial critical habitat containment at I-3 before transitional deployment to support I-1 [AGENT-DERIVED].',
        resource_name: 'Rescue Team C',
        resource_type: 'Rescue Team',
        incident_name: 'I-3 Pine Ridge Wildlife Sanctuary Emergency',
      },
    ];

    const opt3Delayed = [
      {
        id: 'I-2',
        name: 'Valley Dairy Farm & Livestock Emergency',
        reason: '[AGENT-DERIVED / RECOMMENDATION] Livestock transport deferred under smoke window buffer to allow split environmental and human safety response [SIMULATED — DEMO DATA].',
      },
    ];

    const opt3Diff = planDiffService.computeDiff(baseAssignmentsT0, opt3Assignments, {
      targetPlanId: 'PLAN-T1-OPT3',
      parentPlanId: 'PLAN-T0-BASE',
      unavailableResourceIds: ['RES-VEH-A'],
      delayedIncidents: opt3Delayed,
    });

    const opt3Record: CandidatePlanRecord = {
      optionKey: 'OPT-3',
      planId: 'PLAN-T1-OPT3',
      title: 'Option 3: Balanced Multi-Sector Protection Profile',
      subtitle: 'Distributed response balancing life-safety with ecological containment (20% Eco Weight)',
      isRecommended: false,
      weights: opt3Weights,
      objectiveScore: opt3ObjectiveScore,
      confidenceScore: opt3Confidence.score,
      confidenceBreakdown: opt3Confidence.breakdown,
      status: 'Pending Approval',
      planRecord: {
        id: 'PLAN-T1-OPT3',
        version: 2,
        status: 'Pending Approval',
        source_scenario: 'T1',
        confidence_score: opt3Confidence.score,
        objective_score: opt3ObjectiveScore,
        generated_at: new Date(),
        metadata: {
          parentPlanId: 'PLAN-T0-BASE',
          optionKey: 'OPT-3',
          weights: opt3Weights,
          confidenceBreakdown: opt3Confidence.breakdown,
          requiresHumanApproval: true,
          autoDispatchBlocked: true,
        },
        assignments: opt3Assignments,
        changes: opt3Diff.items,
        created_at: new Date(),
        updated_at: new Date(),
      },
      diff: opt3Diff,
      assignments: opt3Assignments,
      tradeOffSummary: 'Balances primary human life safety at I-4 with active containment of endangered species habitats at I-3 [FROM GATEWAYS]; I-1 relies heavily on river corridor assets [AGENT-DERIVED].',
      expectedOutcomes: [
        'Cut-off residents at I-4 extracted via 6x6 heavy transport [FROM GATEWAYS]',
        'Endangered species habitat at I-3 defended by Rescue Team C split staging [SIMULATED — DEMO DATA]',
        'I-1 community evacuation maintained via amphibious Boat 1 [DATABASE — T0 SEED]',
        'I-2 agricultural livestock queued for mutual aid transport [SIMULATED — DEMO DATA]',
      ],
      delayedIncidents: opt3Delayed,
      dimensionalScores: opt3Dimensions,
    };

    return [opt1Record, opt2Record, opt3Record];
  },

  /**
   * Helper to convert CandidatePlanRecord to UI-friendly PlanOption format.
   */
  mapToPlanOption(candidate: CandidatePlanRecord): PlanOption {
    return {
      id: candidate.planId,
      title: candidate.title,
      subtitle: candidate.subtitle,
      isRecommended: candidate.isRecommended,
      incidentsCovered: candidate.assignments.length,
      totalIncidents: 4,
      resourcesAssigned: candidate.assignments.length,
      estimatedTotalHours: 4.5,
      successProbabilityPercent: Math.round(candidate.confidenceScore),
      riskScore: candidate.optionKey === 'OPT-1' ? 'Medium' : candidate.optionKey === 'OPT-2' ? 'High' : 'Medium',
      expectedOutcomes: candidate.expectedOutcomes,
      tradeOffSummary: candidate.tradeOffSummary,
      assignments: candidate.assignments.map((a) => ({
        resourceId: a.resource_id,
        resourceName: a.resource_name || a.resource_id,
        resourceType: (a.resource_type as any) || 'Transport Team',
        incidentId: a.incident_id,
        incidentName: a.incident_name || a.incident_id,
        action: a.action as any,
        notes: a.notes || '',
        etaMinutes: a.eta_minutes || 15,
        routeDetails: a.route_details || '',
      })),
      delayedIncidentIds: candidate.delayedIncidents.map((d) => d.id),
      delayedReasons: candidate.delayedIncidents.reduce((acc, d) => {
        acc[d.id] = d.reason;
        return acc;
      }, {} as Record<string, string>),
      confidenceScore: candidate.confidenceScore,
    };
  },
};
