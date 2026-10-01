import { Router } from 'express';
import { incidentController } from '../controllers/incidentController.js';

export const incidentRouter = Router();

incidentRouter.get('/', incidentController.list);
incidentRouter.get('/dependencies/all', incidentController.getAllDependencies);
incidentRouter.delete('/dependencies/:id', incidentController.deleteDependency);
incidentRouter.get('/:id/dependencies', incidentController.getIncidentDependencies);
incidentRouter.post('/:id/dependencies', incidentController.addDependency);
incidentRouter.get('/:id/threat-propagation', incidentController.getThreatPropagation);
incidentRouter.get('/:id', incidentController.getById);
incidentRouter.post('/', incidentController.create);
incidentRouter.patch('/:id', incidentController.update);
