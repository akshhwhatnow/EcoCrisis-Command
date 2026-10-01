import { Router } from 'express';
import { auditController } from '../controllers/auditController.js';

export const auditRouter = Router();

auditRouter.get('/', auditController.list);
auditRouter.get('/recent', auditController.list);
auditRouter.post('/approval', auditController.recordApproval);
auditRouter.get('/:correlationId', auditController.getByCorrelationId);
