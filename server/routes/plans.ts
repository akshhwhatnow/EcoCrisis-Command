import { Router } from 'express';
import { planController } from '../controllers/planController.js';

export const planRouter = Router();

planRouter.get('/', planController.list);
planRouter.get('/active', planController.getActive);
planRouter.get('/candidates', planController.getCandidates);
planRouter.get('/compare', planController.comparePlans);
planRouter.post('/sensitivity', planController.calculateSensitivity);
planRouter.get('/:id/diff', planController.getDiff);
planRouter.get('/:id', planController.getById);
