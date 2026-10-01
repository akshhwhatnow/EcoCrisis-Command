import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  Flame,
  Truck,
  ShieldCheck,
  ArrowRight,
  Cpu,
  Users,
  Sprout,
  Trees,
  AlertTriangle,
} from 'lucide-react';
import { CrisisMap } from '../components/map/CrisisMap';
import { ResourceContentionCard } from '../components/command/ResourceContentionCard';
import { OmnichannelSimulator } from '../components/command/OmnichannelSimulator';

export const DashboardView: React.FC = () => {
  const {
    incidents,
    resources,
    reviewFlags,
    sectorImpact,
    selectedIncidentId,
    setSelectedIncidentId,
    selectedResourceId,
    setSelectedResourceId,
    phase,
    setActiveTab,
    playTacticalSound,
    agents,
    isBackendConnected,
  } = useCrisis();

  const [inspectorTab, setInspectorTab] = useState<'incident' | 'resource'>('incident');

  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const criticalCount = activeIncidents.filter(i => i.severity === 'Critical').length;
  const deployedResourceCount = resources.filter(
    r => r.state === 'Active' || r.state === 'Assigned' || r.state === 'En route'
  ).length;
  const pendingApprovalsCount = reviewFlags.filter(f => !f.acknowledged).length;

  const selectedIncident =
    incidents.find(i => i.id === selectedIncidentId) || incidents[0] || null;

  const selectedResource =
    resources.find(r => r.id === selectedResourceId) || resources[0] || null;

  const showContentionCard = phase !== 'T0_INITIAL';

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Backend Status Alert hidden for demo purposes */}

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Incidents */}
        <div
          onClick={() => {
            playTacticalSound('click');
            setActiveTab('incidents');
          }}
          className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-red-500/40 transition-all cursor-pointer glass-panel group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Active Incidents
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">{activeIncidents.length}</span>
            <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {criticalCount} Critical
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>{sectorImpact.peopleAtRiskTotal} people at risk</span>
            <span className="text-red-400 group-hover:underline flex items-center gap-0.5">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Fleet Deployed */}
        <div
          onClick={() => {
            playTacticalSound('click');
            setActiveTab('resources');
          }}
          className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500/40 transition-all cursor-pointer glass-panel group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Fleet Readiness
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">{deployedResourceCount}</span>
            <span className="text-xs font-semibold text-sky-400">/ {resources.length} Dispatched</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>
              {resources.filter(r => r.state === 'Unavailable').length > 0
                ? '1 Vehicle Failure Detected'
                : '100% Fleet Operational'}
            </span>
            <span className="text-sky-400 group-hover:underline flex items-center gap-0.5">
              Fleet <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Human Review Flags */}
        <div
          onClick={() => {
            playTacticalSound('click');
            setActiveTab('approval');
          }}
          className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-amber-500/40 transition-all cursor-pointer glass-panel group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Human Action Required
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">{pendingApprovalsCount}</span>
            <span className="text-xs font-semibold text-amber-400">Review Flags</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>Human-in-the-Loop Gating</span>
            <span className="text-amber-400 group-hover:underline flex items-center gap-0.5">
              Authorize <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: AI Optimization Status */}
        <div
          onClick={() => {
            playTacticalSound('click');
            setActiveTab('agents');
          }}
          className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-purple-500/40 transition-all cursor-pointer glass-panel group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              AI Decision Network
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--text-primary)]">{agents.length}</span>
            <span className="text-xs font-semibold text-purple-400">Domain Agents</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>Deterministic Weighted Heuristic</span>
            <span className="text-purple-400 group-hover:underline flex items-center gap-0.5">
              Inspect <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Resource Contention Card if crisis active */}
      {showContentionCard && (
        <ResourceContentionCard
          onInspectIncident={id => {
            setInspectorTab('incident');
            setSelectedIncidentId(id);
          }}
          onInspectResource={id => {
            setInspectorTab('resource');
            setSelectedResourceId(id);
          }}
        />
      )}

      {/* Hero Workspace: Left Priority Queue + Center Real MapLibre Map + Right Contextual Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column (3 cols): Incident Priority Queue */}
        <div className="lg:col-span-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 flex flex-col justify-between glass-panel">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                  Incident Priority Queue
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">Triaged by severity &amp; risk</span>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                {activeIncidents.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {incidents.map(inc => {
                const isSelected = inc.id === selectedIncidentId && inspectorTab === 'incident';
                const isCritical = inc.severity === 'Critical';

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      playTacticalSound('click');
                      setInspectorTab('incident');
                      setSelectedIncidentId(inc.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400 shadow-subtle'
                        : 'bg-[var(--bg-tertiary)]/60 border-[var(--border-color)] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[var(--text-primary)] font-mono">{inc.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {inc.reportedAt}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[var(--text-primary)] truncate mb-1">
                      {inc.name}
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] truncate mb-2">
                      {inc.locationName}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono border-t border-[var(--border-color)]/60 pt-2">
                      <span>{inc.impact.peopleAtRisk} People</span>
                      {inc.impact.livestockCount > 0 && (
                        <span className="text-emerald-400">{inc.impact.livestockCount} Livestock</span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-[var(--text-secondary)] border border-slate-700 font-mono">
                        {inc.id === 'I-4' ? '[FROM GATEWAYS]' : '[DATABASE — T0 SEED]'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-color)]">
            <button
              onClick={() => {
                playTacticalSound('click');
                setActiveTab('incidents');
              }}
              className="w-full py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View All Incident Case Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Column (6 cols): Real GIS Map Hero */}
        <div className="lg:col-span-6 flex flex-col">
          <CrisisMap heightClass="h-[400px] lg:h-[600px] w-full" showLayerControls={true} interactive={true} />
            <OmnichannelSimulator />
        </div>

        {/* Right Column (3 cols): Contextual Inspector (Tabs: Incident Telemetry / Resource Status) */}
        <div className="lg:col-span-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 flex flex-col justify-between glass-panel">
          <div>
            {/* Inspector Tab Switcher */}
            <div className="flex items-center gap-1.5 border-b border-[var(--border-color)] pb-2 mb-3">
              <button
                onClick={() => {
                  playTacticalSound('click');
                  setInspectorTab('incident');
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  inspectorTab === 'incident'
                    ? 'bg-sky-500 text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Incident Telemetry
              </button>
              <button
                onClick={() => {
                  playTacticalSound('click');
                  setInspectorTab('resource');
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  inspectorTab === 'resource'
                    ? 'bg-sky-500 text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Resource Status
              </button>
            </div>

            {inspectorTab === 'incident' && selectedIncident && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{selectedIncident.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {selectedIncident.locationName}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {selectedIncident.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Accessibility:</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {selectedIncident.accessibility.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Corridor:</span>
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[140px]">
                      {selectedIncident.accessibility.roadName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">River Route:</span>
                    <span className="font-semibold text-cyan-400">
                      {selectedIncident.accessibility.riverRouteAvailable ? 'Viable (Rescue Boat 1)' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {/* Assigned Resources */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                    Assigned Response Units
                  </span>
                  <div className="space-y-1">
                    {selectedIncident.assignedResourceIds.length > 0 ? (
                      selectedIncident.assignedResourceIds.map(resId => {
                        const res = resources.find(r => r.id === resId);
                        return (
                          <div
                            key={resId}
                            onClick={() => {
                              setSelectedResourceId(resId);
                              setInspectorTab('resource');
                            }}
                            className="p-2 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-between text-[11px] hover:bg-slate-700 cursor-pointer"
                          >
                            <span className="font-medium text-[var(--text-primary)]">{res?.name || resId}</span>
                            <span className="font-mono text-sky-400 font-semibold">{res?.etaMinutes}m ETA</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                        No resources assigned. Re-planning required.
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Reasoning Insight */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    AI Decision Rationale
                  </span>
                  <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-200 leading-relaxed">
                    {selectedIncident.aiInsights}
                  </div>
                </div>
              </div>
            )}

            {inspectorTab === 'resource' && selectedResource && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{selectedResource.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
                      {selectedResource.id} • {selectedResource.type}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedResource.state === 'Unavailable'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : selectedResource.state === 'Assigned'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    }`}
                  >
                    {selectedResource.state}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Capacity:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{selectedResource.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Crew Count:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{selectedResource.crewCount} personnel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Current Assignment:</span>
                    <span className="font-semibold text-sky-400 truncate max-w-[140px]">
                      {selectedResource.currentAssignmentName || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {selectedResource.isSimulatedFailure && (
                  <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-[11px]">
                    <span className="font-bold block text-red-400 uppercase">Mechanical Failure:</span>
                    <p>{selectedResource.failureReason || 'Vehicle breakdown'}</p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Special Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedResource.specialCapabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[var(--text-secondary)] border border-slate-700"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border-color)]">
            <button
              onClick={() => {
                playTacticalSound('click');
                setActiveTab('approval');
              }}
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Review Operational Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Operational Grid: Compound Exposure (Left 6 cols) + Decision Spine & Gateway (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel 1 (6 cols): Compound Cross-Sector Impact & Fleet Readiness */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                Compound Cross-Sector Impact
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block">Calculated cross-sector exposure baseline</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              [CALCULATION — RISK ENGINE]
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-red-300 font-semibold">
                <Users className="w-3.5 h-3.5 text-red-400" />
                <span>Life Safety</span>
              </div>
              <div className="text-lg font-extrabold text-[var(--text-primary)] font-mono">
                {sectorImpact.peopleAtRiskTotal}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">People at risk</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agriculture</span>
              </div>
              <div className="text-lg font-extrabold text-[var(--text-primary)] font-mono">
                {sectorImpact.cropHectaresTotal} ha
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">Crops &amp; 840 livestock</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold">
                <Trees className="w-3.5 h-3.5 text-purple-400" />
                <span>Ecosystem</span>
              </div>
              <div className="text-lg font-extrabold text-[var(--text-primary)] font-mono">
                {sectorImpact.habitatAreaKm2Total} km²
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">Sanctuary perimeter</div>
            </div>
          </div>
        </div>

        {/* Panel 2 (6 cols): Decision Spine & Commander Gateway */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 mb-2.5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                  Decision Spine &amp; Optimization Status
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block font-mono">
                  Method: Deterministic Weighted Allocation Heuristic
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                HUMAN GATED
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Active Proposal</span>
                <span className="font-bold text-sky-400">
                  {phase === 'T0_INITIAL' ? 'PLAN-T0-BASE (Baseline Operations)' : 'Candidate Option 1 (Life-Safety Priority)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Governance</span>
                <span className="font-bold text-amber-300 font-mono">
                  {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Flags Pending` : 'Awaiting Authorization'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                playTacticalSound('click');
                setActiveTab('plan-diff');
              }}
              className="flex-1 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] hover:text-[var(--text-primary)] font-semibold text-xs border border-[var(--border-color)] transition-colors text-center cursor-pointer"
            >
              Compare Plans &amp; Diff
            </button>
            <button
              type="button"
              onClick={() => {
                playTacticalSound('click');
                setActiveTab('approval');
              }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs shadow-panel flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Human Gate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
