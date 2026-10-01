import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { defaultPipelineRunner } from '../agents/pipeline.js';
import { agentRepository } from '../db/repositories/agentRepository.js';
import { ApiResponse } from '../types/api.js';

const runPipelineSchema = z.object({
  incidentIds: z.array(z.string()).optional(),
  planId: z.string().optional(),
});

export const agentController = {
  async runPipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { incidentIds, planId } = runPipelineSchema.parse(req.body || {});

      const result = await defaultPipelineRunner.runPipeline({
        incidentIds,
        planId,
        correlationId: req.correlationId,
      });

      const response: ApiResponse = {
        data: result,
        meta: {
          executionId: result.executionId,
          status: result.status,
          agentsExecuted: Object.keys(result.agentResults).length,
          errorsCount: result.errors.length,
        },
        correlationId: req.correlationId,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getRunsByPlanId(req: Request, res: Response, next: NextFunction) {
    try {
      const planId = Array.isArray(req.params.planId) ? req.params.planId[0] : (req.params.planId as string);
      const runs = await agentRepository.findRunsByPlanId(planId);

      const response: ApiResponse = {
        data: runs,
        meta: { count: runs.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getFindingsByRunId(req: Request, res: Response, next: NextFunction) {
    try {
      const runId = Array.isArray(req.params.runId) ? req.params.runId[0] : (req.params.runId as string);
      const findings = await agentRepository.findFindingsByRunId(runId);

      const response: ApiResponse = {
        data: findings,
        meta: { count: findings.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },
};
