import { Map as MapLibreMap } from 'maplibre-gl';
import { MAP_COLORS } from './mapTheme';

export function initializeMapSourcesAndLayers(map: MapLibreMap, isDark: boolean = true) {
  // 1. Hazard Zones (Polygons)
  if (!map.getSource('hazards-source')) {
    map.addSource('hazards-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer({
      id: 'hazards-fill',
      type: 'fill',
      source: 'hazards-source',
      paint: {
        'fill-color': [
          'match',
          ['get', 'type'],
          'Wildfire',
          MAP_COLORS.firePerimeter,
          'Smoke Plume',
          '#f97316',
          '#ef4444',
        ],
        'fill-opacity': [
          'match',
          ['get', 'type'],
          'Wildfire',
          0.28,
          'Smoke Plume',
          0.16,
          0.2,
        ],
      },
    });

    map.addLayer({
      id: 'hazards-line',
      type: 'line',
      source: 'hazards-source',
      paint: {
        'line-color': [
          'match',
          ['get', 'type'],
          'Wildfire',
          '#ef4444',
          'Smoke Plume',
          '#f97316',
          '#ef4444',
        ],
        'line-width': ['match', ['get', 'type'], 'Wildfire', 2.5, 'Smoke Plume', 1.5, 2],
        'line-dasharray': [3, 2],
      },
    });
  }

  // 2. Evacuation Zones (Polygons)
  if (!map.getSource('evacuation-source')) {
    map.addSource('evacuation-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer({
      id: 'evacuation-fill',
      type: 'fill',
      source: 'evacuation-source',
      paint: {
        'fill-color': '#ef4444',
        'fill-opacity': 0.12,
      },
    });

    map.addLayer({
      id: 'evacuation-line',
      type: 'line',
      source: 'evacuation-source',
      paint: {
        'line-color': '#ef4444',
        'line-width': 1.8,
        'line-dasharray': [4, 3],
      },
    });
  }

  // 3. Agriculture Zones (Polygons)
  if (!map.getSource('agriculture-source')) {
    map.addSource('agriculture-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer({
      id: 'agriculture-fill',
      type: 'fill',
      source: 'agriculture-source',
      paint: {
        'fill-color': '#10b981',
        'fill-opacity': 0.14,
      },
    });

    map.addLayer({
      id: 'agriculture-line',
      type: 'line',
      source: 'agriculture-source',
      paint: {
        'line-color': '#10b981',
        'line-width': 1.6,
      },
    });
  }

  // 4. Wildlife Zones (Polygons)
  if (!map.getSource('wildlife-source')) {
    map.addSource('wildlife-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer({
      id: 'wildlife-fill',
      type: 'fill',
      source: 'wildlife-source',
      paint: {
        'fill-color': '#a855f7',
        'fill-opacity': 0.14,
      },
    });

    map.addLayer({
      id: 'wildlife-line',
      type: 'line',
      source: 'wildlife-source',
      paint: {
        'line-color': '#a855f7',
        'line-width': 1.6,
      },
    });
  }

  // 5. Routes (LineStrings)
  if (!map.getSource('routes-source')) {
    map.addSource('routes-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    // Dark casing
    map.addLayer({
      id: 'routes-casing',
      type: 'line',
      source: 'routes-source',
      paint: {
        'line-color': isDark ? '#070b12' : '#ffffff',
        'line-width': 6,
        'line-opacity': 0.8,
      },
    });

    map.addLayer({
      id: 'routes-line',
      type: 'line',
      source: 'routes-source',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': [
          'match',
          ['get', 'type'],
          'Bridge Failure',
          4,
          'Off-Road Bypass',
          3.5,
          'Waterway',
          3,
          3,
        ],
        'line-dasharray': [
          'match',
          ['get', 'type'],
          'Bridge Failure',
          ['literal', [2, 2]],
          'Off-Road Bypass',
          ['literal', [4, 2]],
          ['literal', [1, 0]],
        ],
      },
    });
  }

  // 6. Critical Infrastructure (Points)
  if (!map.getSource('infrastructure-source')) {
    map.addSource('infrastructure-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer({
      id: 'infrastructure-circle',
      type: 'circle',
      source: 'infrastructure-source',
      paint: {
        'circle-radius': 7,
        'circle-color': ['get', 'color'],
        'circle-stroke-color': isDark ? '#070b12' : '#ffffff',
        'circle-stroke-width': 2,
      },
    });
  }

  // 7. Resources (Points)
  if (!map.getSource('resources-source')) {
    map.addSource('resources-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    // Outer ring
    map.addLayer({
      id: 'resources-outer',
      type: 'circle',
      source: 'resources-source',
      paint: {
        'circle-radius': 12,
        'circle-color': [
          'case',
          ['get', 'isSimulatedFailure'],
          'rgba(239, 68, 68, 0.25)',
          'rgba(14, 165, 233, 0.25)',
        ],
      },
    });

    // Inner marker
    map.addLayer({
      id: 'resources-inner',
      type: 'circle',
      source: 'resources-source',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'case',
          ['get', 'isSimulatedFailure'],
          '#ef4444',
          ['match', ['get', 'type'], 'Boat', '#06b6d4', 'Aerial Drone', '#8b5cf6', '#0284c7'],
        ],
        'circle-stroke-color': isDark ? '#070b12' : '#ffffff',
        'circle-stroke-width': 2,
      },
    });

    // Label
    map.addLayer({
      id: 'resources-label',
      type: 'symbol',
      source: 'resources-source',
      layout: {
        'text-field': ['get', 'icon'],
        'text-size': 11,
        'text-offset': [0, 1.4],
        'text-anchor': 'top',
        'text-font': ['Noto Sans Bold'],
      },
      paint: {
        'text-color': isDark ? '#f8fafc' : '#0f172a',
        'text-halo-color': isDark ? '#070b12' : '#ffffff',
        'text-halo-width': 1.5,
      },
    });
  }

  // 8. Incidents (Points) - TOP LAYER
  if (!map.getSource('incidents-source')) {
    map.addSource('incidents-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    // Pulse outer halo
    map.addLayer({
      id: 'incidents-halo',
      type: 'circle',
      source: 'incidents-source',
      paint: {
        'circle-radius': 18,
        'circle-color': [
          'match',
          ['get', 'severity'],
          'Critical',
          'rgba(239, 68, 68, 0.3)',
          'High',
          'rgba(249, 115, 22, 0.3)',
          'Medium-High',
          'rgba(168, 85, 247, 0.3)',
          'rgba(234, 179, 8, 0.3)',
        ],
      },
    });

    // Incident marker
    map.addLayer({
      id: 'incidents-inner',
      type: 'circle',
      source: 'incidents-source',
      paint: {
        'circle-radius': 11,
        'circle-color': [
          'match',
          ['get', 'severity'],
          'Critical',
          '#ef4444',
          'High',
          '#f97316',
          'Medium-High',
          '#a855f7',
          '#eab308',
        ],
        'circle-stroke-color': isDark ? '#070b12' : '#ffffff',
        'circle-stroke-width': 2.5,
      },
    });

    // Incident ID badge
    map.addLayer({
      id: 'incidents-id-label',
      type: 'symbol',
      source: 'incidents-source',
      layout: {
        'text-field': ['get', 'icon'],
        'text-size': 16,
        'text-font': ['Noto Sans Bold'],
      },
      paint: {
        'text-color': '#ffffff',
      },
    });

    // Incident name label below
    map.addLayer({
      id: 'incidents-title-label',
      type: 'symbol',
      source: 'incidents-source',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.6],
        'text-anchor': 'top',
        'text-font': ['Noto Sans Bold'],
      },
      paint: {
        'text-color': isDark ? '#f8fafc' : '#0f172a',
        'text-halo-color': isDark ? '#070b12' : '#ffffff',
        'text-halo-width': 2,
      },
    });
  }
}

