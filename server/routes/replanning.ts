import { Router } from 'express';
import { replanningController } from '../controllers/replanningController.js';

export const replanningRouter = Router();

replanningRouter.post('/run', replanningController.runReplanning);
replanningRouter.get('/diff/:planId', replanningController.getDiff);
