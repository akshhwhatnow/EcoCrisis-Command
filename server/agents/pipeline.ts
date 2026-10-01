import crypto from 'crypto';
import { AgentContext, AgentResult, PipelineExecutionResult, AgentRole } from './types.js';
import { AgentRegistry, defaultAgentRegistry } from './registry.js';
import { agentRepository } from '../db/repositories/agentRepository.js';
import { buildAgentContext } from './context.js';

export class AgentPipelineRunner {
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry = defaultAgentRegistry) {
    this.registry = registry;
  }

  async runPipeline(options?: {
    incidentIds?: string[];
    correlationId?: string;
    planId?: string;
    context?: AgentContext;
  }): Promise<PipelineExecutionResult> {
    const startedAt = new Date().toISOString();
    const executionId = `EXEC-PIPE-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const correlationId = options?.correlationId || crypto.randomUUID();

    // 1. Build or use provided AgentContext
    const context: AgentContext =
      options?.context ||
      (await buildAgentContext(options?.incidentIds, correlationId, options?.planId));

    context.executionId = executionId;

    const agentResults: Partial<Record<AgentRole, AgentResult>> = {};
    const errors: string[] = [];
    const agents = this.registry.getAllAgents();

    console.log(`\n🤖 [Agent Pipeline] Starting execution ${executionId} (${agents.length} agents in sequence)...`);

    // 2. Execute agents in strict sequential order
    for (const agent of agents) {
      const agentStart = new Date().toISOString();
      console.log(`  ▶ Running: ${agent.name} (${agent.role})...`);

      try {
        const result = await agent.execute(context);
        agentResults[agent.role] = result;
        context.previousResults[agent.role] = result;

        // Persist to database if available
        try {
          await agentRepository.saveAgentRun(result, context.planId);
        } catch (dbErr: any) {
          console.warn(`    ⚠️ Failed to persist agent run ${result.runId} to DB:`, dbErr.message);
        }

        console.log(`    ✅ Completed: ${agent.name} | Confidence: ${Math.round(result.confidence.score * 100)}% | Findings: ${result.findings.length}`);
      } catch (err: any) {
        const agentError = err.message || String(err);
        console.error(`    ❌ FAILED: ${agent.name}:`, agentError);
        errors.push(`${agent.role}: ${agentError}`);

        const failedResult: AgentResult = {
          agentId: agent.id,
          role: agent.role,
          name: agent.name,
          runId: `RUN-FAIL-${Date.now()}`,
          status: 'FAILED',
          startedAt: agentStart,
          completedAt: new Date().toISOString(),
          confidence: {
            score: 0.0,
            rationale: 'Agent execution encountered an unhandled exception.',
            limitations: [agentError],
          },
          findings: [],
          recommendations: [],
          constraints: [],
          evidence: [],
          error: agentError,
        };

        agentResults[agent.role] = failedResult;
        context.previousResults[agent.role] = failedResult;

        try {
          await agentRepository.saveAgentRun(failedResult, context.planId);
        } catch (dbErr: any) {
          console.warn(`    ⚠️ Failed to persist failed run to DB:`, dbErr.message);
        }
      }
    }

    const completedAt = new Date().toISOString();
    const isFullSuccess = errors.length === 0;
    const isCompleteFailure = Object.values(agentResults).every((r) => r?.status === 'FAILED');
    const overallStatus = isFullSuccess ? 'COMPLETED' : isCompleteFailure ? 'FAILED' : 'PARTIAL';

    // Extract Command/Planning synthesis
    const commandResult = agentResults['COMMAND_PLANNING'];
    const synthesis = commandResult?.findings.find((f) => f.findingType === 'COMMAND_PLAN_SYNTHESIS')?.details;

    console.log(`🏁 [Agent Pipeline] Execution finished with status '${overallStatus}' (${errors.length} errors).\n`);

    return {
      executionId,
      startedAt,
      completedAt,
      status: overallStatus,
      correlationId,
      incidentIds: context.incidentIds,
      agentResults,
      synthesis,
      errors,
    };
  }
}

export const defaultPipelineRunner = new AgentPipelineRunner();
