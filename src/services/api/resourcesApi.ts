import { apiRequest } from './apiClient';
import { Resource } from '../../types';

export const resourcesApi = {
  /**
   * List all resources from backend
   */
  async listResources(params?: { status?: string; type?: string }): Promise<Resource[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await apiRequest<any[]>(`/resources${queryString}`);

    return res.data.map((r: any) => ({
      id: r.id,
      name: r.name,
      type: r.resource_type || r.type || 'Evacuation Vehicle',
      state: r.status === 'Unavailable' || r.state === 'Unavailable' ? 'Unavailable' : r.status || r.state || 'Available',
      locationName: r.location_name || 'Base Staging Area',
      coordinates: {
        lat: r.location_geojson?.coordinates?.[1] || r.coordinates?.lat || 38.872,
        lng: r.location_geojson?.coordinates?.[0] || r.coordinates?.lng || -122.778,
      },
      capacity: r.capacity_people ? `${r.capacity_people} pax` : r.capacity || 'Standard',
      crewCount: r.crew_count || r.crewCount || 4,
      fuelBatteryLevel: r.fuel_level_percent || r.fuelBatteryLevel || 100,
      specialCapabilities: Array.isArray(r.capabilities) ? r.capabilities : r.specialCapabilities || [],
      isSimulatedFailure: r.id === 'RES-VEH-A' || r.id === 'RES-EVAC-A' || r.status === 'Unavailable' || r.state === 'Unavailable',
      failureReason: r.failure_reason || (r.status === 'Unavailable' ? 'Mechanical Breakdown' : undefined),
    }));
  },

  /**
   * Get resource by ID
   */
  async getResourceById(id: string): Promise<Resource> {
    const res = await apiRequest<any>(`/resources/${id}`);
    const r = res.data;
    return {
      id: r.id,
      name: r.name,
      type: r.resource_type || r.type || 'Evacuation Vehicle',
      state: r.status === 'Unavailable' || r.state === 'Unavailable' ? 'Unavailable' : r.status || r.state || 'Available',
      locationName: r.location_name || 'Base Staging Area',
      coordinates: {
        lat: r.location_geojson?.coordinates?.[1] || r.coordinates?.lat || 38.872,
        lng: r.location_geojson?.coordinates?.[0] || r.coordinates?.lng || -122.778,
      },
      capacity: r.capacity_people ? `${r.capacity_people} pax` : r.capacity || 'Standard',
      crewCount: r.crew_count || r.crewCount || 4,
      fuelBatteryLevel: r.fuel_level_percent || r.fuelBatteryLevel || 100,
      specialCapabilities: Array.isArray(r.capabilities) ? r.capabilities : r.specialCapabilities || [],
      isSimulatedFailure: r.id === 'RES-VEH-A' || r.id === 'RES-EVAC-A' || r.status === 'Unavailable' || r.state === 'Unavailable',
      failureReason: r.failure_reason,
    };
  },
};
