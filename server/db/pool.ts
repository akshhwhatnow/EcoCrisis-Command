import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Support standard DATABASE_URL or individual PG connection parameters
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecocrisis';

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Transaction helper for atomic database operations
export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Direct parameterized query helper
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

// Healthcheck helper to verify PostgreSQL connectivity
export async function checkConnection(): Promise<{ connected: boolean; version?: string; error?: string }> {
  try {
    const res = await pool.query('SELECT version();');
    return { connected: true, version: res.rows[0].version };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}

// Healthcheck helper to verify PostGIS extension availability
export async function checkPostGIS(): Promise<{ postgisAvailable: boolean; version?: string; error?: string }> {
  try {
    const res = await pool.query('SELECT PostGIS_Version();');
    return { postgisAvailable: true, version: res.rows[0].postgis_version };
  } catch (err: any) {
    return { postgisAvailable: false, error: err.message };
  }
}
