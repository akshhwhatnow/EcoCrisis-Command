import { query } from '../pool.js';

export interface DbResource {
  id: string;
  name: string;
  resource_type: string;
  status: 'Available' | 'En Route' | 'On Scene' | 'Unavailable' | 'Maintenance';
  capabilities: string[];
  capacity_people: number;
  capacity_cargo_tons: number;
  speed_kmh: number;
  location_geojson?: any;
  operational_metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export const resourceRepository = {
  // Find all resources
  async findAll(): Promise<DbResource[]> {
    const res = await query<DbResource>(`
      SELECT 
        id, name, resource_type, status, capabilities,
        capacity_people, capacity_cargo_tons, speed_kmh,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        operational_metadata, created_at, updated_at
      FROM resources
      ORDER BY name ASC;
    `);
    return res.rows;
  },

  // Find available resources
  async findAvailable(): Promise<DbResource[]> {
    const res = await query<DbResource>(`
      SELECT 
        id, name, resource_type, status, capabilities,
        capacity_people, capacity_cargo_tons, speed_kmh,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        operational_metadata, created_at, updated_at
      FROM resources
      WHERE status = 'Available'
      ORDER BY name ASC;
    `);
    return res.rows;
  },

  // Find resource by ID
  async findById(id: string): Promise<DbResource | null> {
    const res = await query<DbResource>(
      `
      SELECT 
        id, name, resource_type, status, capabilities,
        capacity_people, capacity_cargo_tons, speed_kmh,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        operational_metadata, created_at, updated_at
      FROM resources
      WHERE id = $1;
    `,
      [id]
    );
    return res.rows[0] || null;
  },

  // Update resource status
  async updateStatus(id: string, status: DbResource['status']): Promise<DbResource | null> {
    const res = await query<DbResource>(
      `
      UPDATE resources
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id, name, resource_type, status, capabilities,
        capacity_people, capacity_cargo_tons, speed_kmh,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        operational_metadata, created_at, updated_at;
    `,
      [status, id]
    );
    return res.rows[0] || null;
  },

  // Spatial query: find resources nearest to a point
  async findNearestTo(lng: number, lat: number, limit = 5): Promise<DbResource[]> {
    const res = await query<DbResource>(
      `
      SELECT 
        id, name, resource_type, status, capabilities,
        capacity_people, capacity_cargo_tons, speed_kmh,
        ST_AsGeoJSON(location_geom)::json AS location_geojson,
        ST_Distance(location_geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters,
        operational_metadata, created_at, updated_at
      FROM resources
      ORDER BY distance_meters ASC
      LIMIT $3;
    `,
      [lng, lat, limit]
    );
    return res.rows;
  },
};
