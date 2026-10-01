import { Router } from 'express';
import { resourceController } from '../controllers/resourceController.js';

export const resourceRouter = Router();

resourceRouter.get('/', resourceController.list);
resourceRouter.get('/:id', resourceController.getById);
resourceRouter.patch('/:id/status', resourceController.updateStatus);
