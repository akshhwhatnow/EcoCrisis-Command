import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Incident } from '../types';
import { imageAssets } from '../data/imageAssets';

export const IncidentDetailsView: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    setSelectedIncidentId,
    resources,
    setActiveTab,
    playTacticalSound,
  } = useCrisis();

  const incident: Incident =
    incidents.find(i => i.id === selectedIncidentId) || incidents[0] || ({} as Incident);

  const assignedResources = resources.filter(r =>
    incident.assignedResourceIds?.includes(r.id) || r.currentAssignmentId === incident.id
  );

  // Pick contextual environmental image
  const getIncidentImage = (id: string) => {
    switch (id) {
      case 'I-1':
        return imageAssets.wildfireValley;
      case 'I-2':
        return imageAssets.agriculture;
      case 'I-3':
        return imageAssets.wildlife;
      case 'I-4':
        return imageAssets.cutOffCommunity;
      default:
        return imageAssets.wildfireValley;
    }
  };

  const asset = getIncidentImage(incident.id);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Incident Switcher Bar */}
      <div className="flex items-center justify-between gap-3 bg-[var(--bg-secondary)] p-3.5 rounded-2xl border border-[var(--border-color)] glass-panel overflow-x-auto shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">
            Active Case Files:
          </span>
          <div className="flex items-center gap-2">
            {incidents.map(inc => (
              <button
                key={inc.id}
                onClick={() => {
                  playTacticalSound('click');
                  setSelectedIncidentId(inc.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                  incident.id === inc.id
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-subtle'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{inc.id}</span>
                <span className="text-[10px] font-normal opacity-80 truncate max-w-[90px]">
                  {inc.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            playTacticalSound('click');
            setActiveTab('map');
          }}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>View on GIS Map</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main 3-Column Operational Case File Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (4 cols): Affected Region Imagery & Geographic Context */}
        <div className="lg:col-span-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden shadow-panel glass-panel space-y-4">
          <div className="relative h-56 w-full overflow-hidden">
            <img
              src={asset.url}
              alt={asset.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-black/40" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-[var(--text-primary)] border border-[var(--border-highlight)]">
              {incident.id} Sector Image
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-[var(--text-primary)]">
              <span className="text-xs font-bold block">{incident.locationName}</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                {incident.coordinates.lat.toFixed(3)}°N, {Math.abs(incident.coordinates.lng).toFixed(3)}°W
              </span>
            </div>
          </div>

          <div className="p-4 pt-0 space-y-3">
            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Road Access:</span>
                <span className="font-semibold text-[var(--text-primary)]">{incident.accessibility.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Corridor Name:</span>
                <span className="font-medium text-[var(--text-primary)] truncate max-w-[160px]">
                  {incident.accessibility.roadName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">River Viability:</span>
                <span className="font-semibold text-cyan-400">
                  {incident.accessibility.riverRouteAvailable ? 'Yes (Boat 1 Staging)' : 'No'}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-[var(--text-muted)] italic">
              Photo by {asset.attribution.photographer} on Unsplash
            </div>
          </div>
        </div>

        {/* Center Column (5 cols): Incident Identity, Severity, CAD Timeline, AI Analysis */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
          <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-sky-400">{incident.id}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    incident.severity === 'Critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {incident.severity}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {incident.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{incident.name}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-[var(--text-muted)] block">Reported</span>
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">{incident.reportedAt}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
              Field Situation Report
            </span>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Affected Population & Assets */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                Human Population
              </span>
              <span className="text-base font-extrabold text-[var(--text-primary)]">
                {incident.impact.peopleAtRisk.toLocaleString()}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">Residents at risk</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                Livestock &amp; Crops
              </span>
              <span className="text-base font-extrabold text-emerald-400">
                {incident.impact.livestockCount > 0
                  ? `${incident.impact.livestockCount} head`
                  : incident.impact.cropHectares > 0
                  ? `${incident.impact.cropHectares} ha`
                  : 'Minimal'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">Agricultural assets</span>
            </div>
          </div>

          {/* Live CAD Timeline */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
              Incident Activity &amp; Telemetry Timeline [FROM GATEWAYS]
            </span>
            <div className="space-y-2 border-l-2 border-[var(--border-color)] pl-3 ml-1">
              {incident.liveTimeline.map((item, idx) => (
                <div key={idx} className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-sky-400 font-bold">{item.time}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        item.level === 'critical'
                          ? 'bg-red-500/20 text-red-300'
                          : item.level === 'warning'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {item.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (3 cols): Assigned Resources, ETA, Recommended Action */}
        <div className="lg:col-span-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
          <div className="border-b border-[var(--border-color)] pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
              Tactical Response Units
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">Assigned &amp; en route</span>
          </div>

          {/* Assigned Resources List */}
          <div className="space-y-2">
            {assignedResources.length > 0 ? (
              assignedResources.map(res => (
                <div
                  key={res.id}
                  className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{res.name}</span>
                    <span className="text-[10px] font-mono text-sky-400 font-bold">{res.etaMinutes}m ETA</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">Type: {res.type}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                    Capacity: {res.capacity}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                No active resources assigned to this sector.
              </div>
            )}
          </div>

          {/* AI Recommendation Insight */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">
              AI Decision Recommendation
            </span>
            <p className="text-xs text-purple-200 leading-relaxed">
              {incident.aiInsights}
            </p>
          </div>

          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('approval');
            }}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Review Gated Action</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
