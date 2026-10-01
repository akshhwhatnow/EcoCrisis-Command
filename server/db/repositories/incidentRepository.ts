import { query, withTransaction } from '../pool.js';

export interface DbIncident {
  id: string;
  external_ref?: string;
  name: string;
  incident_type: string;
  sector: string;
  severity: 'Critical' | 'High' | 'Medium-High' | 'Medium' | 'Low';
  urgency: 'Immediate' | 'Hours' | 'Monitoring';
  status: 'Active' | 'Contained' | 'Escalating' | 'Delayed' | 'Resolved';
  description: string;
  accessibility_status: string;
  river_route_available: boolean;
  impact_people_at_risk: number;
  impact_livestock_count: number;
  impact_crop_hectares: number;
  impact_wildlife_species: string[];
  impact_infrastructure_risk: string[];
  impact_habitat_area_km2: number;
  location_geojson?: any;
  perimeter_geojson?: any;
  created_at: Date;
  updated_at: Date;
}

export const incidentRepository = {
  // Find all active incidents with GeoJSON geometry representations
  async findAllActive(): Promise<DbIncident[]> {
    const res = await query<DbIncident>(`
      SELECT 
        id, external_ref, name, incident_type, sector, severity, urgency, status,
        description, accessibility_status, river_route_available,
        impact_people_at_risk, impact_livestock_count, impact_crop_hectares,
        impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        ST_AsGeoJSON(perimeter_geom)::json AS perimeter_geojson,
        created_at, updated_at
      FROM incidents
      WHERE status != 'Resolved'
      ORDER BY 
        CASE severity
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium-High' THEN 3
          WHEN 'Medium' THEN 4
          ELSE 5
        END ASC,
        created_at ASC;
    `);
    return res.rows;
  },

  // Find incident by ID
  async findById(id: string): Promise<DbIncident | null> {
    const res = await query<DbIncident>(
      `
      SELECT 
        id, external_ref, name, incident_type, sector, severity, urgency, status,
        description, accessibility_status, river_route_available,
        impact_people_at_risk, impact_livestock_count, impact_crop_hectares,
        impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        ST_AsGeoJSON(perimeter_geom)::json AS perimeter_geojson,
        created_at, updated_at
      FROM incidents
      WHERE id = $1;
    `,
      [id]
    );
    return res.rows[0] || null;
  },

  // Spatial query: find incidents within radius in meters using PostGIS ST_DWithin
  async findWithinRadius(lng: number, lat: number, radiusMeters: number): Promise<DbIncident[]> {
    const res = await query<DbIncident>(
      `
      SELECT 
        id, external_ref, name, incident_type, sector, severity, urgency, status,
        description, accessibility_status, river_route_available,
        impact_people_at_risk, impact_livestock_count, impact_crop_hectares,
        impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        ST_Distance(location_geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters,
        created_at, updated_at
      FROM incidents
      WHERE ST_DWithin(location_geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
      ORDER BY distance_meters ASC;
    `,
      [lng, lat, radiusMeters]
    );
    return res.rows;
  },

  // Create or update incident with spatial geometry
  async upsert(incident: Omit<DbIncident, 'created_at' | 'updated_at'> & { lng: number; lat: number; perimeterWkt?: string }): Promise<DbIncident> {
    const res = await query<DbIncident>(
      `
      INSERT INTO incidents (
        id, external_ref, name, incident_type, sector, severity, urgency, status,
        description, accessibility_status, river_route_available,
        impact_people_at_risk, impact_livestock_count, impact_crop_hectares,
        impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2,
        location_geom, perimeter_geom, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        ST_SetSRID(ST_MakePoint($18, $19), 4326),
        CASE WHEN $20::text IS NOT NULL THEN ST_SetSRID(ST_GeomFromText($20), 4326) ELSE NULL END,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        incident_type = EXCLUDED.incident_type,
        sector = EXCLUDED.sector,
        severity = EXCLUDED.severity,
        urgency = EXCLUDED.urgency,
        status = EXCLUDED.status,
        description = EXCLUDED.description,
        accessibility_status = EXCLUDED.accessibility_status,
        river_route_available = EXCLUDED.river_route_available,
        impact_people_at_risk = EXCLUDED.impact_people_at_risk,
        impact_livestock_count = EXCLUDED.impact_livestock_count,
        impact_crop_hectares = EXCLUDED.impact_crop_hectares,
        impact_wildlife_species = EXCLUDED.impact_wildlife_species,
        impact_infrastructure_risk = EXCLUDED.impact_infrastructure_risk,
        impact_habitat_area_km2 = EXCLUDED.impact_habitat_area_km2,
        location_geom = EXCLUDED.location_geom,
        perimeter_geom = EXCLUDED.perimeter_geom,
        updated_at = NOW()
      RETURNING 
        id, external_ref, name, incident_type, sector, severity, urgency, status,
        description, accessibility_status, river_route_available,
        impact_people_at_risk, impact_livestock_count, impact_crop_hectares,
        impact_wildlife_species, impact_infrastructure_risk, impact_habitat_area_km2,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        created_at, updated_at;
    `,
      [
        incident.id,
        incident.external_ref || null,
        incident.name,
        incident.incident_type,
        incident.sector,
        incident.severity,
        incident.urgency,
        incident.status,
        incident.description,
        incident.accessibility_status,
        incident.river_route_available,
        incident.impact_people_at_risk,
        incident.impact_livestock_count,
        incident.impact_crop_hectares,
        incident.impact_wildlife_species,
        incident.impact_infrastructure_risk,
        incident.impact_habitat_area_km2,
        incident.lng,
        incident.lat,
        incident.perimeterWkt || null,
      ]
    );
    return res.rows[0];
  },
};
