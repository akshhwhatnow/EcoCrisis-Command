export type Severity = 'Critical' | 'High' | 'Medium-High' | 'Medium' | 'Low';
export type Urgency = 'Immediate' | 'Hours' | 'Monitoring';
export type IncidentStatus = 'Active' | 'Contained' | 'Delayed' | 'Under Evacuation' | 'Resolved';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface IncidentImpact {
  peopleAtRisk: number;
  areaKm2: number;
  livestockCount: number;
  livestockTypes: string[];
  cropHectares: number;
  cropTypes: string[];
  wildlifeSpecies: string[];
  habitatAreaKm2: number;
  infrastructureRisk: string[];
}

export interface Incident {
  id: string;
  name: string;
  type: string;
  locationName: string;
  coordinates: Coordinates;
  severity: Severity;
  urgency: Urgency;
  status: IncidentStatus;
  confidence: number; // 0 - 100
  reportedAt: string;
  lastUpdated: string;
  description: string;
  requiredResources: string[];
  assignedResourceIds: string[];
  accessibility: {
    status: 'Open' | 'Partly Threatened' | 'Rough Track Only' | 'Cut Off' | 'Bridge Blocked';
    roadName: string;
    details: string;
    riverRouteAvailable: boolean;
  };
  impact: IncidentImpact;
  aiInsights: string;
  liveTimeline: Array<{
    time: string;
    message: string;
    level: 'critical' | 'warning' | 'info' | 'success';
  }>;
  relatedIncidentIds: string[];
}

export type ResourceType =
  | 'Evacuation Vehicle'
  | 'Transport Team'
  | 'Rescue Team'
  | 'Boat'
  | 'Veterinary Support'
  | 'Agricultural Support'
  | 'Wildlife Team'
  | 'Aerial Drone'
  | 'Helitack Unit';

export type ResourceState =
  | 'Available'
  | 'Assigned'
  | 'En route'
  | 'Active'
  | 'Delayed'
  | 'Unavailable'
  | 'Completed';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  state: ResourceState;
  currentAssignmentId?: string;
  currentAssignmentName?: string;
  locationName: string;
  coordinates: Coordinates;
  etaMinutes?: number;
  capacity: string;
  crewCount: number;
  fuelBatteryLevel: number; // 0 - 100
  specialCapabilities: string[];
  isSimulatedFailure?: boolean;
  failureReason?: string;
}

export type AgentStatus = 'Idle' | 'Analyzing' | 'Active' | 'Completed' | 'Warning' | 'Needs Review' | 'Failed';

export interface AgentToolCall {
  toolName: string;
  parameters: Record<string, any>;
  result: Record<string, any> | string;
  timestamp: string;
  durationMs: number;
}

export interface AIAgent {
  id: string;
  name: string;
  shortName: string;
  role: string;
  description: string;
  status: AgentStatus;
  confidence: number; // 0 - 100
  lastRunTimestamp: string;
  latencyMs: number;
  inputSources: string[];
  currentTask: string;
  keyFindings: string[];
  riskLevel: 'Critical' | 'High' | 'Medium-High' | 'Medium' | 'Low';
  toolCalls: AgentToolCall[];
  structuredOutput: Record<string, any>;
  reasoningChain: string[];
  icon: string;
  color: string;
}

export interface PlanAssignment {
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  incidentId: string;
  incidentName: string;
  action: 'Assign' | 'Reallocate' | 'Widen Role' | 'Standby' | 'Release';
  notes: string;
  etaMinutes: number;
  routeDetails: string;
  previousAssignment?: string;
}

export interface PlanOption {
  id: string;
  title: string;
  subtitle: string;
  isRecommended: boolean;
  incidentsCovered: number;
  totalIncidents: number;
  resourcesAssigned: number;
  estimatedTotalHours: number;
  successProbabilityPercent: number;
  riskScore: 'Low' | 'Medium' | 'High' | 'Critical';
  expectedOutcomes: string[];
  tradeOffSummary: string;
  assignments: PlanAssignment[];
  delayedIncidentIds: string[];
  delayedReasons: Record<string, string>;
  confidenceScore: number;
}

export interface PlanDiffItem {
  resourceId?: string;
  resourceName: string;
  previousAssignment: string;
  newAssignment: string;
  reason: string;
  consequence?: string;
  type: 'reallocated' | 'added' | 'delayed' | 'expanded' | 'preserved' | 'removed';
}

export interface HumanReviewFlag {
  id: number;
  title: string;
  reason: string;
  severity: 'Critical' | 'High' | 'Medium';
  affectedIncidents: string[];
  affectedResources: string[];
  acknowledged: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'SCENARIO_TRIGGER'
    | 'AI_ANALYSIS_STARTED'
    | 'AI_ANALYSIS_COMPLETED'
    | 'OPTIMIZATION_SOLVED'
    | 'PLAN_GENERATED'
    | 'HUMAN_APPROVAL'
    | 'HUMAN_REJECTION'
    | 'RESOURCE_STATE_CHANGE'
    | 'INCIDENT_ESCALATION';
  actor: string;
  summary: string;
  details: Record<string, any>;
  confidence?: number;
  requiresReview?: boolean;
}

export type ScenarioPhase =
  | 'T0_INITIAL'
  | 'T0_PLUS_10_CRISIS'
  | 'REPLANNING_IN_PROGRESS'
  | 'REVISED_PLAN_READY'
  | 'PLAN_APPROVED'
  | 'DISPATCH_IN_PROGRESS';

export type UserRole = 'USER'
  | 'Control Room Operator'
  | 'Emergency Responder'
  | 'Agriculture Agency'
  | 'Wildlife & Conservation'
  | 'Local Authority';

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
}

export type ActiveTab =
  | 'landing'
  | 'login'
  | 'register'
  | 'profile'
  | 'dashboard'
  | 'user-dashboard'
  | 'map'
  | 'incidents'
  | 'incident-details'
  | 'resources'
  | 'agents'
  | 'plans'
  | 'plan-diff'
  | 'replanning'
  | 'trade-offs'
  | 'approval'
  | 'audit'
  | 'settings';

export interface ObjectiveWeights {
  lifeSafety: number;
  agriculture: number;
  ecosystem: number;
  fleetStress: number;
  travelLogistics: number;
  provenance?: string;
}

export interface PlanComparisonDimension {
  dimension: 'lifeSafety' | 'agriculture' | 'ecosystem' | 'fleetStress' | 'travelLogistics';
  displayName: string;
  unit: string;
  weight: number;
  provenance: string;
  scores: Record<string, number>; // planId -> 0..100
  metrics: Record<string, {
    label: string;
    value: string | number;
    provenance: string;
  }>;
}

export interface PlanComparisonSummary {
  comparisonTimestamp: string;
  plans: Array<{
    planId: string;
    optionKey: string;
    title: string;
    description: string;
    objectiveScore: number;
    confidenceScore: number;
    status: 'Pending Approval' | 'Approved' | 'Active' | 'Rejected';
    weights: ObjectiveWeights;
    dimensions: Record<string, number>;
  }>;
  matrix: PlanComparisonDimension[];
  recommendedPlanId: string;
  recommendationRationale: string;
  provenance: string;
}

export interface SensitivityAnalysisResult {
  customWeights: ObjectiveWeights;
  calculatedAt: string;
  rankings: Array<{
    planId: string;
    optionKey: string;
    title: string;
    originalObjectiveScore: number;
    adjustedUtilityScore: number;
    rankDelta: number;
    rationale: string;
  }>;
  summary: string;
  provenance: string;
}

export interface IncidentDependency {
  id: string;
  sourceIncidentId: string;
  targetIncidentId: string;
  dependencyType: 'AccessBlockage' | 'ThreatSpread' | 'ResourceDrain' | 'InfrastructureFailure' | 'CascadingRisk';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  provenance: string;
  createdAt: string;
}

export interface ThreatPropagationResult {
  sourceIncidentId: string;
  affectedIncidentIds: string[];
  cascadingImpacts: Array<{
    targetIncidentId: string;
    targetIncidentName: string;
    dependencyType: string;
    consequence: string;
    operationalAdvice: string;
    provenance: string;
  }>;
  propagationDepth: number;
  provenance: string;
}

