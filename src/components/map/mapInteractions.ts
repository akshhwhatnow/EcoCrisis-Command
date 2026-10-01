import { Map as MapLibreMap, Popup, GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection, Point, LineString, Polygon } from 'geojson';
import { Incident, Resource } from '../../types';

export function setupMapInteractions(
  map: MapLibreMap,
  onSelectIncident: (id: string) => void,
  onSelectResource: (id: string) => void,
  isDark: boolean
) {
  let activePopup: Popup | null = null;

  // 1. Incident Click & Hover
  map.on('click', 'incidents-inner', (e) => {
    if (!e.features || e.features.length === 0) return;
    const props = e.features[0].properties;
    if (!props) return;

    onSelectIncident(props.id);

    if (activePopup) activePopup.remove();

    const coordinates = (e.features[0].geometry as Point).coordinates.slice() as [number, number];

    const popupHtml = `
      <div style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.4; width: 240px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-weight: 800; font-size: 14px; color: ${props.severity === 'Critical' ? '#ef4444' : '#f97316'}; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 16px;">${props.icon}</span> ${props.name}
          </span>
        </div>
        <div style="color: ${isDark ? '#9ca3af' : '#4b5563'}; font-size: 11px; margin-bottom: 2px;">
          <strong>Type:</strong> ${props.type}
        </div>
        <div style="color: ${isDark ? '#9ca3af' : '#4b5563'}; font-size: 11px; margin-bottom: 2px;">
          <strong>Location:</strong> ${props.locationName}
        </div>
        <div style="color: ${isDark ? '#9ca3af' : '#4b5563'}; font-size: 11px; margin-bottom: 8px;">
          <strong>Reported:</strong> ${props.reportedAt || 'Just now'}
        </div>
        
        <div style="background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Severity:</span>
            <strong style="color: ${props.severity === 'Critical' ? '#ef4444' : '#f97316'};">${props.severity}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">People at Risk:</span>
            <strong>${Number(props.peopleAtRisk).toLocaleString()}</strong>
          </div>
          ${props.livestockCount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Livestock:</span>
            <strong style="color: #10b981;">${props.livestockCount} head</strong>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between;">
            ${props.cropHectares > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Crops/Agriculture:</span>
              <strong style="color: #f59e0b;">${props.cropHectares} ha</strong>
            </div>` : ''}
            ${props.habitatAreaKm2 > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Wildlife Habitat:</span>
              <strong style="color: #a855f7;">${props.habitatAreaKm2} km²</strong>
            </div>` : ''}
              <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Road Status:</span>
            <strong>${props.roadStatus}</strong>
          </div>
        </div>
        <div style="font-size: 11px; color: ${isDark ? '#cbd5e1' : '#334155'}; font-style: italic;">
          ${props.description || 'No description provided.'}
        </div>
      </div>
    `;

    activePopup = new Popup({ offset: 15, closeButton: true, closeOnClick: true, focusAfterOpen: false })
      .setLngLat(coordinates)
      .setHTML(popupHtml)
      .addTo(map);
  });

  // Cursor styling
  map.on('mouseenter', 'incidents-inner', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'incidents-inner', () => {
    map.getCanvas().style.cursor = '';
  });

  // 2. Resource Click
  map.on('click', 'resources-base', (e) => {
    if (!e.features || e.features.length === 0) return;
    const props = e.features[0].properties;
    if (!props) return;

    onSelectResource(props.id);

    if (activePopup) activePopup.remove();

    const coordinates = (e.features[0].geometry as Point).coordinates.slice() as [number, number];

    const popupHtml = `
      <div style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.4;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <strong style="font-size: 13px; color: ${props.isSimulatedFailure ? '#ef4444' : '#0284c7'};">
            ${props.name}
          </strong>
        </div>
        <div style="color: ${isDark ? '#9ca3af' : '#4b5563'}; font-size: 11px; margin-bottom: 6px;">
          Type: ${props.type}
        </div>
        <div style="background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}; border-radius: 8px; padding: 8px; margin-bottom: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">State:</span>
            <strong style="color: ${props.isSimulatedFailure ? '#ef4444' : '#10b981'};">${props.state}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">Assignment:</span>
            <strong>${props.currentAssignmentName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: ${isDark ? '#9ca3af' : '#6b7280'};">ETA:</span>
            <strong>${props.etaMinutes} min</strong>
          </div>
        </div>
        <div style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'};">
          Capacity: ${props.capacity}
        </div>
      </div>
    `;

    activePopup = new Popup({ offset: 15, closeButton: true, closeOnClick: true, focusAfterOpen: false })
      .setLngLat(coordinates)
      .setHTML(popupHtml)
      .addTo(map);
  });

  map.on('mouseenter', 'resources-base', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'resources-base', () => {
    map.getCanvas().style.cursor = '';
  });

  // 3. Infrastructure Click
  map.on('click', 'infrastructure-base', (e) => {
    if (!e.features || e.features.length === 0) return;
    const props = e.features[0].properties;
    if (!props) return;

    if (activePopup) activePopup.remove();
    const coordinates = (e.features[0].geometry as Point).coordinates.slice() as [number, number];

    const popupHtml = `
      <div style="font-family: 'Inter', sans-serif; font-size: 12px;">
        <strong style="color: ${props.color || '#f59e0b'}; font-size: 13px;">${props.name}</strong>
        <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; margin-top: 4px;">Type: ${props.type}</div>
        <div style="margin-top: 4px; font-weight: 600;">Status: ${props.status}</div>
      </div>
    `;

    activePopup = new Popup({ offset: 12, closeButton: true, closeOnClick: true, focusAfterOpen: false })
      .setLngLat(coordinates)
      .setHTML(popupHtml)
      .addTo(map);
  });

  return () => {
    if (activePopup) activePopup.remove();
  };
}

export function updateMapSources(
  map: MapLibreMap,
  sourcesData: {
    incidents: FeatureCollection<Point>;
    resources: FeatureCollection<Point>;
    routes: FeatureCollection<LineString>;
    hazards: FeatureCollection<Polygon>;
    evacuation: FeatureCollection<Polygon>;
    agriculture: FeatureCollection<Polygon>;
    wildlife: FeatureCollection<Polygon>;
    infrastructure: FeatureCollection<Point>;
  }
) {
  const updateSource = (sourceId: string, data: any) => {
    const src = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (src && typeof src.setData === 'function') {
      src.setData(data);
    }
  };

  updateSource('incidents-source', sourcesData.incidents);
  updateSource('resources-source', sourcesData.resources);
  updateSource('routes-source', sourcesData.routes);
  updateSource('hazards-source', sourcesData.hazards);
  updateSource('evacuation-source', sourcesData.evacuation);
  updateSource('agriculture-source', sourcesData.agriculture);
  updateSource('wildlife-source', sourcesData.wildlife);
  updateSource('infrastructure-source', sourcesData.infrastructure);
}