import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../server/app.js';
import { defaultAgentRegistry } from '../../server/agents/registry.js';
import { defaultPipelineRunner } from '../../server/agents/pipeline.js';
import { buildAgentContext } from '../../server/agents/context.js';
import { IncidentAssessmentAgent } from '../../server/agents/agents/incidentAssessmentAgent.js';
import { HazardFireWeatherAgent } from '../../server/agents/agents/hazardFireWeatherAgent.js';
import { AgricultureAgent } from '../../server/agents/agents/agricultureAgent.js';
import { WildlifeEcosystemAgent } from '../../server/agents/agents/wildlifeEcosystemAgent.js';
import { ResourceAllocationAgent } from '../../server/agents/agents/resourceAllocationAgent.js';
import { RouteLogisticsAgent } from '../../server/agents/agents/routeLogisticsAgent.js';
import { VerificationConfidenceAgent } from '../../server/agents/agents/verificationConfidenceAgent.js';
import { CommandPlanningAgent } from '../../server/agents/agents/commandPlanningAgent.js';

describe('Phase 3: Agent Registry & Architecture Verification', () => {
  it('registers exactly 8 total agent roles (7 specialized + 1 command/planning)', () => {
    const agents = defaultAgentRegistry.getAllAgents();
    expect(agents.length).toBe(8);

    const roles = defaultAgentRegistry.getExecutionOrder();
    expect(roles).toEqual([
      'INCIDENT_ASSESSMENT',
      'HAZARD_FIRE_WEATHER',
      'AGRICULTURE',
      'WILDLIFE_ECOSYSTEM',
      'RESOURCE_ALLOCATION',
      'ROUTE_LOGISTICS',
      'VERIFICATION_CONFIDENCE',
      'COMMAND_PLANNING',
    ]);
  });
});

describe('Phase 3: Individual Agent Contracts & Reasoning Output', () => {
  it('Incident Assessment Agent produces structured triage and life-safety constraints', async () => {
    const context = await buildAgentContext(['I-1', 'I-2', 'I-3']);
    const agent = new IncidentAssessmentAgent();
    const result = await agent.execute(context);

    expect(result.role).toBe('INCIDENT_ASSESSMENT');
    expect(result.status).toBe('SUCCESS');
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.confidence.score).toBeGreaterThanOrEqual(0.9);
    expect(result.evidence.some((e) => e.type === 'DATABASE')).toBe(true);
    expect(result.constraints.some((c) => c.hardConstraint)).toBe(true);
  });

  it('Hazard: Fire & Weather Agent explicitly distinguishes simulated from database evidence', async () => {
    const context = await buildAgentContext();
    const agent = new HazardFireWeatherAgent();
    const result = await agent.execute(context);

    expect(result.role).toBe('HAZARD_FIRE_WEATHER');
    expect(result.status).toBe('SUCCESS');
    expect(result.findings.some((f) => f.findingType === 'SMOKE_DISPERSION_BUFFER')).toBe(true);
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(['DATABASE', 'SIMULATED']).toContain(result.evidence[0].type);
  });

  it('Agriculture Agent analyzes livestock, crop exposure, and timing buffers', async () => {
    const context = await buildAgentContext();
    const agent = new AgricultureAgent();
    const result = await agent.execute(context);

    expect(result.role).toBe('AGRICULTURE');
    expect(result.status).toBe('SUCCESS');
    expect(result.findings.some((f) => f.findingType === 'AGRICULTURAL_EXPOSURE')).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('Wildlife & Ecosystem Agent evaluates biodiversity corridors and containment constraints', async () => {
    const context = await buildAgentContext();
    const agent = new WildlifeEcosystemAgent();
    const result = await agent.execute(context);

    expect(result.role).toBe('WILDLIFE_ECOSYSTEM');
    expect(result.status).toBe('SUCCESS');
    expect(result.findings.some((f) => f.findingType === 'ENDANGERED_SPECIES_THREAT')).toBe(true);
  });

  it('Resource Allocation Agent consumes deterministic solver results without direct DB mutation', async () => {
    const context = await buildAgentContext();
    const agent = new ResourceAllocationAgent();
    const result = await agent.execute(context);

    expect(result.role).toBe('RESOURCE_ALLOCATION');
    expect(result.status).toBe('SUCCESS');
    expect(result.findings.some((f) => f.findingType === 'DETERMINISTIC_ALLOCATION_MATRIX')).toBe(true);
    expect(result.evidence.some((e) => e.type === 'CALCULATION')).toBe(true);
  });

  it('Route & Logistics Agent separates verified accessibility FACT from transit ESTIMATE', async () => {
    const context = await buildAgentContext();
    const agent = new RouteLogisticsAgent();
    const result = await agent.execute(context);

    expect(result.role).toBe('ROUTE_LOGISTICS');
    expect(result.status).toBe('SUCCESS');
    const provFinding = result.findings.find((f) => f.findingType === 'LOGISTICS_DATA_PROVENANCE');
    expect(provFinding).toBeDefined();
    expect(provFinding?.details.factSources).toContain('incidents.accessibility_status');
  });

  it('Verification / Confidence Agent validates upstream evidence and calculates composite confidence', async () => {
    const context = await buildAgentContext();
    // Execute all 6 specialized upstream agents
    context.previousResults['INCIDENT_ASSESSMENT'] = await new IncidentAssessmentAgent().execute(context);
    context.previousResults['HAZARD_FIRE_WEATHER'] = await new HazardFireWeatherAgent().execute(context);
    context.previousResults['AGRICULTURE'] = await new AgricultureAgent().execute(context);
    context.previousResults['WILDLIFE_ECOSYSTEM'] = await new WildlifeEcosystemAgent().execute(context);
    context.previousResults['RESOURCE_ALLOCATION'] = await new ResourceAllocationAgent().execute(context);
    context.previousResults['ROUTE_LOGISTICS'] = await new RouteLogisticsAgent().execute(context);

    const verAgent = new VerificationConfidenceAgent();
    const result = await verAgent.execute(context);

    expect(result.role).toBe('VERIFICATION_CONFIDENCE');
    expect(result.status).toBe('SUCCESS');
    expect(result.confidence.score).toBeGreaterThan(0.0);
    expect(result.findings.some((f) => f.findingType === 'PIPELINE_CROSS_VERIFICATION')).toBe(true);
  });

  it('Command / Planning Agent synthesizes operational plan and flags mandatory human approval', async () => {
    const context = await buildAgentContext();
    const cmdAgent = new CommandPlanningAgent();
    const result = await cmdAgent.execute(context);

    expect(result.role).toBe('COMMAND_PLANNING');
    expect(result.status).toBe('SUCCESS');
    const synthFinding = result.findings.find((f) => f.findingType === 'COMMAND_PLAN_SYNTHESIS');
    expect(synthFinding).toBeDefined();
    expect(synthFinding?.details.requiresHumanApproval).toBe(true);
    expect(result.constraints.some((c) => c.constraintType === 'HUMAN_APPROVAL_GATING')).toBe(true);
  });
});

describe('Phase 3: Sequential Pipeline Execution & Error Handling', () => {
  it('executes all 8 agents in sequence and produces a PipelineExecutionResult', async () => {
    const pipelineResult = await defaultPipelineRunner.runPipeline();

    expect(pipelineResult).toBeDefined();
    expect(pipelineResult.executionId).toBeDefined();
    expect(['COMPLETED', 'PARTIAL']).toContain(pipelineResult.status);
    expect(Object.keys(pipelineResult.agentResults).length).toBe(8);

    // Verify all 8 roles executed
    const executedRoles = Object.keys(pipelineResult.agentResults);
    expect(executedRoles).toContain('INCIDENT_ASSESSMENT');
    expect(executedRoles).toContain('HAZARD_FIRE_WEATHER');
    expect(executedRoles).toContain('AGRICULTURE');
    expect(executedRoles).toContain('WILDLIFE_ECOSYSTEM');
    expect(executedRoles).toContain('RESOURCE_ALLOCATION');
    expect(executedRoles).toContain('ROUTE_LOGISTICS');
    expect(executedRoles).toContain('VERIFICATION_CONFIDENCE');
    expect(executedRoles).toContain('COMMAND_PLANNING');
  });

  it('POST /api/v1/agents/run triggers the backend multi-agent pipeline and returns structured response', async () => {
    const res = await request(app)
      .post('/api/v1/agents/run')
      .send({ incidentIds: ['I-1', 'I-2', 'I-3'] });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('executionId');
    expect(res.body.data).toHaveProperty('agentResults');
    expect(Object.keys(res.body.data.agentResults).length).toBe(8);
    expect(res.body.meta.agentsExecuted).toBe(8);
    expect(res.body).toHaveProperty('correlationId');
  });
});
