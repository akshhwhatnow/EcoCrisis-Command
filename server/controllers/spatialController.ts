import { Request, Response, NextFunction } from 'express';
import { spatialService } from '../services/spatialService.js';
import { ApiResponse } from '../types/api.js';

export const spatialController = {
  async getLayers(req: Request, res: Response, next: NextFunction) {
    try {
      const layerType = req.query.type as string | undefined;
      const geojson = await spatialService.getSpatialLayers(layerType);

      const response: ApiResponse = {
        data: geojson,
        meta: { featureCount: geojson.features.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async getIncidents(req: Request, res: Response, next: NextFunction) {
    try {
      const geojson = await spatialService.getIncidentGeometries();

      const response: ApiResponse = {
        data: geojson,
        meta: { featureCount: geojson.features.length },
        correlationId: req.correlationId,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },
};
