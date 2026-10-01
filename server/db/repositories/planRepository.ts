import { query, withTransaction } from '../pool.js';

export interface DbPlanAssignment {
  id?: number;
  plan_id: string;
  resource_id: string;
  incident_id: string;
  action: 'Assign' | 'Reallocate' | 'Standby' | 'Release';
  eta_minutes: number;
  route_details?: string;
  notes?: string;
  resource_name?: string;
  resource_type?: string;
  incident_name?: string;
}

export interface DbPlanChange {
  id?: number;
  plan_id: string;
  change_type: 'added' | 'reallocated' | 'delayed' | 'removed' | 'preserved';
  resource_id?: string;
  resource_name?: string;
  previous_assignment?: string;
  new_assignment?: string;
  reason: string;
  consequence?: string;
}

export interface DbPlan {
  id: string;
  version: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Active' | 'Superseded' | 'Rejected';
  source_scenario: string;
  confidence_score: number;
  objective_score: number;
  generated_at: Date;
  metadata: Record<string, any>;
  assignments?: DbPlanAssignment[];
  changes?: DbPlanChange[];
  created_at: Date;
  updated_at: Date;
}

export const planRepository = {
  // Find current active plan with all assignments and plan diff changes
  async findActivePlan(): Promise<DbPlan | null> {
    const planRes = await query<DbPlan>(`
      SELECT id, version, status, source_scenario, confidence_score, objective_score, generated_at, metadata, created_at, updated_at
      FROM plans
      WHERE status = 'Active'
      ORDER BY version DESC, updated_at DESC
      LIMIT 1;
    `);

    if (!planRes.rows[0]) return null;
    const plan = planRes.rows[0];

    const assignRes = await query<DbPlanAssignment>(
      `
      SELECT 
        pa.id, pa.plan_id, pa.resource_id, pa.incident_id, pa.action, pa.eta_minutes, pa.route_details, pa.notes,
        r.name AS resource_name, r.resource_type AS resource_type,
        i.name AS incident_name
      FROM plan_assignments pa
      LEFT JOIN resources r ON pa.resource_id = r.id
      LEFT JOIN incidents i ON pa.incident_id = i.id
      WHERE pa.plan_id = $1
      ORDER BY pa.id ASC;
    `,
      [plan.id]
    );

    const changesRes = await query<DbPlanChange>(
      `
      SELECT id, plan_id, change_type, resource_id, resource_name, previous_assignment, new_assignment, reason, consequence
      FROM plan_changes
      WHERE plan_id = $1
      ORDER BY id ASC;
    `,
      [plan.id]
    );

    plan.assignments = assignRes.rows;
    plan.changes = changesRes.rows;
    return plan;
  },

  // Save new plan version atomically with assignments and diff items
  async createPlanWithAssignments(
    plan: Omit<DbPlan, 'created_at' | 'updated_at'>,
    assignments: Omit<DbPlanAssignment, 'id' | 'plan_id'>[],
    changes: Omit<DbPlanChange, 'id' | 'plan_id'>[] = []
  ): Promise<DbPlan> {
    return withTransaction(async (client) => {
      // 1. If this plan is to be active, supersede previous active plans
      if (plan.status === 'Active') {
        await client.query(`
          UPDATE plans
          SET status = 'Superseded', updated_at = NOW()
          WHERE status = 'Active';
        `);
      }

      // 2. Insert plan record
      await client.query(
        `
        INSERT INTO plans (
          id, version, status, source_scenario, confidence_score, objective_score, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [
          plan.id,
          plan.version,
          plan.status,
          plan.source_scenario,
          plan.confidence_score,
          plan.objective_score,
          JSON.stringify(plan.metadata || {}),
        ]
      );

      // 3. Insert assignments
      for (const a of assignments) {
        await client.query(
          `
          INSERT INTO plan_assignments (
            plan_id, resource_id, incident_id, action, eta_minutes, route_details, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [plan.id, a.resource_id, a.incident_id, a.action, a.eta_minutes, a.route_details || null, a.notes || null]
        );
      }

      // 4. Insert plan diff items
      for (const c of changes) {
        await client.query(
          `
          INSERT INTO plan_changes (
            plan_id, change_type, resource_id, resource_name, previous_assignment, new_assignment, reason, consequence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            plan.id,
            c.change_type,
            c.resource_id || null,
            c.resource_name || null,
            c.previous_assignment || null,
            c.new_assignment || null,
            c.reason,
            c.consequence || null,
          ]
        );
      }

      const created = await client.query<DbPlan>(`SELECT * FROM plans WHERE id = $1`, [plan.id]);
      return created.rows[0];
    });
  },
};
