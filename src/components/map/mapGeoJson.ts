import { Incident, Resource, ScenarioPhase } from '../../types';
import type { FeatureCollection, Point, LineString, Polygon, Feature } from 'geojson';

export function buildIncidentsGeoJson(incidents: Incident[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: incidents.map(inc => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [inc.coordinates.lng, inc.coordinates.lat],
      },
      properties: {
        id: inc.id,
        name: inc.name,
        type: inc.type,
        severity: inc.severity,
        urgency: inc.urgency,
        status: inc.status,
        confidence: inc.confidence,
        peopleAtRisk: inc.impact.peopleAtRisk,
        livestockCount: inc.impact.livestockCount,
        cropHectares: inc.impact.cropHectares,
        habitatAreaKm2: inc.impact.habitatAreaKm2,
        locationName: inc.locationName,
        roadStatus: inc.accessibility.status,
          description: inc.description,
          reportedAt: inc.reportedAt,
          icon: inc.type.toLowerCase().includes('fire') || inc.type.toLowerCase().includes('wildfire') ? '🔥' :
                inc.type.toLowerCase().includes('flood') || inc.type.toLowerCase().includes('water') ? '🌊' :
                inc.type.toLowerCase().includes('storm') || inc.type.toLowerCase().includes('cyclone') ? '🌪️' :
                inc.type.toLowerCase().includes('volcan') ? '🌋' :
                inc.type.toLowerCase().includes('radiation') || inc.type.toLowerCase().includes('chemical') || inc.type.toLowerCase().includes('industrial') ? '☢️' :
                inc.type.toLowerCase().includes('medical') ? '🏥' :
                inc.type.toLowerCase().includes('heat') ? '🌡️' :
                inc.type.toLowerCase().includes('struct') || inc.type.toLowerCase().includes('infrastructure') ? '🏚️' : '🚨',
        },
      })),
    };
}

export function buildResourcesGeoJson(resources: Resource[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: resources.map(res => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [res.coordinates.lng, res.coordinates.lat],
      },
      properties: {
        id: res.id,
        name: res.name,
        type: res.type,
        state: res.state,
        currentAssignmentId: res.currentAssignmentId || 'None',
        currentAssignmentName: res.currentAssignmentName || 'Standby',
        etaMinutes: res.etaMinutes,
        capacity: res.capacity,
        crewCount: res.crewCount,
        fuelBatteryLevel: res.fuelBatteryLevel,
        isSimulatedFailure: res.isSimulatedFailure || res.state === 'Unavailable',
      },
    })),
  };
}

export function buildHazardZonesGeoJson(): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: [
      // Primary Active Fire Perimeter
      {
        type: 'Feature',
        properties: {
          id: 'haz-fire-perimeter',
          name: 'Active Crown Fire Perimeter',
          type: 'Wildfire',
          severity: 'Critical',
          spreadRateKmH: 3.8,
          flameLengthMeters: 4.2,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [121.195, 14.862],
              [121.212, 14.866],
              [121.225, 14.855],
              [121.218, 14.840],
              [121.200, 14.835],
              [121.188, 14.845],
              [121.195, 14.862],
            ],
          ],
        },
      },
      // Smoke & Ember Dispersion Plume (Rothermel vector heading Northeast)
      {
        type: 'Feature',
        properties: {
          id: 'haz-smoke-plume',
          name: 'High-Density Smoke & PM2.5 Dispersion Plume',
          type: 'Smoke Plume',
          severity: 'High',
          windSpeedKmH: 48,
          windDirection: 'NE',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [121.190, 14.845],
              [121.215, 14.860],
              [121.250, 14.885],
              [121.270, 14.875],
              [121.245, 14.845],
              [121.220, 14.835],
              [121.190, 14.845],
            ],
          ],
        },
      },
    ],
  };
}

export function buildEvacuationZonesGeoJson(): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: [
      // Hillside Community Evacuation Zone (I-1)
      {
        type: 'Feature',
        properties: {
          id: 'evac-zone-i1',
          name: 'Zone A: Hillside Village Evacuation Perimeter',
          population: 1200,
          status: 'Mandatory Evacuation',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [121.192, 14.868],
              [121.214, 14.868],
              [121.216, 14.850],
              [121.195, 14.850],
              [121.192, 14.868],
            ],
          ],
        },
      },
      // North River Cut-Off Zone (I-4)
      {
        type: 'Feature',
        properties: {
          id: 'evac-zone-i4',
          name: 'Zone D: North River Cut-Off Perimeter',
          population: 410,
          status: 'Isolated - Immediate Extraction Required',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [121.212, 14.882],
              [121.232, 14.882],
              [121.234, 14.865],
              [121.214, 14.865],
              [121.212, 14.882],
            ],
          ],
        },
      },
    ],
  };
}

export function buildAgricultureZonesGeoJson(): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 'agri-zone-i2',
          name: 'Eastern Slope Pastures & Organic Vineyards (450 ha)',
          livestockCount: 840,
          cropValue: '$3.4M',
          smokeBufferHours: 3.5,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [121.222, 14.845],
              [121.250, 14.845],
              [121.252, 14.820],
              [121.225, 14.820],
              [121.222, 14.845],
            ],
          ],
        },
      },
    ],
  };
}

export function buildWildlifeZonesGeoJson(): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 'wild-zone-i3',
          name: 'Pine Ridge Wildlife Sanctuary & Migration Corridor (42 km²)',
          species: 'Roosevelt Elk (65), Spotted Owls (18 pairs), Lynx (9)',
          status: 'Flank Approaching',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [121.175, 14.835],
              [121.200, 14.835],
              [121.202, 14.815],
              [121.172, 14.815],
              [121.175, 14.835],
            ],
          ],
        },
      },
    ],
  };
}

export function buildRoutesGeoJson(phase: ScenarioPhase, resources: Resource[]): FeatureCollection<LineString> {
  const isCrisis = phase !== 'T0_INITIAL';
  const vehicleAFailed = resources.find(r => r.id === 'RES-EVAC-A')?.state === 'Unavailable';

  const features: Feature<LineString>[] = [
    // Route 1: Hillside Village Evacuation Access (Route 4)
    {
      type: 'Feature',
      properties: {
        id: 'route-i1-access',
        name: 'Hillside Route 4 Access Corridor',
        status: vehicleAFailed ? 'Delayed / Handed Over' : 'Active Evacuation Route',
        color: vehicleAFailed ? '#ef4444' : '#0ea5e9',
        type: 'Road',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.212, 14.852],
          [121.208, 14.855],
          [121.205, 14.858],
        ],
      },
    },

    // Route 2: East Slope Farm Road (to I-2)
    {
      type: 'Feature',
      properties: {
        id: 'route-i2-farm',
        name: 'East Slope Access Road',
        status: isCrisis ? 'Monitored Buffer Standby' : 'Active Transport Route',
        color: '#10b981',
        type: 'Road',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.245, 14.840],
          [121.240, 14.836],
          [121.235, 14.832],
        ],
      },
    },

    // Route 3: Sanctuary Fire Trail 9 (to I-3)
    {
      type: 'Feature',
      properties: {
        id: 'route-i3-trail',
        name: 'Sanctuary Fire Trail 9',
        status: isCrisis ? 'Drone Monitored' : 'Active Wildlife Unit Route',
        color: '#a855f7',
        type: 'Trail',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.195, 14.818],
          [121.190, 14.822],
          [121.188, 14.825],
        ],
      },
    },

    // Route 4: River Extraction Corridor (Rescue Boat 1)
    {
      type: 'Feature',
      properties: {
        id: 'route-river-ferry',
        name: 'North River High-Speed Waterway Corridor',
        status: 'Active Amphibious Water Route (35 km/h)',
        color: '#06b6d4',
        type: 'Waterway',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.198, 14.864],
          [121.205, 14.868],
          [121.215, 14.871],
          [121.222, 14.872],
        ],
      },
    },
  ];

  // Highway 27 Bridge Corridor
  if (isCrisis) {
    // Collapsed Bridge Section
    features.push({
      type: 'Feature',
      properties: {
        id: 'route-hwy27-collapsed',
        name: 'Highway 27 North Bridge (COLLAPSED & BLOCKED)',
        status: 'Blocked - Bridge Structurally Failed',
        color: '#ef4444',
        type: 'Bridge Failure',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.216, 14.860],
          [121.218, 14.865],
          [121.220, 14.868],
        ],
      },
    });

    // 6x6 North River Bypass Route for Team B
    features.push({
      type: 'Feature',
      properties: {
        id: 'route-6x6-bypass',
        name: '6x6 High-Clearance North River Bypass Route (Team B Reroute)',
        status: 'Active Heavy Bypass Corridor (22 min ETA)',
        color: '#10b981',
        type: 'Off-Road Bypass',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.245, 14.840],
          [121.250, 14.855],
          [121.240, 14.868],
          [121.228, 14.871],
          [121.222, 14.872],
        ],
      },
    });

    // Team C Reroute to I-1
    features.push({
      type: 'Feature',
      properties: {
        id: 'route-teamc-reroute',
        name: 'Rescue Team C Reallocation to I-1 Community',
        status: 'Active Emergency Reassignment (11 min ETA)',
        color: '#f59e0b',
        type: 'Road',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.195, 14.818],
          [121.202, 14.835],
          [121.205, 14.850],
          [121.205, 14.858],
        ],
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function buildInfrastructureGeoJson(phase: ScenarioPhase): FeatureCollection<Point> {
  const isCrisis = phase !== 'T0_INITIAL';

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 'infra-bridge-27',
          name: isCrisis ? 'Hwy 27 Bridge (COLLAPSED)' : 'Highway 27 North Bridge',
          type: 'Bridge',
          status: isCrisis ? 'Critical Failure' : 'Operational',
          color: isCrisis ? '#ef4444' : '#10b981',
        },
        geometry: {
          type: 'Point',
          coordinates: [121.218, 14.865],
        },
      },
      {
        type: 'Feature',
        properties: {
          id: 'infra-power-substation',
          name: 'Hillside Power Substation',
          type: 'Energy',
          status: 'Threatened by Embers',
          color: '#f59e0b',
        },
        geometry: {
          type: 'Point',
          coordinates: [121.202, 14.855],
        },
      },
      {
        type: 'Feature',
        properties: {
          id: 'infra-water-pump',
          name: 'Valley Water Pumping Station',
          type: 'Water Facility',
          status: 'Operational',
          color: '#3b82f6',
        },
        geometry: {
          type: 'Point',
          coordinates: [121.195, 14.860],
        },
      },
      {
        type: 'Feature',
        properties: {
          id: 'infra-elderly-care',
          name: 'North River Elderly Care Facility (45 residents)',
          type: 'Healthcare',
          status: isCrisis ? 'Cut Off - High Priority' : 'Operational',
          color: isCrisis ? '#ef4444' : '#10b981',
        },
        geometry: {
          type: 'Point',
          coordinates: [121.225, 14.875],
        },
      },
    ],
  };
}
