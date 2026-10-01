import { Request, Response, NextFunction } from 'express';
import { resourceService } from '../services/resourceService.js';
import { updateResourceStatusSchema, resourceQuerySchema } from '../validators/resourceValidator.js';
import { ApiResponse } from '../types/api.js';

export const resourceController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = resourceQuerySchema.parse(req.query);
      const resources = await resourceService.listResources(filters);

      const response: ApiResponse = {
        data: resources,
        meta: { count: resources.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const resource = await resourceService.getResourceById(id);

      const response: ApiResponse = {
        data: resource,
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const { status } = updateResourceStatusSchema.parse(req.body);
      const updated = await resourceService.updateResourceStatus(id, status);

      const response: ApiResponse = {
        data: updated,
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },
};
