import { checkConnection, checkPostGIS } from '../db/pool.js';

export const healthService = {
  async getHealthStatus() {
    const conn = await checkConnection();
    let postgisAvailable = false;
    let postgisVersion: string | undefined;

    if (conn.connected) {
      const pgis = await checkPostGIS();
      postgisAvailable = pgis.postgisAvailable;
      postgisVersion = pgis.version;
    }

    const isConnected = Boolean(conn.connected);

    return {
      status: isConnected ? 'ok' : 'degraded',
      operatingMode: isConnected ? 'NORMAL_POSTGRESQL' : 'DEGRADED_DEMO_MODE',
      operatingModeLabel: isConnected
        ? 'Operational Data Source: PostgreSQL/PostGIS'
        : 'DEGRADED DEMO MODE — PostgreSQL unavailable. In-memory data is not persistent.',
      database: isConnected ? 'connected' : 'disconnected',
      databaseVersion: conn.version,
      postgis: postgisAvailable ? 'available' : 'unavailable',
      postgisVersion,
      services: {
        api: 'operational',
        database: {
          connected: isConnected,
          version: conn.version,
        },
        postgis: {
          available: postgisAvailable,
          version: postgisVersion,
        },
      },
      timestamp: new Date().toISOString(),
    };
  },

  async getHealth() {
    return this.getHealthStatus();
  },
};
