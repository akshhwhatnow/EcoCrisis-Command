import React from 'react';
import { useCrisis } from '../../context/CrisisContext';
import {
  GitMerge,
  Truck,
  Flame,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Scale,
  Compass,
} from 'lucide-react';

interface ResourceContentionCardProps {
  onInspectIncident?: (incidentId: string) => void;
  onInspectResource?: (resourceId: string) => void;
  className?: string;
}

export const ResourceContentionCard: React.FC<ResourceContentionCardProps> = ({
  onInspectIncident,
  onInspectResource,
  className = '',
}) => {
  const {
    phase,
    setSelectedIncidentId,
    setSelectedResourceId,
    setActiveTab,
    playTacticalSound,
  } = useCrisis();

  const handleIncidentClick = (id: string) => {
    playTacticalSound('click');
    setSelectedIncidentId(id);
    if (onInspectIncident) {
      onInspectIncident(id);
    }
  };

  const handleResourceClick = (id: string) => {
    playTacticalSound('click');
    setSelectedResourceId(id);
    if (onInspectResource) {
      onInspectResource(id);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-[var(--bg-secondary)] border border-amber-500/30 p-5 shadow-panel glass-panel space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <GitMerge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                Resource Contention Bottleneck
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                SCARCE ASSET TRIAGE
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              Single heavy hauler demanded by two simultaneous high-consequence sectors
            </span>
          </div>
        </div>

        <button
          onClick={() => handleResourceClick('RES-TRANS-B')}
          className="text-xs font-mono font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>RES-TRANS-B (Team B)</span>
        </button>
      </div>

      {/* Contention Bottleneck Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* Competing Demand 1: I-4 */}
        <div
          onClick={() => handleIncidentClick('I-4')}
          className="md:col-span-4 p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-left transition-all cursor-pointer hover:border-red-400 group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-extrabold text-red-400 px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30">
              DEMAND A: I-4
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-600/40 font-mono">
              [FROM GATEWAYS]
            </span>
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-red-300">
            Cut-Off Settlement Evacuation
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 space-y-0.5">
            <div>
              • <strong>410 residents</strong> trapped{' '}
              <span className="text-[9px] font-mono text-rose-300">[SIMULATED — DEMO DATA]</span>
            </div>
            <div>
              • Access road cut off / bridge impassable{' '}
              <span className="text-[9px] font-mono text-blue-300">[FROM GATEWAYS]</span>
            </div>
            <div>
              • Bridge collapse mechanism{' '}
              <span className="text-[9px] font-mono text-rose-300">[SIMULATED — DEMO DATA]</span>
            </div>
            <div>
              • Requires <strong>6x6 high-clearance bypass</strong> [FROM GATEWAYS]
            </div>
          </div>
          <div className="mt-2.5 pt-1.5 border-t border-red-500/30 flex items-center justify-between text-[10px]">
            <span className="font-bold text-red-400 uppercase">Life-Safety Priority #1</span>
            <span className="text-sky-400 group-hover:underline flex items-center gap-0.5">
              Inspect &rarr;
            </span>
          </div>
        </div>

        {/* Center Contended Resource + Allocator Logic */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block">
              Contended Resource
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)] block">Transport Team B</span>
            <span className="text-[10px] text-sky-400 font-mono">6x6 All-Terrain Heavy</span>
          </div>
          <div className="w-full pt-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] space-y-1">
            <span className="font-bold text-amber-300 block uppercase">
              Allocation Heuristic:
            </span>
            <p className="leading-tight text-[var(--text-secondary)]">
              Deterministic weighted allocation heuristic prioritizes human life preservation over delayed agriculture [GOVERNANCE CONSTRAINT].
            </p>
          </div>
        </div>

        {/* Competing Demand 2: I-2 */}
        <div
          onClick={() => handleIncidentClick('I-2')}
          className="md:col-span-4 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-left transition-all cursor-pointer hover:border-amber-400 group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-extrabold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
              DEMAND B: I-2
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900/30 text-rose-300 border border-rose-600/30 font-mono">
              [SIMULATED — DEMO DATA]
            </span>
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-300">
            Valley Dairy Farm &amp; Livestock
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 space-y-0.5">
            <div>
              • <strong>840 dairy cattle</strong> at risk{' '}
              <span className="text-[9px] font-mono text-rose-300">[SIMULATED — DEMO DATA]</span>
            </div>
            <div>
              • <strong>3.5h simulated smoke buffer</strong>{' '}
              <span className="text-[9px] font-mono text-rose-300">[SIMULATED — DEMO DATA]</span>
            </div>
            <div>
              • Automated sprinkler suppression active [SIMULATED — DEMO DATA]
            </div>
          </div>
          <div className="mt-2.5 pt-1.5 border-t border-amber-500/30 flex items-center justify-between text-[10px]">
            <span className="font-bold text-amber-400 uppercase">Sector Status: Delayed</span>
            <span className="text-sky-400 group-hover:underline flex items-center gap-0.5">
              Inspect &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Resolution & Operational Decision */}
      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[var(--text-primary)]">
            <strong className="text-emerald-300">Operational Resolution:</strong> Team B rerouted to I-4 via North River 6x6 Bypass Trail (estimated 22m ETA [ESTIMATE — SIMULATED DEMO DATA]); I-2 delayed with sprinkler suppression and recommended monitoring [RECOMMENDATION].
          </span>
        </div>
        <button
          onClick={() => {
            playTacticalSound('click');
            setActiveTab('plan-diff');
          }}
          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>View in Plan Diff</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
