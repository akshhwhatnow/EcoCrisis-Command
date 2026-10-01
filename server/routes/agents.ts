import { Router } from 'express';
import { agentController } from '../controllers/agentController.js';

export const agentRouter = Router();

agentRouter.post('/run', agentController.runPipeline);
agentRouter.get('/runs/plan/:planId', agentController.getRunsByPlanId);
agentRouter.get('/findings/run/:runId', agentController.getFindingsByRunId);
