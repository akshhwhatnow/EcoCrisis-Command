import { apiRequest } from './apiClient';
import { Incident } from '../../types';

export const incidentsApi = {
  /**
   * List all incidents from backend
   */
  async listIncidents(params?: { severity?: string; status?: string }): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    
    const res = await apiRequest<any[]>(`/incidents${queryString}`);
    
    // Normalize backend DbIncident to Frontend Incident structure
    return res.data.map((i: any) => ({
      id: i.id,
      name: i.name,
      type: i.incident_type || i.type || 'Wildfire',
      locationName: i.name,
      coordinates: {
        lat: i.location_geojson?.coordinates?.[1] || i.coordinates?.lat || 38.872,
        lng: i.location_geojson?.coordinates?.[0] || i.coordinates?.lng || -122.778,
      },
      severity: i.severity,
      urgency: i.urgency,
      status: i.status === 'Active' ? 'Active' : i.status === 'Delayed' ? 'Delayed' : 'Active',
      confidence: 95,
      reportedAt: i.created_at ? new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
      lastUpdated: i.updated_at ? new Date(i.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:10 AM',
      description: i.description || '',
      requiredResources: i.required_resources || [],
      assignedResourceIds: i.assigned_resources || [],
      accessibility: {
        status: i.accessibility_status || 'Open',
        roadName: i.road_name || 'Primary Corridor',
        details: i.accessibility_status || 'Open',
        riverRouteAvailable: Boolean(i.river_route_available),
      },
      impact: {
        peopleAtRisk: Number(i.impact_people_at_risk ?? i.impact?.peopleAtRisk ?? 0),
        areaKm2: Number(i.impact_habitat_area_km2 ?? i.impact?.areaKm2 ?? 1.0),
        livestockCount: Number(i.impact_livestock_count ?? i.impact?.livestockCount ?? 0),
        livestockTypes: i.impact?.livestockTypes || ['Cattle'],
        cropHectares: Number(i.impact_crop_hectares ?? i.impact?.cropHectares ?? 0),
        cropTypes: i.impact?.cropTypes || ['Grapes'],
        wildlifeSpecies: Array.isArray(i.impact_wildlife_species) ? i.impact_wildlife_species : i.impact?.wildlifeSpecies || [],
        habitatAreaKm2: Number(i.impact_habitat_area_km2 ?? i.impact?.habitatAreaKm2 ?? 0),
        infrastructureRisk: Array.isArray(i.impact_infrastructure_risk) ? i.impact_infrastructure_risk : i.impact?.infrastructureRisk || [],
      },
      aiInsights: i.ai_insights || `Autonomous analysis for ${i.id} [DATABASE — T0 SEED]`,
      liveTimeline: i.live_timeline || [],
      relatedIncidentIds: i.related_incident_ids || [],
    }));
  },

  /**
   * Get single incident by ID
   */
  async getIncidentById(id: string): Promise<Incident> {
    const res = await apiRequest<any>(`/incidents/${id}`);
    const i = res.data;
    return {
      id: i.id,
      name: i.name,
      type: i.incident_type || i.type || 'Wildfire',
      locationName: i.name,
      coordinates: {
        lat: i.location_geojson?.coordinates?.[1] || i.coordinates?.lat || 38.872,
        lng: i.location_geojson?.coordinates?.[0] || i.coordinates?.lng || -122.778,
      },
      severity: i.severity,
      urgency: i.urgency,
      status: i.status === 'Active' ? 'Active' : i.status === 'Delayed' ? 'Delayed' : 'Active',
      confidence: 95,
      reportedAt: i.created_at ? new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
      lastUpdated: i.updated_at ? new Date(i.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:10 AM',
      description: i.description || '',
      requiredResources: i.required_resources || [],
      assignedResourceIds: i.assigned_resources || [],
      accessibility: {
        status: i.accessibility_status || 'Open',
        roadName: i.road_name || 'Primary Corridor',
        details: i.accessibility_status || 'Open',
        riverRouteAvailable: Boolean(i.river_route_available),
      },
      impact: {
        peopleAtRisk: Number(i.impact_people_at_risk ?? i.impact?.peopleAtRisk ?? 0),
        areaKm2: Number(i.impact_habitat_area_km2 ?? i.impact?.areaKm2 ?? 1.0),
        livestockCount: Number(i.impact_livestock_count ?? i.impact?.livestockCount ?? 0),
        livestockTypes: i.impact?.livestockTypes || ['Cattle'],
        cropHectares: Number(i.impact_crop_hectares ?? i.impact?.cropHectares ?? 0),
        cropTypes: i.impact?.cropTypes || ['Grapes'],
        wildlifeSpecies: Array.isArray(i.impact_wildlife_species) ? i.impact_wildlife_species : i.impact?.wildlifeSpecies || [],
        habitatAreaKm2: Number(i.impact_habitat_area_km2 ?? i.impact?.habitatAreaKm2 ?? 0),
        infrastructureRisk: Array.isArray(i.impact_infrastructure_risk) ? i.impact_infrastructure_risk : i.impact?.infrastructureRisk || [],
      },
      aiInsights: i.ai_insights || `Autonomous analysis for ${i.id} [DATABASE — T0 SEED]`,
      liveTimeline: i.live_timeline || [],
      relatedIncidentIds: i.related_incident_ids || [],
    };
  },

  /**
   * Get all incident dependencies
   */
  async getAllDependencies(): Promise<any[]> {
    const res = await apiRequest<any[]>('/incidents/dependencies/all');
    return res.data;
  },

  /**
   * Get upstream & downstream dependencies for an incident
   */
  async getIncidentDependencies(incidentId: string): Promise<{
    incidentId: string;
    upstream: any[];
    downstream: any[];
  }> {
    const res = await apiRequest<any>(`/incidents/${incidentId}/dependencies`);
    return res.data;
  },

  /**
   * Add a new incident dependency
   */
  async addDependency(payload: {
    sourceIncidentId: string;
    targetIncidentId: string;
    dependencyType: string;
    severity?: string;
    description: string;
    provenance?: string;
  }): Promise<any> {
    const res = await apiRequest<any>(`/incidents/${payload.sourceIncidentId}/dependencies`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Delete an incident dependency
   */
  async deleteDependency(dependencyId: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/incidents/dependencies/${dependencyId}`, {
      method: 'DELETE',
    });
    return res.data.success;
  },

  /**
   * Get threat propagation cascading analysis for an incident
   */
  async getThreatPropagation(incidentId: string): Promise<any> {
    const res = await apiRequest<any>(`/incidents/${incidentId}/threat-propagation`);
    return res.data;
  },
};

