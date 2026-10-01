import express, { Express } from 'express';
import cors from 'cors';
import { correlationIdMiddleware } from './middleware/correlationId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

import { incidentRouter } from './routes/incidents.js';
import { resourceRouter } from './routes/resources.js';
import { planRouter } from './routes/plans.js';
import { auditRouter } from './routes/audit.js';
import { spatialRouter } from './routes/spatial.js';
import { healthRouter } from './routes/health.js';
import { agentRouter } from './routes/agents.js';
import { scenarioRouter } from './routes/scenario.js';
import { replanningRouter } from './routes/replanning.js';
import { legacyRouter } from './routes/legacy.js';
import authRouter from './routes/auth.js';

export function createApp(): Express {
  const app = express();

  // Production & Development CORS Configuration
  const configuredOrigins = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN;
  const allowedOriginsList = configuredOrigins
    ? configuredOrigins.split(',').map(s => s.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'https://eco-crisis-command.vercel.app',
      ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOriginsList.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin ${origin} not allowed`));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    })
  );
  app.use(express.json());
  app.use(correlationIdMiddleware);
  app.use(requestLogger);

  // Modular API v1 Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/incidents', incidentRouter);
  app.use('/api/v1/resources', resourceRouter);
  app.use('/api/v1/plans', planRouter);
  app.use('/api/v1/audit', auditRouter);
  app.use('/api/v1/spatial', spatialRouter);
  app.use('/api/v1/agents', agentRouter);
  app.use('/api/v1/scenario', scenarioRouter);
  app.use('/api/v1/replanning', replanningRouter);

  // Legacy API Routes (Maintained for backward compatibility during Phase 2)
  app.use('/api/auth', authRouter); // Also mount at /api/auth for frontend
  app.use('/api', legacyRouter);


  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
