import { DbIncident } from '../db/repositories/incidentRepository.js';
import { DbResource } from '../db/repositories/resourceRepository.js';
import { DbPlan } from '../db/repositories/planRepository.js';

export type AgentRole =
  | 'INCIDENT_ASSESSMENT'
  | 'HAZARD_FIRE_WEATHER'
  | 'AGRICULTURE'
  | 'WILDLIFE_ECOSYSTEM'
  | 'RESOURCE_ALLOCATION'
  | 'ROUTE_LOGISTICS'
  | 'VERIFICATION_CONFIDENCE'
  | 'COMMAND_PLANNING';

export type EvidenceType = 'DATABASE' | 'CALCULATION' | 'DERIVED' | 'SIMULATED';

export interface AgentEvidence {
  type: EvidenceType;
  source: string;
  reference?: string;
  details?: Record<string, any>;
}

export interface AgentConfidence {
  score: number; // 0.0 - 1.0
  rationale: string;
  limitations: string[];
}

export interface AgentFinding {
  findingType: string;
  summary: string;
  details: Record<string, any>;
  confidence: AgentConfidence;
  evidence: AgentEvidence[];
}

export interface AgentRecommendation {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  rationale: string;
  targetEntityId?: string;
}

export interface AgentConstraint {
  constraintType: string;
  description: string;
  hardConstraint: boolean;
}

export interface AgentResult {
  agentId: string;
  role: AgentRole;
  name: string;
  runId: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  startedAt: string;
  completedAt: string;
  confidence: AgentConfidence;
  findings: AgentFinding[];
  recommendations: AgentRecommendation[];
  constraints: AgentConstraint[];
  evidence: AgentEvidence[];
  rawOutput?: Record<string, any>;
  error?: string;
}

export interface AgentContext {
  correlationId: string;
  executionId: string;
  planId?: string;
  incidentIds: string[];
  incidents: DbIncident[];
  resources: DbResource[];
  activePlan?: DbPlan | null;
  spatialLayers: any[];
  previousResults: Partial<Record<AgentRole, AgentResult>>;
  deterministicImpact?: any;
  deterministicAllocations?: any;
  executionMetadata: {
    triggeredAt: string;
    environment: string;
    provider: string;
  };
}

export interface CrisisAgent {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  execute(context: AgentContext): Promise<AgentResult>;
}

export interface PipelineExecutionResult {
  executionId: string;
  startedAt: string;
  completedAt: string;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  correlationId: string;
  incidentIds: string[];
  agentResults: Partial<Record<AgentRole, AgentResult>>;
  synthesis?: Record<string, any>;
  errors: string[];
}
