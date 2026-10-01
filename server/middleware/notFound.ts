import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/api.js';

export function notFoundHandler(req: Request, res: Response): void {
  const correlationId = req.correlationId || 'N/A';
  const response: ApiErrorResponse = {
    error: {
      code: 'NOT_FOUND',
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
    },
    correlationId,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}
