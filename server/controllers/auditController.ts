import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/auditService.js';
import { ApiResponse } from '../types/api.js';

export const auditController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const eventType = req.query.eventType as string | undefined;

      const events = await auditService.listAuditEvents({ limit, eventType });

      const response: ApiResponse = {
        data: events,
        meta: { count: events.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getByCorrelationId(req: Request, res: Response, next: NextFunction) {
    try {
      const correlationId = Array.isArray(req.params.correlationId) ? req.params.correlationId[0] : (req.params.correlationId as string);
      const events = await auditService.getEventsByCorrelationId(correlationId);

      const response: ApiResponse = {
        data: events,
        meta: { count: events.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async recordApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const { planId, operatorRole, operatorNotes, action } = req.body;
      const event = await auditService.logApproval({
        planId: planId || 'PLAN-T1-REVISED',
        operatorRole: operatorRole || 'Control Room Operator',
        operatorNotes,
        action: action || 'APPROVE',
        correlationId: req.correlationId,
      });

      const response: ApiResponse = {
        data: {
          status: 'LOGGED',
          action: action || 'APPROVE',
          auditEvent: event,
        },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },
};
