import { Request, Response, NextFunction } from 'express';
import { planService } from '../services/planService.js';
import { candidatePlanService } from '../services/candidatePlanService.js';
import { planComparisonService } from '../services/planComparisonService.js';
import { planQuerySchema } from '../validators/planValidator.js';
import { ApiResponse } from '../types/api.js';

export const planController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = planQuerySchema.parse(req.query);
      const plans = await planService.listPlans(filters);

      const response: ApiResponse = {
        data: plans,
        meta: { count: plans.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.getActivePlan();

      const response: ApiResponse = {
        data: plan,
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = candidatePlanService.generateCandidatePlans();
      const response: ApiResponse = {
        data: candidates,
        meta: {
          count: candidates.length,
          recommended: candidates.find((c) => c.isRecommended)?.planId,
          provenance: '[GOVERNANCE CONSTRAINT / CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
        },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async comparePlans(req: Request, res: Response, next: NextFunction) {
    try {
      const comparison = planComparisonService.comparePlans();
      const response: ApiResponse = {
        data: comparison,
        meta: {
          dimensionsCount: comparison.matrix.length,
          recommendedPlanId: comparison.recommendedPlanId,
          provenance: comparison.provenance,
        },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async calculateSensitivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { lifeSafety, agriculture, ecosystem, fleetStress, travelLogistics } = req.body || {};
      const weights = {
        lifeSafety: typeof lifeSafety === 'number' ? lifeSafety : 0.5,
        agriculture: typeof agriculture === 'number' ? agriculture : 0.2,
        ecosystem: typeof ecosystem === 'number' ? ecosystem : 0.15,
        fleetStress: typeof fleetStress === 'number' ? fleetStress : 0.075,
        travelLogistics: typeof travelLogistics === 'number' ? travelLogistics : 0.075,
      };

      const result = planComparisonService.calculateSensitivity(weights);
      const response: ApiResponse = {
        data: result,
        meta: {
          topRecommended: result.rankings[0]?.planId,
          isSimulation: true,
          status: 'Read-only sensitivity evaluation; operational state unmutated.',
          provenance: result.provenance,
        },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const plan = await planService.getPlanById(id);

      const response: ApiResponse = {
        data: plan,
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getDiff(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const diff = await planService.getPlanDiff(id);

      const response: ApiResponse = {
        data: diff,
        meta: {
          planId: id,
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
