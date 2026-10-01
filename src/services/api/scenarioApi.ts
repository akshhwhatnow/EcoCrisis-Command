import { apiRequest } from './apiClient';

export interface ScenarioStateData {
  currentPhase: string;
  activeIncidentsCount: number;
  availableResourcesCount: number;
  unavailableResourcesCount: number;
  activePlanId: string;
  incidents: any[];
  resources: any[];
  activePlan: any;
}

export interface ScenarioT1Result {
  executionId: string;
  correlationId: string;
  sourceScenario: string;
  plan: any;
  diff: {
    planId: string;
    parentPlanId?: string;
    totalChanges: number;
    addedCount: number;
    reallocatedCount: number;
    delayedCount: number;
    removedCount: number;
    preservedCount: number;
    items: Array<{
      change_type: 'reallocated' | 'added' | 'delayed' | 'removed' | 'preserved';
      resource_id: string;
      resource_name: string;
      previous_assignment: string;
      new_assignment: string;
      reason: string;
      consequence?: string;
    }>;
    summary: string;
  };
  tradeoffs: Array<{
    sector: string;
    action: string;
    directConsequence: string;
    riskMitigation: string;
    acceptedRiskLevel: 'Low' | 'Medium' | 'High';
    rationale: string;
  }>;
  impactSummary: {
    peopleAtRiskTotal: number;
    livestockTotal: number;
    cropHectaresTotal: number;
    habitatAreaKm2Total: number;
    criticalIncidentsCount: number;
    isolatedCommunitiesCount: number;
  };
  agentResults: Record<string, any>;
  requiresHumanApproval: boolean;
  affectedIncidents: {
    directlyAffected: string[];
    reallocated: string[];
    delayed: string[];
    preserved: string[];
  };
}

export const scenarioApi = {
  /**
   * Fetches the authoritative scenario state from the backend
   */
  async getState(): Promise<ScenarioStateData> {
    const res = await apiRequest<ScenarioStateData>('/scenario/state');
    return res.data;
  },

  /**
   * Triggers the T1 Disruption Scenario (I-4 created + Vehicle A failure + Replanning)
   */
  async triggerT1(): Promise<ScenarioT1Result> {
    const res = await apiRequest<ScenarioT1Result>('/scenario/t1', {
      method: 'POST',
    });
    return res.data;
  },

  /**
   * Resets the backend scenario state to T0 baseline
   */
  async resetScenario(): Promise<{ success: boolean; message: string; timestamp: string }> {
    const res = await apiRequest<{ success: boolean; message: string; timestamp: string }>('/scenario/reset', {
      method: 'POST',
    });
    return res.data;
  },
};
