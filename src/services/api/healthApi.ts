import { apiRequest } from './apiClient';

export interface HealthStatusResponse {
  status: 'ok' | 'degraded';
  operatingMode: 'NORMAL_POSTGRESQL' | 'DEGRADED_DEMO_MODE';
  operatingModeLabel: string;
  database: 'connected' | 'disconnected';
  databaseVersion?: string;
  postgis: 'available' | 'unavailable';
  postgisVersion?: string;
  services: {
    api: string;
    database: {
      connected: boolean;
      version?: string;
    };
    postgis: {
      available: boolean;
      version?: string;
    };
  };
  timestamp: string;
  correlationId?: string;
}

export const healthApi = {
  /**
   * Fetches health status and operating mode from backend
   */
  async getHealth(): Promise<HealthStatusResponse> {
    const res = await apiRequest<HealthStatusResponse>('/health');
    // If returned unwrapped or wrapped in data
    return (res as any).data || (res as any);
  },
};
