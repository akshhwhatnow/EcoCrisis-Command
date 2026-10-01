import { Router } from 'express';
import { spatialController } from '../controllers/spatialController.js';

export const spatialRouter = Router();

spatialRouter.get('/layers', spatialController.getLayers);
spatialRouter.get('/incidents', spatialController.getIncidents);
