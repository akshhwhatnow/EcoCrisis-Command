import { incidentRepository, DbIncident } from '../db/repositories/incidentRepository.js';
import { AppError } from '../types/api.js';

export const incidentService = {
  async listIncidents(filters: { status?: string; severity?: string; urgency?: string; radius?: number; lng?: number; lat?: number }) {
    if (filters.radius && filters.lng !== undefined && filters.lat !== undefined) {
      return incidentRepository.findWithinRadius(filters.lng, filters.lat, filters.radius);
    }

    const incidents = await incidentRepository.findAllActive();
    return incidents.filter((i) => {
      if (filters.status && i.status !== filters.status) return false;
      if (filters.severity && i.severity !== filters.severity) return false;
      if (filters.urgency && i.urgency !== filters.urgency) return false;
      return true;
    });
  },

  async getIncidentById(id: string): Promise<DbIncident> {
    const incident = await incidentRepository.findById(id);
    if (!incident) {
      throw new AppError(`Incident not found with ID: ${id}`, 404, 'INCIDENT_NOT_FOUND');
    }
    return incident;
  },

  async createIncident(data: any): Promise<DbIncident> {
    const existing = await incidentRepository.findById(data.id);
    if (existing) {
      throw new AppError(`Incident already exists with ID: ${data.id}`, 409, 'INCIDENT_EXISTS');
    }
    return incidentRepository.upsert(data);
  },

  async updateIncident(id: string, updates: Partial<DbIncident>): Promise<DbIncident> {
    const existing = await incidentRepository.findById(id);
    if (!existing) {
      throw new AppError(`Incident not found with ID: ${id}`, 404, 'INCIDENT_NOT_FOUND');
    }

    const merged = {
      ...existing,
      ...updates,
      lng: existing.location_geojson?.coordinates?.[0] || -122.4194,
      lat: existing.location_geojson?.coordinates?.[1] || 37.7749,
    };

    return incidentRepository.upsert(merged);
  },
};
