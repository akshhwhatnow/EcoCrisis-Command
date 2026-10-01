import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import { CrisisMap } from '../components/map/CrisisMap';
import {
  Compass,
  Flame,
  Truck,
  Shield,
  Activity,
  ArrowRight,
  Maximize2,
} from 'lucide-react';

export const IncidentMapView: React.FC = () => {
  const { incidents, resources, selectedIncidentId, setSelectedIncidentId, setActiveTab, playTacticalSound } = useCrisis();

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1800px] mx-auto select-none">
      {/* Top Header & Incident Quick-Focus Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-color)] glass-panel">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span>Geospatial Operations Theater</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            High-resolution MapLibre GL spatial layers: Simulated wildfire perimeters [SIMULATED — DEMO DATA], 6x6 bypass routes [FROM GATEWAYS], and wildlife sanctuary corridors [DATABASE — T0 SEED]
          </p>
        </div>

        {/* Quick Focus Selector */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">Focus Incident:</span>
          {incidents.map(inc => (
            <button
              key={inc.id}
              onClick={() => {
                playTacticalSound('click');
                setSelectedIncidentId(inc.id);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                selectedIncidentId === inc.id
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-subtle'
                  : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{inc.id}: {inc.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Expansive Real MapLibre GIS Map */}
      <div className="relative">
        <CrisisMap heightClass="h-[calc(100vh-14rem)] min-h-[620px]" showLayerControls={true} />
      </div>
    </div>
  );
};
