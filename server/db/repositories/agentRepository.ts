import { query, withTransaction } from '../pool.js';
import { AgentResult, AgentFinding } from '../../agents/types.js';

export interface DbAgentRun {
  id: string;
  plan_id?: string;
  agent_role: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  confidence_score: number;
  started_at: Date;
  completed_at?: Date;
  inputs_metadata: Record<string, any>;
  outputs_metadata: Record<string, any>;
}

export interface DbAgentFindingRecord {
  id?: number;
  agent_run_id: string;
  finding_type: string;
  confidence: number;
  payload: Record<string, any>;
  evidence_references: string[];
  recommendations: string[];
  created_at?: Date;
}

export const agentRepository = {
  // Persist single agent run with all findings atomically
  async saveAgentRun(result: AgentResult, planId?: string): Promise<DbAgentRun> {
    return withTransaction(async (client) => {
      const runStatus = result.status === 'SUCCESS' ? 'Completed' : 'Failed';
      const confidencePercent = Math.round((result.confidence?.score || 0) * 1000) / 10;

      const runRes = await client.query<DbAgentRun>(
        `
        INSERT INTO agent_runs (
          id, plan_id, agent_role, status, confidence_score,
          started_at, completed_at, inputs_metadata, outputs_metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          confidence_score = EXCLUDED.confidence_score,
          completed_at = EXCLUDED.completed_at,
          outputs_metadata = EXCLUDED.outputs_metadata
        RETURNING *;
      `,
        [
          result.runId,
          planId || null,
          result.role,
          runStatus,
          confidencePercent,
          new Date(result.startedAt),
          new Date(result.completedAt),
          JSON.stringify({ agentId: result.agentId, name: result.name }),
          JSON.stringify({
            findingsCount: result.findings.length,
            recommendationsCount: result.recommendations.length,
            constraintsCount: result.constraints.length,
            error: result.error || null,
            rawOutput: result.rawOutput || null,
          }),
        ]
      );

      // Save individual findings
      for (const f of result.findings) {
        const evidenceRefs = f.evidence.map((e) => `${e.type}:${e.source}:${e.reference || ''}`);
        const recTexts = result.recommendations.map((r) => `[${r.priority}] ${r.action}: ${r.rationale}`);

        await client.query(
          `
          INSERT INTO agent_findings (
            agent_run_id, finding_type, confidence, payload,
            evidence_references, recommendations
          ) VALUES ($1, $2, $3, $4, $5, $6);
        `,
          [
            result.runId,
            f.findingType,
            Math.round((f.confidence?.score || result.confidence?.score || 0) * 1000) / 10,
            JSON.stringify({
              summary: f.summary,
              details: f.details,
              rationale: f.confidence?.rationale,
              limitations: f.confidence?.limitations,
            }),
            evidenceRefs,
            recTexts,
          ]
        );
      }

      return runRes.rows[0];
    });
  },

  // Retrieve runs by plan ID or role
  async findRunsByPlanId(planId: string): Promise<DbAgentRun[]> {
    const res = await query<DbAgentRun>(
      `
      SELECT * FROM agent_runs
      WHERE plan_id = $1
      ORDER BY started_at ASC;
    `,
      [planId]
    );
    return res.rows;
  },

  // Retrieve findings for a given agent run
  async findFindingsByRunId(runId: string): Promise<DbAgentFindingRecord[]> {
    const res = await query<DbAgentFindingRecord>(
      `
      SELECT * FROM agent_findings
      WHERE agent_run_id = $1
      ORDER BY id ASC;
    `,
      [runId]
    );
    return res.rows;
  },
};
