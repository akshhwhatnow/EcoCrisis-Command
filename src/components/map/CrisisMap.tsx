import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Plus, Minus, Search as SearchIcon, X, MapPin, Loader2 } from 'lucide-react';
import { Marker, Popup } from 'maplibre-gl';

import { Map as MapLibreMap, NavigationControl, FullscreenControl, ScaleControl } from 'maplibre-gl';
import { useCrisis } from '../../context/CrisisContext';
import { MAP_CONFIG, transformMapRequest } from './mapConfig';
import { initializeMapSourcesAndLayers } from './mapLayers';
import { setupMapInteractions, updateMapSources } from './mapInteractions';
import {
  buildIncidentsGeoJson,
  buildResourcesGeoJson,
  buildRoutesGeoJson,
  buildHazardZonesGeoJson,
  buildEvacuationZonesGeoJson,
  buildAgricultureZonesGeoJson,
  buildWildlifeZonesGeoJson,
  buildInfrastructureGeoJson,
} from './mapGeoJson';
import {
  Layers,
  Flame,
  Shield,
  Sprout,
  Trees,
  Truck,
  Navigation,
  Crosshair,
  Maximize2,
  Minimize,
  Eye,
  EyeOff,
  Activity,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';

interface CrisisMapProps {
  heightClass?: string;
  showLayerControls?: boolean;
  interactive?: boolean;
}

export const CrisisMap: React.FC<CrisisMapProps> = ({
  heightClass = 'h-full min-h-[500px]',
  showLayerControls = true,
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const {
    incidents,
    resources,
    phase,
    selectedIncidentId,
    setSelectedIncidentId,
    selectedResourceId,
    setSelectedResourceId,
    theme,
    playTacticalSound,
  } = useCrisis();

  const isDark = theme === 'dark';

  // Layer Toggles
  const [layers, setLayers] = useState({
    hazards: true,
    evacuation: true,
    agriculture: true,
    wildlife: true,
    routes: true,
    resources: true,
    incidents: true,
    infrastructure: true,
  });

  const [showLayerDrawer, setShowLayerDrawer] = useState<boolean>(false);
  const [activeBaseStyle, setActiveBaseStyle] = useState<'positron' | 'liberty'>(
    isDark ? 'positron' : 'liberty'
  );

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const styleUrl =
      activeBaseStyle === 'positron'
        ? MAP_CONFIG.styles.dark
        : MAP_CONFIG.styles.light;

    try {
      const map = new MapLibreMap({
        container: mapContainerRef.current,
        style: styleUrl,
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        pitch: MAP_CONFIG.pitch,
        bearing: MAP_CONFIG.bearing,
        attributionControl: { compact: true },
        transformRequest: transformMapRequest,
      });

      mapRef.current = map;

      // Add Controls
      
      
      map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

      map.on('load', () => {
        try {
          initializeMapSourcesAndLayers(map, isDark);

          // Populate initial GeoJSON data
          updateMapSources(map, {
            incidents: buildIncidentsGeoJson(incidents),
            resources: buildResourcesGeoJson(resources),
            routes: buildRoutesGeoJson(phase, resources),
            hazards: buildHazardZonesGeoJson(),
            evacuation: buildEvacuationZonesGeoJson(),
            agriculture: buildAgricultureZonesGeoJson(),
            wildlife: buildWildlifeZonesGeoJson(),
            infrastructure: buildInfrastructureGeoJson(phase),
          });

          // Setup Popups and Click Events
          setupMapInteractions(
            map,
            (id) => {
              playTacticalSound('click');
              setSelectedIncidentId(id);
            },
            (id) => {
              playTacticalSound('click');
              setSelectedResourceId(id);
            },
            isDark
          );

          setMapLoaded(true);
        } catch (err: any) {
          console.error('Error initializing map layers:', err);
          setMapError('Failed to initialize map layers');
        }
      });

      map.on('error', (e) => {
        // Suppress non-fatal tile errors while keeping critical ones
        if (e && e.error && !e.error.message?.includes('status 404')) {
          console.warn('MapLibre Notice:', e.error?.message || e);
        }
      });

      // ResizeObserver for responsive layout updates
      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapRef.current = null;
      };
    } catch (err: any) {
      console.error('MapLibre initialization failed:', err);
      setMapError('Failed to initialize WebGL map');
    }
  }, [activeBaseStyle]);

  // Synchronize GeoJSON sources on state change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      updateMapSources(map, {
        incidents: buildIncidentsGeoJson(incidents),
        resources: buildResourcesGeoJson(resources),
        routes: buildRoutesGeoJson(phase, resources),
        hazards: buildHazardZonesGeoJson(),
        evacuation: buildEvacuationZonesGeoJson(),
        agriculture: buildAgricultureZonesGeoJson(),
        wildlife: buildWildlifeZonesGeoJson(),
        infrastructure: buildInfrastructureGeoJson(phase),
      });
    } catch (e) {
      console.error('Failed to update map sources:', e);
    }
  }, [incidents, resources, phase, mapLoaded]);

  // Handle Layer Visibility Toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const setVisibility = (layerIds: string[], visible: boolean) => {
      layerIds.forEach(id => {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
        }
      });
    };

    setVisibility(['hazards-fill', 'hazards-line'], layers.hazards);
    setVisibility(['evacuation-fill', 'evacuation-line'], layers.evacuation);
    setVisibility(['agriculture-fill', 'agriculture-line'], layers.agriculture);
    setVisibility(['wildlife-fill', 'wildlife-line'], layers.wildlife);
    setVisibility(['routes-casing', 'routes-line'], layers.routes);
    setVisibility(['resources-outer', 'resources-inner', 'resources-label'], layers.resources);
    setVisibility(
      ['incidents-halo', 'incidents-inner', 'incidents-id-label', 'incidents-title-label'],
      layers.incidents
    );
    setVisibility(['infrastructure-circle'], layers.infrastructure);
  }, [layers, mapLoaded]);

  // Fly to selected incident
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedIncidentId) return;

    const inc = incidents.find(i => i.id === selectedIncidentId);
    if (inc) {
      map.flyTo({
        center: [inc.coordinates.lng, inc.coordinates.lat],
        zoom: 13.5,
        speed: 1.2,
        curve: 1.4,
        essential: true,
      });
    }
  }, [selectedIncidentId, mapLoaded, incidents]);

  // Fly to selected resource
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedResourceId) return;

    const res = resources.find(r => r.id === selectedResourceId);
    if (res) {
      map.flyTo({
        center: [res.coordinates.lng, res.coordinates.lat],
        zoom: 14,
        speed: 1.2,
        curve: 1.4,
        essential: true,
      });
    }
  }, [selectedResourceId, mapLoaded, resources]);

  // Reset to default region view
  const handleResetView = useCallback(() => {
    playTacticalSound('click');
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: MAP_CONFIG.defaultCenter,
      zoom: MAP_CONFIG.defaultZoom,
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      speed: 1.1,
    });
  }, [playTacticalSound]);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchMarkerRef = useRef<Marker | null>(null);
  const searchPopupRef = useRef<Popup | null>(null);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapRef.current) mapRef.current.zoomIn({ duration: 300 });
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapRef.current) mapRef.current.zoomOut({ duration: 300 });
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setShowSuggestions(false);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        if (data.length === 1) {
          selectSearchResult(data[0]);
        } else {
          setSearchResults(data);
          setShowSuggestions(true);
        }
      } else {
        setSearchError('Location not found. Try another search.');
      }
    } catch (err) {
      setSearchError('Search failed. Please check connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const map = mapRef.current;
    if (!map) return;
    
    setShowSuggestions(false);
    setSearchQuery(result.display_name.split(',')[0]);
    
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    map.flyTo({
      center: [lng, lat],
      zoom: 14,
      essential: true
    });
    
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }
    if (searchPopupRef.current) {
      searchPopupRef.current.remove();
    }
    
    searchPopupRef.current = new Popup({ offset: 25, focusAfterOpen: false })
      .setHTML(`<div style="font-family: 'Inter', sans-serif; font-size: 13px; font-weight: bold; color: var(--text-primary);">${result.display_name}</div>`);
      
    searchMarkerRef.current = new Marker({ color: '#ec4899' })
      .setLngLat([lng, lat])
      .setPopup(searchPopupRef.current)
      .addTo(map);
      
    searchMarkerRef.current.togglePopup();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setSearchError(null);
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    if (searchPopupRef.current) {
      searchPopupRef.current.remove();
      searchPopupRef.current = null;
    }
  };

  const toggleLayer = (key: keyof typeof layers) => {
    playTacticalSound('click');
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[#070b12] select-none shadow-panel ${isFullscreen ? "h-screen" : ""}`}>
      {/* MapLibre DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />

      {/* Loading Skeleton Indicator */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 animate-subtle-pulse">
            <Activity className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Loading Operational GIS Map...
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Initializing OpenFreeMap vector tiles & spatial layers
          </p>
        </div>
      )}

      {/* Error Fallback */}
      {mapError && (
        <div className="absolute inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center z-20">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <div className="text-sm font-semibold text-[var(--text-primary)]">GIS Map Overlay Notice</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md">{mapError}</p>
          <button
            onClick={() => {
              setMapError(null);
              setActiveBaseStyle(prev => (prev === 'positron' ? 'liberty' : 'positron'));
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] text-xs font-semibold"
          >
            Retry Base Tile Connection
          </button>
        </div>
      )}

      {/* Floating HUD Controls */}
      
      {/* Search Bar Overlay */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <form onSubmit={handleSearch} className="relative w-full flex items-center bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-highlight)] rounded-2xl shadow-panel overflow-hidden">
          <button type="submit" className="p-3 text-[var(--text-muted)] hover:text-sky-500 transition-colors cursor-pointer">
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-sky-500" /> : <SearchIcon className="w-5 h-5" />}
          </button>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchError(null);
            }}
            placeholder="Search for a location..." 
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] py-3"
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="p-3 text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </form>
        
        {/* Search Error */}
        {searchError && (
          <div className="mt-2 w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold shadow-panel text-center">
            {searchError}
          </div>
        )}
        
        {/* Search Suggestions */}
        {showSuggestions && searchResults.length > 0 && (
          <div className="mt-2 w-full max-h-64 overflow-y-auto rounded-xl bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-highlight)] shadow-panel flex flex-col">
            {searchResults.map((res, i) => (
              <button 
                key={i} 
                onClick={() => selectSearchResult(res)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span className="text-xs text-[var(--text-primary)] leading-relaxed">{res.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Zoom Controls */}
      <div className="absolute bottom-6 right-3 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] hover:border-sky-500 hover:text-sky-400 text-[var(--text-primary)] flex items-center justify-center shadow-panel transition-all cursor-pointer">
          <Plus className="w-5 h-5" />
        </button>
        
        <button onClick={toggleFullscreen} className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] hover:border-sky-500 hover:text-sky-400 text-[var(--text-primary)] flex items-center justify-center shadow-panel transition-all cursor-pointer">
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <button onClick={handleZoomOut} className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] hover:border-sky-500 hover:text-sky-400 text-[var(--text-primary)] flex items-center justify-center shadow-panel transition-all cursor-pointer">
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {showLayerControls && mapLoaded && (
        <>
          {/* Top Left: Operational Mode Badge & Reset Center */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] flex items-center gap-2 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">
                GIS Spatial Map [SPATIAL — T0/T1]
              </span>
            </div>

            <button
              onClick={handleResetView}
              className="p-2 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] hover:border-sky-500 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-subtle cursor-pointer"
              title="Reset Region View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playTacticalSound('click');
                setShowLayerDrawer(prev => !prev);
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all shadow-subtle cursor-pointer ${
                showLayerDrawer
                  ? 'bg-sky-500 text-[var(--text-primary)] border-sky-400'
                  : 'bg-[var(--bg-secondary)]/90 backdrop-blur-md border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>
          </div>

          {/* Layer Controls Floating Drawer */}
          {showLayerDrawer && (
            <div className="absolute top-14 left-3 z-10 w-64 rounded-2xl bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-highlight)] p-4 shadow-panel space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Map Overlays
                </span>
                <span className="text-[10px] font-mono text-sky-400">8 Layers</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { key: 'incidents', label: 'Active Incidents (I-1 to I-4)', icon: Flame, color: '#ef4444' },
                  { key: 'resources', label: 'Fleet & Staging Units', icon: Truck, color: '#0284c7' },
                  { key: 'routes', label: 'Routing & 6x6 Bypasses', icon: Navigation, color: '#0ea5e9' },
                  { key: 'hazards', label: 'Wildfire & Smoke Plumes', icon: Flame, color: '#f97316' },
                  { key: 'evacuation', label: 'Evacuation Zones', icon: Shield, color: '#ef4444' },
                  { key: 'agriculture', label: 'Agricultural Farmlands', icon: Sprout, color: '#10b981' },
                  { key: 'wildlife', label: 'Wildlife Corridors', icon: Trees, color: '#a855f7' },
                  { key: 'infrastructure', label: 'Bridges & Power Substations', icon: Activity, color: '#f59e0b' },
                ].map(item => {
                  const active = layers[item.key as keyof typeof layers];
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleLayer(item.key as keyof typeof layers)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        active
                          ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: active ? item.color : '#64748b' }}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {active ? (
                        <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Base Tile Selector */}
              <div className="pt-2 border-t border-[var(--border-color)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                  Base Style
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      playTacticalSound('click');
                      setActiveBaseStyle('positron');
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      activeBaseStyle === 'positron'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Dark Positron
                  </button>
                  <button
                    onClick={() => {
                      playTacticalSound('click');
                      setActiveBaseStyle('liberty');
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      activeBaseStyle === 'liberty'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Topographic
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Right: Quick Scenario Legend */}
          <div className="absolute bottom-3 right-3 z-10 px-3 py-2 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] flex items-center gap-3 text-[11px] text-[var(--text-secondary)] shadow-subtle hidden md:flex">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Critical Incident</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Rescue Resource</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>6x6 Bypass</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Wildlife Zone</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Export backward-compatible alias
export const InteractiveCrisisMap = CrisisMap;
