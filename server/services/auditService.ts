import { auditRepository, DbAuditEvent } from '../db/repositories/auditRepository.js';

export const auditService = {
  async listAuditEvents(filters: { limit?: number; eventType?: string }): Promise<DbAuditEvent[]> {
    try {
      const events = await auditRepository.findRecent(filters.limit || 50);
      if (filters.eventType) {
        return events.filter((e) => e.event_type === filters.eventType);
      }
      return events;
    } catch {
      // In-memory fallback if database offline
      const { INITIAL_AUDIT_LOG } = await import('../../src/data/seedData.js');
      return INITIAL_AUDIT_LOG.map((log: any, idx: number) => ({
        id: idx + 1,
        actor_system: log.actor || 'System Orchestrator',
        event_type: log.eventType || 'SCENARIO_TRIGGER',
        entity_type: 'System',
        entity_id: log.id,
        action: log.summary,
        payload: log.details || {},
        correlation_id: `CORR-INIT-${idx}`,
        timestamp: new Date(),
      }));
    }
  },

  async getEventsByCorrelationId(correlationId: string): Promise<DbAuditEvent[]> {
    try {
      return await auditRepository.findByCorrelationId(correlationId);
    } catch {
      return [];
    }
  },

  async recordEvent(event: DbAuditEvent): Promise<DbAuditEvent> {
    try {
      return await auditRepository.logEvent(event);
    } catch {
      return {
        id: Date.now(),
        timestamp: new Date(),
        ...event,
      };
    }
  },

  async logApproval(params: {
    planId: string;
    operatorRole: string;
    operatorNotes?: string;
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
    correlationId?: string;
  }): Promise<DbAuditEvent> {
    const event: DbAuditEvent = {
      actor_system: params.operatorRole || 'Control Room Operator',
      event_type: params.action === 'APPROVE' ? 'HUMAN_APPROVAL' : 'HUMAN_REJECTION',
      entity_type: 'Plan',
      entity_id: params.planId,
      action: params.action,
      payload: {
        operator_notes: params.operatorNotes || '',
        status: params.action === 'APPROVE' ? 'Approved' : 'Rejected',
        timestamp: new Date().toISOString(),
      },
      correlation_id: params.correlationId || `CORR-APP-${Date.now()}`,
    };

    return this.recordEvent(event);
  },
};
