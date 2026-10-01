import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  GitCompare,
  ArrowRight,
  Truck,
  Shield,
  LifeBuoy,
  AlertTriangle,
  Clock,
  Layers,
  ArrowDownRight,
  CheckCircle2,
  AlertOctagon,
  Crosshair,
  FileSearch,
} from 'lucide-react';
import { PlanDiffItem } from '../types';
import { AgentEvidenceTrace } from '../components/command/AgentEvidenceTrace';

export const PlanDiffView: React.FC = () => {
  const {
    planDiffs,
    activePlan,
    selectedDiffItem,
    selectDiffItem,
    setActiveTab,
    playTacticalSound,
  } = useCrisis();

  const getBadgeDetails = (type: PlanDiffItem['type']) => {
    switch (type) {
      case 'reallocated':
        return {
          label: 'REALLOCATED / REROUTED',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'delayed':
        return {
          label: 'SECTOR DELAYED',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'removed':
        return {
          label: 'REMOVED / FAILED',
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      case 'expanded':
        return {
          label: 'ROLE EXPANDED',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        };
      case 'added':
        return {
          label: 'NEW ASSIGNMENT',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        };
      case 'preserved':
      default:
        return {
          label: 'PRESERVED BASELINE',
          color: 'bg-slate-700/40 text-[var(--text-secondary)] border-slate-600/30',
        };
    }
  };

  const formatProvenanceBadges = (text: string) => {
    const provenancePattern = /\[(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = provenancePattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const tag = match[1];
      let badgeStyle = 'bg-slate-800 text-[var(--text-secondary)] border-slate-700';
      if (tag.includes('FROM GATEWAYS')) {
        badgeStyle = 'bg-blue-900/40 text-blue-300 border-blue-600/40 font-bold';
      } else if (tag.includes('DATABASE')) {
        badgeStyle = 'bg-emerald-900/40 text-emerald-300 border-emerald-600/40 font-bold';
      } else if (tag.includes('CALCULATION')) {
        badgeStyle = 'bg-purple-900/40 text-purple-300 border-purple-600/40';
      } else if (tag.includes('AGENT-DERIVED') || tag.includes('RECOMMENDATION')) {
        badgeStyle = 'bg-amber-900/40 text-amber-300 border-amber-600/40';
      } else if (tag.includes('SIMULATED')) {
        badgeStyle = 'bg-rose-900/30 text-rose-300 border-rose-600/30';
      }

      parts.push(
        <span
          key={`${match.index}-${tag}`}
          className={`inline-block text-[10px] px-1.5 py-0.5 rounded border mx-1 font-mono uppercase ${badgeStyle}`}
        >
          [{tag}]
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const handleInspectOnMap = (item: PlanDiffItem) => {
    playTacticalSound('click');
    selectDiffItem(item);
    setActiveTab('dashboard');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" />
            Authoritative Plan Differential Engine
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Plan Diff: PLAN-T0-BASE &rarr; {activePlan?.id || 'PLAN-T1-REVISED'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Structured itemized diff highlighting resource relocations, delayed sectors, and explicit evidence provenance tags.
          </p>
        </div>

        <button
          onClick={() => {
            playTacticalSound('click');
            setActiveTab('approval');
          }}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle flex items-center gap-2 cursor-pointer transition-all"
        >
          <span>Proceed to Human Approval</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Diff Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Total Plan Changes</span>
          <span className="text-2xl font-extrabold text-[var(--text-primary)]">{planDiffs.length}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel">
          <span className="text-[10px] font-bold text-emerald-400 uppercase block">Reallocated Units</span>
          <span className="text-2xl font-extrabold text-emerald-300">
            {planDiffs.filter(d => d.type === 'reallocated').length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel">
          <span className="text-[10px] font-bold text-amber-400 uppercase block">Delayed Sectors</span>
          <span className="text-2xl font-extrabold text-amber-300">
            {planDiffs.filter(d => d.type === 'delayed').length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel">
          <span className="text-[10px] font-bold text-cyan-400 uppercase block">Corridor Status</span>
          <span className="text-2xl font-extrabold text-cyan-300">Preserved</span>
        </div>
      </div>

      {/* Diff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {planDiffs.map((item, idx) => {
          const badge = getBadgeDetails(item.type);
          const isSelected =
            selectedDiffItem?.resourceId === item.resourceId &&
            selectedDiffItem?.newAssignment === item.newAssignment;

          return (
            <div
              key={idx}
              onClick={() => {
                playTacticalSound('click');
                selectDiffItem(item);
              }}
              className={`rounded-2xl p-4 shadow-subtle glass-panel space-y-3 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-400 ring-1 ring-sky-400/50'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-slate-500'
              }`}
            >
              {/* Diff Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">{item.resourceName || item.resourceId}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              {/* Before / After Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 space-y-1">
                  <span className="text-[10px] font-bold text-red-400 uppercase block">BEFORE (PLAN-T0-BASE)</span>
                  <p className="text-[11px] leading-tight">{item.previousAssignment}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">AFTER ({activePlan?.id || 'PLAN-T1-REVISED'})</span>
                  <p className="text-[11px] leading-tight">{item.newAssignment}</p>
                </div>
              </div>

              {/* Reason & Impact / Consequence */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] shrink-0 mt-0.5">
                    Reason:
                  </span>
                  <div className="text-[var(--text-secondary)] leading-relaxed">
                    {formatProvenanceBadges(item.reason)}
                  </div>
                </div>

                {item.consequence && (
                  <div className="flex items-start gap-1.5 pt-1.5 border-t border-[var(--border-color)]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 shrink-0 mt-0.5">
                      Consequence:
                    </span>
                    <div className="text-[var(--text-primary)] leading-relaxed font-medium">
                      {formatProvenanceBadges(item.consequence)}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Inspect Button */}
              <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Click to focus entity
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectOnMap(item);
                  }}
                  className="px-3 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Inspect on Map &amp; Telemetry</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Evidence Traceability Section */}
      <AgentEvidenceTrace />
    </div>
  );
};
