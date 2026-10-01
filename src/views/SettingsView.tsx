import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  Settings,
  Globe,
  Sliders,
  Database,
  Cpu,
  Shield,
  CheckCircle2,
  Save,
  RotateCcw,
  MapPin,
  Volume2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { soundEnabled, setSoundEnabled, playTacticalSound } = useCrisis();
  const [selectedRegionPack, setSelectedRegionPack] = useState<string>('PACIFIC_NW');
  const [unitSystem, setUnitSystem] = useState<'METRIC' | 'IMPERIAL'>('METRIC');
  const [solverMethod, setSolverMethod] = useState<string>('WEIGHTED_ALLOCATION_HEURISTIC');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const regionPacks = [
    {
      id: 'PACIFIC_NW',
      name: 'Pacific Northwest Wildfire & Sanctuary Pack (Active)',
      hazardType: 'Wildfire, Extreme Wind & Radiant Heat',
      details: 'CalFire fuel models, NOAA HRRR weather API, USDA Cropland layer, IUCN Cat II protected sanctuary boundaries.',
      status: 'Active / Seeded',
    },
    {
      id: 'MEDITERRANEAN',
      name: 'Mediterranean Coastal Wildfire & Olive Grove Pack',
      hazardType: 'Wildfire, Drought & Olive Agriculture',
      details: 'Copernicus EMS active fire feeds, ECMWF high-res winds, Natura 2000 protected areas, regional water tenders.',
      status: 'Available',
    },
    {
      id: 'AUSTRALIAN_BUSH',
      name: 'Australian Bushfire & Koala Habitat Pack',
      hazardType: 'Extreme Bushfire, Pyro-cumulonimbus',
      details: 'BoM weather radar, Landgate vegetation, National Koala Sanctuary telemetry collars, 8x8 heavy bushfire units.',
      status: 'Available',
    },
    {
      id: 'SOUTH_ASIA_FLOOD',
      name: 'South Asian Flood, Delta & Cyclone Pack',
      hazardType: 'Monsoon Inundation, River Delta Breach',
      details: 'GPM precipitation radar, river stream gauge telemetry, coastal storm surge barriers, amphibious hovercraft fleet.',
      status: 'Available',
    },
  ];

  const handleSave = () => {
    playTacticalSound('success');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            Global Deployment &amp; Regional Adaptation Framework
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            System Configuration &amp; Global Region Packs
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Decoupled architecture: Regional Data Adapters plug into the common incident &amp; geospatial model.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{savedSuccess ? 'Settings Saved!' : 'Save System Settings'}</span>
        </button>
      </div>

      {/* Region Packs Grid */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4 text-xs">
        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block border-b border-[var(--border-color)] pb-3">
          1. Active Global Region Pack
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regionPacks.map(pack => {
            const isSelected = selectedRegionPack === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => {
                  playTacticalSound('click');
                  setSelectedRegionPack(pack.id);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[var(--bg-secondary)] border-sky-400 shadow-subtle ring-1 ring-sky-400/40'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-[var(--text-primary)]">{pack.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      pack.status.includes('Active')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700 text-[var(--text-secondary)]'
                    }`}>
                      {pack.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-sky-400 mb-2">Hazard: {pack.hazardType}</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {pack.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engine & Preference Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unit System */}
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel space-y-2 text-xs">
          <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider block">Measurement Units</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setUnitSystem('METRIC')}
              className={`py-2 rounded-xl text-xs font-semibold border ${
                unitSystem === 'METRIC'
                  ? 'bg-sky-500 text-[var(--text-primary)] border-sky-400'
                  : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              Metric (km/h, ha)
            </button>
            <button
              onClick={() => setUnitSystem('IMPERIAL')}
              className={`py-2 rounded-xl text-xs font-semibold border ${
                unitSystem === 'IMPERIAL'
                  ? 'bg-sky-500 text-[var(--text-primary)] border-sky-400'
                  : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              Imperial (mph, acres)
            </button>
          </div>
        </div>

        {/* Solver Method */}
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel space-y-2 text-xs">
          <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider block">Optimization Solver</span>
          <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-[11px] text-emerald-400">
            Deterministic Weighted Allocation Heuristic [GOVERNANCE]
          </div>
        </div>

        {/* Audio Alerts */}
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel space-y-2 text-xs">
          <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider block">Tactical Audio Cues</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-full py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 ${
              soundEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-color)]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{soundEnabled ? 'Synthesized Audio Enabled' : 'Audio Muted'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
