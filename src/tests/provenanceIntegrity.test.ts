import { describe, it, expect } from 'vitest';
import { buildAgentContext } from '../../server/agents/context.js';
import { defaultPipelineRunner } from '../../server/agents/pipeline.js';
import { defaultModelProvider } from '../../server/agents/providers/modelProvider.js';
import { VerificationConfidenceAgent } from '../../server/agents/agents/verificationConfidenceAgent.js';
import { CommandPlanningAgent } from '../../server/agents/agents/commandPlanningAgent.js';
import { IncidentAssessmentAgent } from '../../server/agents/agents/incidentAssessmentAgent.js';
import { ResourceAllocationAgent } from '../../server/agents/agents/resourceAllocationAgent.js';
import { calculateDistanceKm, calculateTravelTimeMinutes } from '../../src/services/optimizationEngine.js';
import { computeCrossSectorImpact } from '../../src/services/riskImpactEngine.js';

describe('Phase 3: Provenance Integrity & Evidence Audit', () => {
  it('DATABASE evidence items reference existing database entities and attributes', async () => {
    const context = await buildAgentContext(['I-1', 'I-2', 'I-3']);
    const incAgent = new IncidentAssessmentAgent();
    const result = await incAgent.execute(context);

    for (const ev of result.evidence) {
      if (ev.type === 'DATABASE') {
        expect(ev.source).toBe('incidents');
        expect(['I-1', 'I-2', 'I-3']).toContain(ev.reference);
        expect(ev.details).toBeDefined();
        expect(ev.details?.severity).toBeDefined();
      }
    }
  });

  it('CALCULATION evidence contains traceable inputs, formula functions, and outputs', async () => {
    // 1. Distance & Travel Time calculation provenance
    const coord1 = { lat: 37.77, lng: -122.41 };
    const coord2 = { lat: 37.7749, lng: -122.4194 };
    const distKm = calculateDistanceKm(coord1, coord2, 1.25);
    const travelTime = calculateTravelTimeMinutes(distKm, 'Partly Threatened', 'Evacuation Vehicle');

    expect(typeof distKm).toBe('number');
    expect(distKm).toBeGreaterThan(0);
    expect(typeof travelTime).toBe('number');
    expect(travelTime).toBeGreaterThan(0);

    // 2. Resource Allocation Agent links calculation evidence
    const context = await buildAgentContext();
    const resAgent = new ResourceAllocationAgent();
    const resResult = await resAgent.execute(context);

    const calcEv = resResult.evidence.find((e) => e.type === 'CALCULATION');
    expect(calcEv).toBeDefined();
    expect(calcEv?.source).toContain('optimizationEngine');
    expect(calcEv?.details?.objectiveScore).toBeDefined();
  });

  it('SIMULATED evidence is explicitly marked as simulated and never as database fact', async () => {
    const context = await buildAgentContext();
    const pipelineResult = await defaultPipelineRunner.runPipeline({ context });

    const hazardResult = pipelineResult.agentResults['HAZARD_FIRE_WEATHER'];
    expect(hazardResult).toBeDefined();

    const simEvidence = hazardResult?.evidence.filter((e) => e.type === 'SIMULATED');
    for (const ev of simEvidence || []) {
      expect(ev.source).toContain('weather');
      expect(ev.details?.dataSource).toContain('Simulated');
    }
  });

  it('Verification Agent mathematically penalizes missing or failed upstream agents', async () => {
    const context = await buildAgentContext();

    // Context with NO upstream agents executed (all 6 missing)
    const verAgent = new VerificationConfidenceAgent();
    const degradedResult = await verAgent.execute(context);

    // Confidence must be heavily penalized because 6 expected agents are missing
    expect(degradedResult.confidence.score).toBeLessThanOrEqual(0.0);
    expect(degradedResult.status).toBe('PARTIAL');
    expect(degradedResult.findings[0].details.failedAgentCount).toBe(6);
    expect(degradedResult.confidence.limitations.some((l) => l.includes('upstream agent'))).toBe(true);
  });

  it('Command / Planning Agent preserves evidence provenance and requires human approval without auto-executing', async () => {
    const context = await buildAgentContext();
    const cmdAgent = new CommandPlanningAgent();
    const result = await cmdAgent.execute(context);

    expect(result.role).toBe('COMMAND_PLANNING');
    expect(result.status).toBe('SUCCESS');

    const gatingFinding = result.findings.find((f) => f.findingType === 'HUMAN_DECISION_GATING');
    expect(gatingFinding).toBeDefined();
    expect(gatingFinding?.details.decisionStatus).toBe('PENDING_HUMAN_APPROVAL');
    expect(gatingFinding?.details.governancePrinciple).toBe('AI recommends. Authorized humans decide.');
  });

  it('Mock Model Provider explicitly outputs SIMULATED_AGENT_REASONING mode without fake keys', async () => {
    const output = await defaultModelProvider.generateStructuredReasoning<{ mode: string }>('Test prompt');
    expect(output.mode).toBe('SIMULATED_AGENT_REASONING');
    expect(defaultModelProvider.id).toBe('mock-deterministic-provider');
  });

  it('T0 pipeline executes cleanly without mutating the active database plan or injecting T1 state', async () => {
    const context = await buildAgentContext();
    const pipelineResult = await defaultPipelineRunner.runPipeline({ context });

    expect(pipelineResult.status).toBe('COMPLETED');
    expect(pipelineResult.incidentIds).not.toContain('I-4');

    // Confirm Vehicle A is not marked failed in T0 baseline
    const vehA = context.resources.find((r) => r.id === 'RES-VEH-A' || r.id === 'RES-EVAC-A');
    if (vehA) {
      expect(vehA.status).not.toBe('Unavailable');
    }
  });

  it('Phase 4: Plan Diff items enforce explicit provenance tagging on reallocations, removals, delays, and preserved assignments', async () => {
    const { replanningService } = await import('../../server/services/replanningService.js');

    const result = await replanningService.triggerT1Scenario('TEST-CORR-PROVENANCE');

    // 1. Removed item provenance (Vehicle A)
    const removedItem = result.diff.items.find((i) => i.change_type === 'removed');
    expect(removedItem).toBeDefined();
    expect(removedItem?.reason).toContain('[FROM GATEWAYS]');
    expect(removedItem?.reason).toContain('[SIMULATED — DEMO DATA]');

    // 2. Reallocated item provenance (Transport Team B to I-4)
    const reallocatedItemB = result.diff.items.find((i) => i.resource_id === 'RES-TEAM-B');
    expect(reallocatedItemB).toBeDefined();
    expect(reallocatedItemB?.reason).toContain('[AGENT-DERIVED / RECOMMENDATION]');
    expect(reallocatedItemB?.reason).toContain('[SIMULATED — DEMO DATA]');
    expect(reallocatedItemB?.reason).toContain('[FROM GATEWAYS]');

    // 3. Delayed item provenance (I-2, I-3)
    const delayedItems = result.diff.items.filter((i) => i.change_type === 'delayed');
    expect(delayedItems.length).toBeGreaterThanOrEqual(2);
    for (const del of delayedItems) {
      expect(del.reason).toContain('[AGENT-DERIVED / RECOMMENDATION]');
    }

    // 4. Preserved item provenance (Boat 1)
    const preservedBoat = result.diff.items.find((i) => i.resource_id === 'RES-BOAT-1');
    expect(preservedBoat).toBeDefined();
    expect(preservedBoat?.reason).toContain('[CALCULATION — DERIVED FROM EXPLICIT INPUTS]');

    // 5. Governance Gating Provenance
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.plan.metadata.requiresHumanApproval).toBe(true);
    expect(result.plan.metadata.autoDispatchBlocked).toBe(true);
  });

  it('Phase 4: Cross-sector trade-off analysis explicitly tags engineering justifications and simulated estimates', async () => {
    const { generateTradeoffAnalysis } = await import('../../src/services/riskImpactEngine.js');
    const tradeoffs = generateTradeoffAnalysis();

    for (const t of tradeoffs) {
      expect(t.ethicalRuleJustification).toContain('[GOVERNANCE CONSTRAINT — PROPOSED ENGINEERING DECISION]');
      expect(t.decisionText).toMatch(/\[(AGENT-DERIVED \/ RECOMMENDATION|RECOMMENDATION)\]/);
      expect(t.costDescription).toMatch(/\[(SIMULATED — DEMO DATA|ESTIMATE — SIMULATED DEMO DATA)\]/);
    }
  });

});

