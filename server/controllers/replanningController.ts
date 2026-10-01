import { Request, Response, NextFunction } from 'express';
import { replanningService } from '../services/replanningService.js';
import { ApiResponse } from '../types/api.js';

export const replanningController = {
  /**
   * POST /api/v1/replanning/run
   * Triggers an on-demand dynamic replanning run
   */
  async runReplanning(req: Request, res: Response, next: NextFunction) {
    try {
      const correlationId = req.correlationId;
      const result = await replanningService.triggerT1Scenario(correlationId);

      const response: ApiResponse = {
        data: result,
        meta: {
          executionId: result.executionId,
          requiresHumanApproval: result.requiresHumanApproval,
          totalChanges: result.diff.totalChanges,
        },
        correlationId,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/replanning/diff/:planId
   * Retrieves the plan diff for a specified plan ID
   */
  async getDiff(req: Request, res: Response, next: NextFunction) {
    try {
      const planId = Array.isArray(req.params.planId) ? req.params.planId[0] : (req.params.planId as string);
      const diff = await replanningService.getPlanDiff(planId);

      const response: ApiResponse = {
        data: diff,
        meta: {
          planId,
          totalChanges: diff.totalChanges,
        },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },
};
