import { query } from '../pool.js';

export interface DbAuditEvent {
  id?: number;
  timestamp?: Date;
  actor_system: string;
  event_type: string;
  entity_type: string;
  entity_id?: string;
  action: string;
  payload: Record<string, any>;
  correlation_id?: string;
}

export const auditRepository = {
  // Append audit event to persistent log
  async logEvent(event: DbAuditEvent): Promise<DbAuditEvent> {
    const res = await query<DbAuditEvent>(
      `
      INSERT INTO audit_events (
        actor_system, event_type, entity_type, entity_id, action, payload, correlation_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, timestamp, actor_system, event_type, entity_type, entity_id, action, payload, correlation_id;
    `,
      [
        event.actor_system,
        event.event_type,
        event.entity_type,
        event.entity_id || null,
        event.action,
        JSON.stringify(event.payload || {}),
        event.correlation_id || null,
      ]
    );
    return res.rows[0];
  },

  // Retrieve recent audit history
  async findRecent(limit = 50): Promise<DbAuditEvent[]> {
    const res = await query<DbAuditEvent>(
      `
      SELECT id, timestamp, actor_system, event_type, entity_type, entity_id, action, payload, correlation_id
      FROM audit_events
      ORDER BY timestamp DESC, id DESC
      LIMIT $1;
    `,
      [limit]
    );
    return res.rows;
  },

  // Find audit history by correlation ID
  async findByCorrelationId(correlationId: string): Promise<DbAuditEvent[]> {
    const res = await query<DbAuditEvent>(
      `
      SELECT id, timestamp, actor_system, event_type, entity_type, entity_id, action, payload, correlation_id
      FROM audit_events
      WHERE correlation_id = $1
      ORDER BY timestamp ASC;
    `,
      [correlationId]
    );
    return res.rows;
  },
};
