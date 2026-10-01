import { apiRequest } from './apiClient';
import { PlanOption, PlanDiffItem, ObjectiveWeights, PlanComparisonSummary, SensitivityAnalysisResult } from '../../types';

export const plansApi = {
  /**
   * List all plans
   */
  async listPlans(): Promise<any[]> {
    const res = await apiRequest<any[]>('/plans');
    return res.data;
  },

  /**
   * Get active response plan
   */
  async getActivePlan(): Promise<any> {
    const res = await apiRequest<any>('/plans/active');
    return res.data;
  },

  /**
   * Get candidate plans (Options 1, 2, 3)
   */
  async getCandidates(): Promise<any[]> {
    const res = await apiRequest<any[]>('/plans/candidates');
    return res.data;
  },

  /**
   * Get 5-dimension plan comparison summary & matrix
   */
  async getPlanComparison(): Promise<PlanComparisonSummary> {
    const res = await apiRequest<PlanComparisonSummary>('/plans/compare');
    return res.data;
  },

  /**
   * Calculate sensitivity analysis under custom weights (pure simulation)
   */
  async calculateSensitivity(weights: ObjectiveWeights): Promise<SensitivityAnalysisResult> {
    const res = await apiRequest<SensitivityAnalysisResult>('/plans/sensitivity', {
      method: 'POST',
      body: JSON.stringify(weights),
    });
    return res.data;
  },

  /**
   * Get plan by ID
   */
  async getPlanById(id: string): Promise<any> {
    const res = await apiRequest<any>(`/plans/${id}`);
    return res.data;
  },

  /**
   * Get itemized plan diff
   */
  async getPlanDiff(planId: string): Promise<{
    planId: string;
    parentPlanId?: string;
    totalChanges: number;
    addedCount: number;
    reallocatedCount: number;
    delayedCount: number;
    removedCount: number;
    preservedCount: number;
    items: PlanDiffItem[];
    summary: string;
  }> {
    const res = await apiRequest<any>(`/plans/${planId}/diff`);
    return res.data;
  },

  /**
   * Update plan status (Approve, Reject, Execute)
   */
  async updatePlanStatus(
    id: string,
    status: 'Draft' | 'Pending Approval' | 'Approved' | 'Executed' | 'Rejected',
    operatorNotes?: string
  ): Promise<any> {
    const res = await apiRequest<any>(`/plans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, operator_notes: operatorNotes }),
    });
    return res.data;
  },
};
