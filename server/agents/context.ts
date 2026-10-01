import crypto from 'crypto';
import { incidentRepository, DbIncident } from '../db/repositories/incidentRepository.js';
import { resourceRepository, DbResource } from '../db/repositories/resourceRepository.js';
import { planRepository, DbPlan } from '../db/repositories/planRepository.js';
import { spatialService } from '../services/spatialService.js';
import { INITIAL_INCIDENTS, INITIAL_RESOURCES, INITIAL_RESPONSE_PLANS } from '../../src/data/seedData.js';
import { computeCrossSectorImpact } from '../../src/services/riskImpactEngine.js';
import { solveDeterministicAllocation } from '../../src/services/optimizationEngine.js';
import { Incident, Resource } from '../../src/types/index.js';
import { AgentContext } from './types.js';

export async function buildAgentContext(
  incidentIds?: string[],
  correlationId?: string,
  planId?: string
): Promise<AgentContext> {
  const corrId = correlationId || crypto.randomUUID();
  const execId = `EXEC-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  // 1. Load Incidents from Database (with fallback if DB tables not migrated)
  let incidents: DbIncident[] = [];
  try {
    incidents = await incidentRepository.findAllActive();
  } catch (err: any) {
    incidents = INITIAL_INCIDENTS.slice(0, 3).map((i) => ({
      id: i.id,
      external_ref: `INC-${i.id}`,
      name: i.name,
      incident_type: i.type,
      sector: i.type.includes('Farm') || i.type.includes('Agri') ? 'Agriculture' : i.type.includes('Wildlife') ? 'Wildlife' : 'Human Settlement',
      severity: i.severity as any,
      urgency: i.urgency as any,
      status: i.status as any,
      description: i.description,
      accessibility_status: i.accessibility.status,
      river_route_available: i.accessibility.riverRouteAvailable,
      impact_people_at_risk: i.impact.peopleAtRisk,
      impact_livestock_count: i.impact.livestockCount,
      impact_crop_hectares: i.impact.cropHectares,
      impact_wildlife_species: i.impact.wildlifeSpecies,
      impact_infrastructure_risk: i.impact.infrastructureRisk,
      impact_habitat_area_km2: i.impact.habitatAreaKm2,
      location_geojson: { type: 'Point', coordinates: [i.coordinates.lng, i.coordinates.lat] },
      created_at: new Date(),
      updated_at: new Date(),
    }));
  }

  if (incidentIds && incidentIds.length > 0) {
    incidents = incidents.filter((i) => incidentIds.includes(i.id));
  }
  const targetIncidentIds = incidents.map((i) => i.id);

  // 2. Load Resources (with fallback if DB tables not migrated)
  let resources: DbResource[] = [];
  try {
    resources = await resourceRepository.findAll();
  } catch (err: any) {
    resources = INITIAL_RESOURCES.slice(0, 4).map((r) => {
      const normalizedId =
        r.id === 'RES-EVAC-A' ? 'RES-VEH-A' :
        r.id === 'RES-TRANS-B' ? 'RES-TEAM-B' :
        r.id === 'RES-RESCUE-C' ? 'RES-TEAM-C' :
        r.id;

      return {
        id: normalizedId,
        name: r.name,
        resource_type: r.type,
        status: r.state as any,
        capabilities: r.specialCapabilities,
        capacity_people: parseInt(r.capacity, 10) || 20,
        capacity_cargo_tons: 5.0,
        speed_kmh: 50,
        location_geojson: { type: 'Point', coordinates: [r.coordinates.lng, r.coordinates.lat] },
        operational_metadata: { capacity: r.capacity, crewCount: r.crewCount },
        created_at: new Date(),
        updated_at: new Date(),
      };
    });
  }



  // 3. Load Active Plan (with fallback if DB tables not migrated)
  let activePlan: DbPlan | null = null;
  try {
    activePlan = await planRepository.findActivePlan();
  } catch (err: any) {
    const fallbackPlan = INITIAL_RESPONSE_PLANS[0];
    if (fallbackPlan) {
      activePlan = {
        id: fallbackPlan.id,
        version: 1,
        status: 'Active',
        source_scenario: 'T0',
        confidence_score: fallbackPlan.confidenceScore,
        objective_score: fallbackPlan.successProbabilityPercent,
        generated_at: new Date(),
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
  }

  // 4. Load Spatial Layers
  let spatialLayers: any[] = [];
  try {
    const layerGeoJson = await spatialService.getSpatialLayers();
    spatialLayers = layerGeoJson.features || [];
  } catch (err) {
    spatialLayers = [
      {
        id: 'LAYER-HAZARD-01',
        properties: {
          layerType: 'hazard',
          sector: 'Hazard',
          windDirection: 'SSE',
          spreadRateKmh: 2.4,
          intensity: 'Severe',
        },
      },
    ];
  }

  // 5. Execute Deterministic Calculations
  const mappedIncidents: Incident[] = incidents.map((i) => ({
    id: i.id,
    name: i.name,
    type: i.incident_type,
    locationName: i.name,
    coordinates: {
      lat: i.location_geojson?.coordinates?.[1] || 37.7749,
      lng: i.location_geojson?.coordinates?.[0] || -122.4194,
    },
    severity: i.severity,
    urgency: i.urgency,
    status: (i.status === 'Active' ? 'Active' : i.status === 'Delayed' ? 'Delayed' : 'Active') as any,
    confidence: 95,
    reportedAt: i.created_at?.toISOString() || new Date().toISOString(),
    lastUpdated: i.updated_at?.toISOString() || new Date().toISOString(),
    description: i.description,
    requiredResources: [],
    assignedResourceIds: [],
    accessibility: {
      status: (i.accessibility_status as any) || 'Open',
      roadName: 'Operational Corridor',
      details: i.accessibility_status || 'Open',
      riverRouteAvailable: i.river_route_available,
    },
    impact: {
      peopleAtRisk: i.impact_people_at_risk,
      areaKm2: Number(i.impact_habitat_area_km2) || 1.5,
      livestockCount: i.impact_livestock_count,
      livestockTypes: ['Cattle'],
      cropHectares: Number(i.impact_crop_hectares),
      cropTypes: ['Grapes', 'Pasture'],
      wildlifeSpecies: i.impact_wildlife_species,
      habitatAreaKm2: Number(i.impact_habitat_area_km2),
      infrastructureRisk: i.impact_infrastructure_risk,
    },
    aiInsights: '',
    liveTimeline: [],
    relatedIncidentIds: [],
  }));

  const mappedResources: Resource[] = resources.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.resource_type as any,
    state: (r.status === 'Available' ? 'Available' : r.status === 'Unavailable' ? 'Unavailable' : 'En route') as any,
    locationName: 'Operational Base Station',
    coordinates: {
      lat: r.location_geojson?.coordinates?.[1] || 37.77,
      lng: r.location_geojson?.coordinates?.[0] || -122.41,
    },
    capacity: `${r.capacity_people} pax`,
    crewCount: 4,
    fuelBatteryLevel: 100,
    specialCapabilities: r.capabilities,
  }));

  const deterministicImpact = computeCrossSectorImpact(mappedIncidents);
  const deterministicAllocations = solveDeterministicAllocation(mappedIncidents, mappedResources);

  return {
    correlationId: corrId,
    executionId: execId,
    planId: planId || activePlan?.id,
    incidentIds: targetIncidentIds,
    incidents,
    resources,
    activePlan,
    spatialLayers,
    previousResults: {},
    deterministicImpact,
    deterministicAllocations,
    executionMetadata: {
      triggeredAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      provider: 'DeterministicMockProvider',
    },
  };
}
