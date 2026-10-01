import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  Truck,
  Shield,
  LifeBuoy,
  Sprout,
  Trees,
  Crosshair,
  AlertOctagon,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  BatteryCharging,
  Zap,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Resource, ResourceType, ResourceState } from '../types';

export const ResourceManagementView: React.FC = () => {
  const {
    resources,
    toggleResourceFailure,
    setActiveTab,
    setSelectedResourceId,
    playTacticalSound,
  } = useCrisis();

  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const typeCounts = {
    All: resources.length,
    'Evacuation Vehicles': resources.filter(r => r.type === 'Evacuation Vehicle').length,
    'Rescue Teams': resources.filter(r => r.type === 'Rescue Team' || r.type === 'Transport Team').length,
    Boats: resources.filter(r => r.type === 'Boat').length,
    'Agriculture Support': resources.filter(r => r.type === 'Agricultural Support' || r.type === 'Veterinary Support').length,
    'Wildlife Teams': resources.filter(r => r.type === 'Wildlife Team').length,
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.currentAssignmentName && r.currentAssignmentName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'All') return true;
    if (filterType === 'Evacuation Vehicles') return r.type === 'Evacuation Vehicle';
    if (filterType === 'Rescue Teams') return r.type === 'Rescue Team' || r.type === 'Transport Team';
    if (filterType === 'Boats') return r.type === 'Boat';
    if (filterType === 'Agriculture Support') return r.type === 'Agricultural Support' || r.type === 'Veterinary Support';
    if (filterType === 'Wildlife Teams') return r.type === 'Wildlife Team';
    return true;
  });

  const getStatusBadge = (state: ResourceState, isFailure?: boolean) => {
    if (isFailure || state === 'Unavailable') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          Unavailable (Failure)
        </span>
      );
    }
    if (state === 'En route') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
          En route
        </span>
      );
    }
    if (state === 'Assigned') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Assigned
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/20 text-[var(--text-secondary)] border border-slate-500/30">
        Available
      </span>
    );
  };

  const handleShowOnMap = (resId: string) => {
    playTacticalSound('click');
    setSelectedResourceId(resId);
    setActiveTab('dashboard');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-sky-400" />
            <span>Operational Fleet &amp; Resource Management</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Fleet staging locations, specialized capabilities, and simulated mechanical telemetry [DATABASE / DEMO]
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
            {resources.filter(r => r.state !== 'Unavailable').length} Operational
          </span>
          {resources.some(r => r.state === 'Unavailable') && (
            <span className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono font-bold animate-pulse">
              1 Breakdown
            </span>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-color)] glass-panel">
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto">
          {Object.entries(typeCounts).map(([type, count]) => (
            <button
              key={type}
              onClick={() => {
                playTacticalSound('click');
                setFilterType(type);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-sky-500 text-[var(--text-primary)] shadow-subtle'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{type}</span>
              <span className="ml-1.5 text-[10px] font-mono opacity-80">({count})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter unit ID, name, location..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(res => {
          const isFailed = res.state === 'Unavailable' || res.isSimulatedFailure;
          return (
            <div
              key={res.id}
              className={`p-4 rounded-2xl border transition-all glass-panel space-y-3 ${
                isFailed
                  ? 'bg-red-950/20 border-red-500/40 shadow-subtle'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
              }`}
            >
              {/* Unit Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400">{res.id}</span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{res.name}</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">{res.type}</span>
                </div>
                {getStatusBadge(res.state, res.isSimulatedFailure)}
              </div>

              {/* Assignment & Location */}
              <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Assignment:</span>
                  <span className="font-semibold text-[var(--text-primary)] truncate max-w-[170px]">
                    {res.currentAssignmentName || 'Standby / Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Staging Area:</span>
                  <span className="text-[var(--text-secondary)] truncate max-w-[170px]">
                    {res.locationName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">ETA to Target:</span>
                  <span className="font-mono font-bold text-sky-400">
                    {(res.etaMinutes ?? 0) > 0 ? `${res.etaMinutes} min` : 'At Scene / 0m'}
                  </span>
                </div>
              </div>

              {/* Capabilities */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Capabilities &amp; Capacity
                </span>
                <div className="text-[11px] text-[var(--text-primary)] font-medium truncate">{res.capacity}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {res.specialCapabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleShowOnMap(res.id)}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Show on Map</span>
                </button>

                {res.id === 'RES-EVAC-A' && (
                  <button
                    onClick={() => {
                      playTacticalSound('click');
                      toggleResourceFailure(res.id);
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/20 cursor-pointer"
                  >
                    {isFailed ? 'Clear Breakdown' : 'Simulate Breakdown'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
