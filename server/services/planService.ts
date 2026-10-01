import { planRepository, DbPlan } from '../db/repositories/planRepository.js';
import { query } from '../db/pool.js';
import { AppError } from '../types/api.js';

export const planService = {
  async listPlans(filters: { status?: string; limit?: number }): Promise<DbPlan[]> {
    const limit = filters.limit || 20;
    let sql = `
      SELECT id, version, status, source_scenario, confidence_score, objective_score, generated_at, metadata, created_at, updated_at
      FROM plans
    `;
    const params: any[] = [];

    if (filters.status) {
      sql += ` WHERE status = $1`;
      params.push(filters.status);
      sql += ` ORDER BY version DESC, created_at DESC LIMIT $2`;
      params.push(limit);
    } else {
      sql += ` ORDER BY version DESC, created_at DESC LIMIT $1`;
      params.push(limit);
    }

    const res = await query<DbPlan>(sql, params);
    return res.rows;
  },

  async getActivePlan(): Promise<DbPlan> {
    const plan = await planRepository.findActivePlan();
    if (!plan) {
      throw new AppError('No active response plan found', 404, 'ACTIVE_PLAN_NOT_FOUND');
    }
    return plan;
  },

  async getPlanById(id: string): Promise<DbPlan> {
    const planRes = await query<DbPlan>(
      `
      SELECT id, version, status, source_scenario, confidence_score, objective_score, generated_at, metadata, created_at, updated_at
      FROM plans
      WHERE id = $1;
    `,
      [id]
    );

    if (!planRes.rows[0]) {
      throw new AppError(`Plan not found with ID: ${id}`, 404, 'PLAN_NOT_FOUND');
    }
    const plan = planRes.rows[0];

    const assignRes = await query(
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

    const changesRes = await query(
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

  async getPlanDiff(id: string) {
    const { replanningService } = await import('./replanningService.js');
    return replanningService.getPlanDiff(id);
  },
};

