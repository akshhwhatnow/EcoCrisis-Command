import { Router } from 'express';
import { scenarioController } from '../controllers/scenarioController.js';

export const scenarioRouter = Router();

scenarioRouter.post('/t1', scenarioController.triggerT1);
scenarioRouter.post('/reset', scenarioController.reset);
scenarioRouter.get('/state', scenarioController.getState);
