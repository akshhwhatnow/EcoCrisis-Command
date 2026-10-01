import { Request, Response, NextFunction } from 'express';
import { incidentService } from '../services/incidentService.js';
import { incidentDependencyService } from '../services/incidentDependencyService.js';
import { createIncidentSchema, updateIncidentSchema, incidentQuerySchema } from '../validators/incidentValidator.js';
import { ApiResponse } from '../types/api.js';

export const incidentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = incidentQuerySchema.parse(req.query);
      const incidents = await incidentService.listIncidents(filters);

      const response: ApiResponse = {
        data: incidents,
        meta: { count: incidents.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getAllDependencies(req: Request, res: Response, next: NextFunction) {
    try {
      const dependencies = await incidentDependencyService.getAllDependencies();
      const response: ApiResponse = {
        data: dependencies,
        meta: {
          count: dependencies.length,
          provenance: '[GOVERNANCE CONSTRAINT / CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
        },
        correlationId: req.correlationId,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getIncidentDependencies(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const result = await incidentDependencyService.getDependenciesForIncident(id);
      const response: ApiResponse = {
        data: result,
        correlationId: req.correlationId,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async addDependency(req: Request, res: Response, next: NextFunction) {
    try {
      const { sourceIncidentId, targetIncidentId, dependencyType, severity, description, provenance } = req.body;
      const created = await incidentDependencyService.addDependency({
        sourceIncidentId,
        targetIncidentId,
        dependencyType,
        severity,
        description,
        provenance,
      });

      const response: ApiResponse = {
        data: created,
        correlationId: req.correlationId,
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  },

  async deleteDependency(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const deleted = await incidentDependencyService.deleteDependency(id);
      const response: ApiResponse = {
        data: { success: deleted, id },
        correlationId: req.correlationId,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getThreatPropagation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const propagation = await incidentDependencyService.propagateThreat(id);
      const response: ApiResponse = {
        data: propagation,
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
      const incident = await incidentService.getIncidentById(id);

      const response: ApiResponse = {
        data: incident,
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createIncidentSchema.parse(req.body);
      const created = await incidentService.createIncident(validated);

      const response: ApiResponse = {
        data: created,
        correlationId: req.correlationId,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = updateIncidentSchema.parse(req.body);
      const updated = await incidentService.updateIncident(id, validated);

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
