import { query } from '../db/pool.js';
import { incidentRepository } from '../db/repositories/incidentRepository.js';

export const spatialService = {
  async getSpatialLayers(layerType?: string) {
    let sql = `
      SELECT 
        id, layer_type, name, sector, properties,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM spatial_layers
    `;
    const params: any[] = [];
    if (layerType) {
      sql += ` WHERE layer_type = $1`;
      params.push(layerType);
    }
    sql += ` ORDER BY name ASC;`;

    const res = await query(sql, params);

    const features = res.rows.map((row) => ({
      type: 'Feature' as const,
      id: row.id,
      properties: {
        id: row.id,
        layerType: row.layer_type,
        name: row.name,
        sector: row.sector,
        ...row.properties,
      },
      geometry: row.geometry,
    }));

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  },

  async getIncidentGeometries() {
    const incidents = await incidentRepository.findAllActive();

    const features = incidents.map((inc) => ({
      type: 'Feature' as const,
      id: inc.id,
      properties: {
        id: inc.id,
        name: inc.name,
        type: inc.incident_type,
        sector: inc.sector,
        severity: inc.severity,
        urgency: inc.urgency,
        status: inc.status,
        peopleAtRisk: inc.impact_people_at_risk,
        livestockCount: inc.impact_livestock_count,
        cropHectares: inc.impact_crop_hectares,
      },
      geometry: inc.location_geojson,
    }));

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  },
};
