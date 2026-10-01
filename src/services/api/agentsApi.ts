import { apiRequest } from './apiClient';

export interface AgentPipelineRunResult {
  executionId: string;
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL';
  startTime: string;
  endTime: string;
  durationMs: number;
  overallConfidence: number;
  agentResults: Record<string, {
    agentId: string;
    agentRole: string;
    status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
    confidence: number;
    findings: Array<{
      id: string;
      findingType: string;
      summary: string;
      details: Record<string, any>;
      confidence: number;
      provenance: string;
      citations: string[];
    }>;
    proposedActions: any[];
    durationMs: number;
    error?: string;
  }>;
  errors: string[];
}

export const agentsApi = {
  /**
   * Run the 8-agent multi-agent pipeline
   */
  async runPipeline(triggerReason?: string): Promise<AgentPipelineRunResult> {
    const res = await apiRequest<AgentPipelineRunResult>('/agents/run', {
      method: 'POST',
      body: JSON.stringify({ triggerReason: triggerReason || 'Command Center Pipeline Run' }),
    });
    return res.data;
  },

  /**
   * List registered agents
   */
  async listAgents(): Promise<any[]> {
    const res = await apiRequest<any[]>('/agents');
    return res.data;
  },
};
