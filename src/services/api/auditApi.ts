import { apiRequest } from './apiClient';
import { AuditEntry } from '../../types';

export const auditApi = {
  /**
   * Fetch recent audit records from backend
   */
  async getRecentLogs(limit: number = 50): Promise<AuditEntry[]> {
    const res = await apiRequest<any[]>(`/audit/recent?limit=${limit}`);
    return res.data.map((a: any) => ({
      id: a.id || `AUD-${a.audit_id || Date.now()}`,
      timestamp: a.created_at ? new Date(a.created_at).toLocaleTimeString() : new Date().toLocaleTimeString(),
      eventType: a.event_type || 'SCENARIO_TRIGGER',
      actor: a.actor_system || a.actor || 'System Orchestrator',
      summary: a.action || a.summary || 'Operational Event',
      details: a.payload || a.details || {},
      confidence: a.confidence,
    }));
  },

  /**
   * Log human approval / authorization event to backend audit ledger
   */
  async logApproval(data: {
    planId: string;
    operatorRole: string;
    operatorNotes?: string;
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  }): Promise<any> {
    const res = await apiRequest<any>('/audit/approval', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};
