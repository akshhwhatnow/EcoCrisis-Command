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

  // Core Middleware
  app.use(cors());
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
