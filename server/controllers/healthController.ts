import { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/healthService.js';

export const healthController = {
  async getHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await healthService.getHealthStatus();
      const statusCode = health.status === 'ok' ? 200 : 200; // Returns 200 with degraded report if offline

      res.status(statusCode).json({
        ...health,
        correlationId: req.correlationId,
      });
    } catch (err) {
      next(err);
    }
  },
};
