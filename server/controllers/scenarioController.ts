import { Request, Response, NextFunction } from 'express';
import { replanningService } from '../services/replanningService.js';
import { incidentService } from '../services/incidentService.js';
import { resourceService } from '../services/resourceService.js';
import { planService } from '../services/planService.js';
import { ApiResponse } from '../types/api.js';

export const scenarioController = {
  /**
   * POST /api/v1/scenario/t1
   * Trigger T1 Disruption Scenario (I-4 created + Vehicle A failure + Dynamic Replanning)
   */
  async triggerT1(req: Request, res: Response, next: NextFunction) {
    try {
      const correlationId = req.correlationId;
      const result = await replanningService.triggerT1Scenario(correlationId);

      const response: ApiResponse = {
        data: result,
        meta: {
          scenario: 'T1',
          executionId: result.executionId,
          totalChanges: result.diff.totalChanges,
          requiresHumanApproval: result.requiresHumanApproval,
        },
        correlationId,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/scenario/state
   * Returns current operational state across incidents, resources, and active plan
   */
  async getState(req: Request, res: Response, next: NextFunction) {
    try {
      let incidents: any[] = [];
      let resources: any[] = [];
      let activePlan: any = null;

      try {
        incidents = await incidentService.listIncidents({});
      } catch {
        const { INITIAL_INCIDENTS } = await import('../../src/data/seedData.js');
        incidents = INITIAL_INCIDENTS;
      }

      try {
        resources = await resourceService.listResources({});
      } catch {
        const { INITIAL_RESOURCES } = await import('../../src/data/seedData.js');
        resources = INITIAL_RESOURCES;
      }

      try {
        activePlan = await planService.getActivePlan();
      } catch {
        activePlan = { id: 'PLAN-T0-BASE', version: 1, status: 'Active', source_scenario: 'T0' };
      }

      const isT1 =
        incidents.some((i: any) => i.id === 'I-4') ||
        resources.some((r: any) => (r.id === 'RES-VEH-A' || r.id === 'RES-EVAC-A') && (r.status === 'Unavailable' || r.state === 'Unavailable'));

      const response: ApiResponse = {
        data: {
          currentPhase: isT1 ? 'T1_DISRUPTION' : 'T0_BASELINE',
          activeIncidentsCount: incidents.filter((i: any) => i.status !== 'Resolved').length,
          availableResourcesCount: resources.filter((r: any) => r.status === 'Available' || r.state === 'Available' || r.state === 'En route' || r.state === 'Assigned').length,
          unavailableResourcesCount: resources.filter((r: any) => r.status === 'Unavailable' || r.state === 'Unavailable').length,
          activePlanId: activePlan?.id || 'PLAN-T0-BASE',
          incidents,
          resources,
          activePlan,
        },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/scenario/reset
   * Reset the scenario back to T0 baseline in database and memory
   */
  async reset(req: Request, res: Response, next: NextFunction) {
    try {
      const correlationId = req.correlationId;
      const result = await replanningService.resetScenario(correlationId);

      const response: ApiResponse = {
        data: result,
        meta: {
          scenario: 'T0',
          reset: true,
          timestamp: new Date().toISOString(),
        },
        correlationId,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },
};

