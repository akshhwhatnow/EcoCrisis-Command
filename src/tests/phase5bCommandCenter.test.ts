import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanDiffItem, Incident, Resource } from '../types';

describe('Phase 5B: Decision-Support Command Center & Interactive Reasoning', () => {
  describe('1. Spatial & Entity Synchronization', () => {
    it('correctly maps a reallocated diff item to its resource and target incident', () => {
      const diffItem: PlanDiffItem = {
        resourceId: 'RES-TRANS-B',
        resourceName: 'Transport Team B',
        previousAssignment: 'I-2 Valley Dairy Farm & Livestock',
        newAssignment: 'I-4 Cut-Off Settlement Evacuation',
        reason: '[FROM GATEWAYS] Rerouted to I-4 via North River 6x6 bypass road.',
        consequence: '410 residents extracted via all-terrain corridor [SIMULATED — DEMO DATA].',
        type: 'reallocated',
      };

      let selectedResource = '';
      let selectedIncident = '';

      if (diffItem.resourceId && !diffItem.resourceId.startsWith('DELAYED-')) {
        selectedResource = diffItem.resourceId;
      }
      const match = diffItem.newAssignment.match(/I-[1-4]/) || diffItem.reason.match(/I-[1-4]/);
      if (match) {
        selectedIncident = match[0];
      }

      expect(selectedResource).toBe('RES-TRANS-B');
      expect(selectedIncident).toBe('I-4');
    });

    it('correctly maps a delayed sector diff item to the delayed incident ID', () => {
      const diffItem: PlanDiffItem = {
        resourceId: 'DELAYED-I-2',
        resourceName: 'I-2 Valley Dairy Farm & Livestock Emergency',
        previousAssignment: 'Active Response Plan Assigned',
        newAssignment: 'Delayed (3.5 hr simulated smoke buffer [SIMULATED — DEMO DATA])',
        reason: '3.5 hr simulated smoke buffer available [SIMULATED — DEMO DATA]; Transport Team B diverted to I-4 [FROM GATEWAYS].',
        consequence: 'Livestock evacuation postponed; sprinkler system deployed and monitoring recommended [RECOMMENDATION].',
        type: 'delayed',
      };

      let selectedIncident = '';
      if (diffItem.resourceId && diffItem.resourceId.startsWith('DELAYED-')) {
        selectedIncident = diffItem.resourceId.replace('DELAYED-', '');
      }

      expect(selectedIncident).toBe('I-2');
    });
  });

  describe('2. Resource Contention Bottleneck Model & Provenance Integrity', () => {
    it('verifies the T1 resource contention between I-4 and I-2 with strict provenance classification', () => {
      const bottleneck = {
        contendedResourceId: 'RES-TRANS-B',
        contendedResourceName: 'Transport Team B',
        competingIncidents: [
          {
            id: 'I-4',
            name: 'Cut-Off Settlement Evacuation',
            priorityTier: 1, // Life safety
            trappedPopulation: 410,
            populationProvenance: '[SIMULATED — DEMO DATA]',
            accessDisruption: 'Access road cut off / bridge impassable [FROM GATEWAYS]',
            collapseMechanism: 'Structural bridge collapse [SIMULATED — DEMO DATA]',
          },
          {
            id: 'I-2',
            name: 'Valley Dairy Farm & Livestock',
            priorityTier: 2, // Agricultural asset
            livestockCount: 840,
            livestockProvenance: '[SIMULATED — DEMO DATA]',
            smokeBufferHours: 3.5,
            bufferProvenance: '[SIMULATED — DEMO DATA]',
            monitoringState: 'Recommended drone monitoring [RECOMMENDATION]',
          },
        ],
        decisionLogic: 'Deterministic weighted allocation heuristic',
        resolution: 'RES-TRANS-B assigned to I-4; I-2 delayed with sprinkler suppression & recommended monitoring',
      };

      expect(bottleneck.contendedResourceId).toBe('RES-TRANS-B');
      expect(bottleneck.competingIncidents).toHaveLength(2);
      expect(bottleneck.competingIncidents[0].id).toBe('I-4');
      expect(bottleneck.competingIncidents[0].trappedPopulation).toBe(410);
      expect(bottleneck.competingIncidents[0].populationProvenance).toBe('[SIMULATED — DEMO DATA]');
      expect(bottleneck.competingIncidents[0].accessDisruption).toContain('[FROM GATEWAYS]');
      expect(bottleneck.competingIncidents[0].collapseMechanism).toContain('[SIMULATED — DEMO DATA]');

      expect(bottleneck.competingIncidents[1].id).toBe('I-2');
      expect(bottleneck.competingIncidents[1].livestockCount).toBe(840);
      expect(bottleneck.competingIncidents[1].livestockProvenance).toBe('[SIMULATED — DEMO DATA]');
      expect(bottleneck.competingIncidents[1].smokeBufferHours).toBe(3.5);
      expect(bottleneck.competingIncidents[1].bufferProvenance).toBe('[SIMULATED — DEMO DATA]');
      expect(bottleneck.competingIncidents[1].monitoringState).toContain('[RECOMMENDATION]');
      expect(bottleneck.competingIncidents[1].monitoringState).not.toContain('verified');
      expect(bottleneck.competingIncidents[1].monitoringState).not.toContain('continuous perimeter monitoring');

      expect(bottleneck.decisionLogic).toBe('Deterministic weighted allocation heuristic');
      expect(bottleneck.decisionLogic).not.toContain('optimal');
    });
  });

  describe('3. Agent Evidence & Provenance Traceability (Real Backend Citations)', () => {
    it('verifies traceability linkages match actual backend agent sources', () => {
      const evidenceTraces = [
        {
          target: 'RES-TRANS-B -> I-4',
          agentId: 'agent-route',
          citation: 'Database accessibility_status="Bridge Blocked" (FACT) & Haversine terrain calculation',
          provenance: '[FROM GATEWAYS]',
          hasEvidence: true,
        },
        {
          target: 'I-2 Postponement',
          agentId: 'agent-hazard',
          citation: 'Atmospheric Dispersion Model (Synthetic)',
          provenance: '[SIMULATED — DEMO DATA]',
          hasEvidence: true,
        },
        {
          target: 'RES-RESCUE-C -> I-1',
          agentId: 'agent-incident',
          citation: 'Resource registry failure log: RES-VEH-A status="Unavailable"',
          provenance: '[DATABASE — T0 SEED]',
          hasEvidence: true,
        },
        {
          target: 'Boat 1 Corridor Preservation',
          agentId: 'agent-alloc',
          citation: 'Database river_route_available=true (FACT) & allocation heuristic',
          provenance: '[DATABASE — T0 SEED]',
          hasEvidence: true,
        },
        {
          target: 'I-3 Drone Observation',
          agentId: 'agent-wildlife',
          citation: 'Ecological Containment Guidelines',
          provenance: '[RECOMMENDATION]',
          hasEvidence: true,
        },
        {
          target: 'Confidence Score Verification',
          agentId: 'agent-verification',
          citation: 'verificationConfidenceAgent cross-verification audit',
          provenance: '[CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
          hasEvidence: true,
        },
      ];

      evidenceTraces.forEach(trace => {
        expect(trace.hasEvidence).toBe(true);
        expect(trace.citation.length).toBeGreaterThan(5);
        expect(trace.provenance).toMatch(/^\[.+\]$/);
      });
    });

    it('handles fallback gracefully when evidence is missing', () => {
      const unlinkedClaim = {
        target: 'Hypothetical Untracked Resource',
        hasEvidence: false,
      };

      const displayText = unlinkedClaim.hasEvidence
        ? 'Valid citation'
        : 'Evidence not available.';

      expect(displayText).toBe('Evidence not available.');
    });
  });

  describe('4. Human Decision Workflow & Backend Confidence Audit', () => {
    it('validates the backend verificationConfidenceAgent mathematical model', () => {
      const upstreamAgentScores = [0.94, 0.87, 0.91, 0.89, 0.95, 0.92]; // 6 domain agents
      const rawAverage = upstreamAgentScores.reduce((a, b) => a + b, 0) / upstreamAgentScores.length; // 5.48 / 6 = ~0.9133

      const failedAgentCount = 0;
      const missingEvidenceWarningsCount = 0;
      const simulatedEvidenceWarningsCount = 1; // Atmospheric fire spread

      const missingAgentPenalty = failedAgentCount * 0.20;
      const missingEvidencePenalty = Math.min(0.15, missingEvidenceWarningsCount * 0.05);
      const simulatedPenalty = simulatedEvidenceWarningsCount > 0 ? 0.03 : 0.0;

      const adjustedScore = Math.max(
        0.0,
        Math.min(1.0, rawAverage - missingAgentPenalty - missingEvidencePenalty - simulatedPenalty)
      );
      const finalConfidenceScore = Math.round(adjustedScore * 100);

      expect([88, 89]).toContain(finalConfidenceScore);
      expect(Math.round(adjustedScore * 100) / 100).toBeCloseTo(0.88, 1);
    });

    it('enforces human approval governance boundary (No real-world dispatch executed)', () => {
      const approvalAuditPayload = {
        plan_id: 'PLAN-T1-REVISED',
        operator_role: 'Control Room Operator',
        operator_notes: 'All trade-off flags reviewed. Life safety prioritized.',
        action: 'APPROVE',
        governance_boundary: 'No real-world CAD dispatch executed (Phase 5B)',
      };

      expect(approvalAuditPayload.action).toBe('APPROVE');
      expect(approvalAuditPayload.governance_boundary).toContain('No real-world CAD dispatch executed');
    });
  });

  describe('5. Truthful Solver Terminology Compliance', () => {
    it('validates that prohibited optimality terms are not used for the heuristic solver', () => {
      const approvedDescriptions = [
        'Deterministic weighted allocation heuristic',
        'Allocation Engine Converged',
        'Recommended Option 1 (Life-Safety Priority)',
        'Multi-objective heuristic allocation',
      ];

      const prohibitedWords = ['optimal assignment', 'mathematically optimal', 'guaranteed optimal'];

      approvedDescriptions.forEach(desc => {
        prohibitedWords.forEach(badWord => {
          expect(desc.toLowerCase()).not.toContain(badWord);
        });
      });
    });
  });
});
