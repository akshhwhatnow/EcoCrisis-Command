import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ApiErrorResponse } from '../types/api.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const correlationId = req.correlationId || 'N/A';

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    const response: ApiErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed',
        details,
      },
      correlationId,
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(response);
    return;
  }

  // 2. Custom AppErrors
  if (err instanceof AppError) {
    const response: ApiErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      correlationId,
      timestamp: new Date().toISOString(),
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // 3. PostgreSQL Database Errors (Mask raw internals from client)
  if (err && (err.code || err.routine || err.severity)) {
    console.error(`[DB ERROR] [${correlationId}]`, err.message || err);

    let clientMessage = 'Database operation failed';
    let statusCode = 500;
    let errorCode = 'DATABASE_ERROR';

    // 23505 = unique_violation, 23503 = foreign_key_violation, 23514 = check_violation
    if (err.code === '23505') {
      clientMessage = 'A duplicate record already exists.';
      statusCode = 409;
      errorCode = 'DUPLICATE_RESOURCE';
    } else if (err.code === '23503') {
      clientMessage = 'Referenced entity does not exist.';
      statusCode = 400;
      errorCode = 'FOREIGN_KEY_VIOLATION';
    } else if (err.code === '23514') {
      clientMessage = 'Operation violates a domain constraint.';
      statusCode = 400;
      errorCode = 'CONSTRAINT_VIOLATION';
    }

    const response: ApiErrorResponse = {
      error: {
        code: errorCode,
        message: clientMessage,
      },
      correlationId,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
    return;
  }

  // 4. Generic Internal Server Errors
  console.error(`[UNHANDLED ERROR] [${correlationId}]`, err);

  const response: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
    },
    correlationId,
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(response);
}
