import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  Flame,
  AlertTriangle,
  Clock,
  ArrowRight,
  Search,
  MapPin,
  Users,
  Sprout,
  Trees,
  ExternalLink,
} from 'lucide-react';
import { Incident } from '../types';

export const IncidentsListView: React.FC = () => {
  const {
    incidents,
    setSelectedIncidentId,
    setActiveTab,
    playTacticalSound,
  } = useCrisis();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch =
      inc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (severityFilter === 'ALL') return true;
    return inc.severity === severityFilter;
  });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            Operational Incident Registry
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Active Compound Crisis Incidents ({incidents.length})
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Ingested from PostgreSQL database records [DATABASE — T0 SEED] and simulated environmental telemetry [SIMULATED — DEMO DATA].
          </p>
        </div>

        <button
          onClick={() => {
            playTacticalSound('click');
            setActiveTab('map');
          }}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-semibold text-xs shadow-subtle flex items-center gap-2 cursor-pointer"
        >
          <span>View on GIS Map</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-color)] glass-panel">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {['ALL', 'Critical', 'High', 'Medium-High'].map(sev => (
            <button
              key={sev}
              onClick={() => {
                playTacticalSound('click');
                setSeverityFilter(sev);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-sky-500 text-[var(--text-primary)] shadow-subtle'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {sev === 'ALL' ? 'All Incidents' : sev}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search incident name, sector..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Incident Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.map(inc => {
          const isCritical = inc.severity === 'Critical';
          return (
            <div
              key={inc.id}
              className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-subtle glass-panel space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-sky-400">{inc.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{inc.status}</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{inc.name}</h3>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{inc.locationName}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">Reported</span>
                  <span className="text-xs font-mono text-[var(--text-primary)] font-semibold">{inc.reportedAt}</span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {inc.description}
              </p>

              <div className="grid grid-cols-3 gap-2 text-[11px] p-2.5 rounded-xl bg-[var(--bg-tertiary)] font-mono">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">People at Risk</span>
                  <span className="font-bold text-[var(--text-primary)]">{inc.impact.peopleAtRisk.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">Livestock / Agri</span>
                  <span className="font-bold text-emerald-400">
                    {inc.impact.livestockCount > 0 ? `${inc.impact.livestockCount} head` : `${inc.impact.cropHectares} ha`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">AI Confidence</span>
                  <span className="font-bold text-sky-400">{inc.confidence}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                <button
                  onClick={() => {
                    playTacticalSound('click');
                    setSelectedIncidentId(inc.id);
                    setActiveTab('map');
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Show on Map</span>
                </button>

                <button
                  onClick={() => {
                    playTacticalSound('click');
                    setSelectedIncidentId(inc.id);
                    setActiveTab('incident-details');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Case File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
