import React, { useState, useEffect } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Scale,
  GitCompare,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { PlanOption } from '../types';
import { plansApi } from '../services/api';

export const ResponsePlansView: React.FC = () => {
  const {
    responsePlans,
    selectedPlanId,
    selectResponsePlan,
    setActiveTab,
    startReplanning,
    isReplanning,
    playTacticalSound,
  } = useCrisis();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchCandidates() {
      try {
        setLoadingCandidates(true);
        const data = await plansApi.getCandidates();
        if (isMounted && data && data.length > 0) {
          setCandidates(data);
        }
      } catch (err) {
        console.warn('Could not load candidates from backend, using context plans:', err);
      } finally {
        if (isMounted) setLoadingCandidates(false);
      }
    }
    fetchCandidates();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPlan: PlanOption =
    responsePlans.find((p) => p.id === selectedPlanId) || responsePlans[0];

  const candidateRecord = candidates.find((c) => c.planId === selectedPlanId || c.planId === currentPlan.id);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Top Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Phase 6 Multi-Option Decision Intelligence
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-sky-400" />
            <span>Candidate Response Plans &amp; Strategic Options</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Evaluating Options 1–3 under explicit objective weight constraints. All candidate plans remain strictly <strong className="text-amber-400 font-mono">Pending Approval</strong> until authorized by Human Operator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('trade-offs');
            }}
            className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] font-semibold text-xs border border-[var(--border-color)] flex items-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Trade-Off &amp; Sensitivity</span>
          </button>
          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('plan-diff');
            }}
            className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] font-semibold text-xs border border-[var(--border-color)] flex items-center gap-1.5 cursor-pointer"
          >
            <GitCompare className="w-4 h-4 text-sky-400" />
            <span>Compare Plan Diff</span>
          </button>
          <button
            onClick={() => {
              playTacticalSound('replan');
              startReplanning();
            }}
            disabled={isReplanning}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-subtle"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReplanning ? 'animate-spin' : ''}`} />
            <span>Re-solve Options</span>
          </button>
        </div>
      </div>

      {/* Candidate Plan Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {responsePlans.map((option) => {
          const isSelected = option.id === selectedPlanId;
          const matchCand = candidates.find((c) => c.planId === option.id);
          const weights = matchCand?.weights || { lifeSafety: 0.7, agriculture: 0.1, ecosystem: 0.1, fleetStress: 0.05, travelLogistics: 0.05 };

          return (
            <div
              key={option.id}
              onClick={() => {
                playTacticalSound('click');
                selectResponsePlan(option.id);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[var(--bg-secondary)] border-sky-400 shadow-panel ring-1 ring-sky-400/50'
                  : 'bg-[var(--bg-secondary)]/70 border-[var(--border-color)] hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[var(--text-primary)]">
                    {option.id.includes('OPT1') || option.id.includes('opt-1')
                      ? 'Candidate Option 1 — Life-Safety Priority Profile'
                      : option.id.includes('OPT2') || option.id.includes('opt-2')
                      ? 'Candidate Option 2 — Agriculture Priority Profile'
                      : 'Candidate Option 3 — Ecosystem Priority Profile'}
                  </span>
                  {option.isRecommended || option.id.includes('OPT1') || option.id.includes('opt-1') ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Recommended [GOVERNANCE MANDATE]
                    </span>
                  ) : option.id.includes('OPT2') || option.id.includes('opt-2') ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Agricultural Priority Profile
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Ecosystem Priority Profile
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mb-2">
                  Focus: <strong className="text-[var(--text-primary)]">{option.subtitle}</strong>
                </div>

                {/* Objective Weights Badges */}
                <div className="mb-3 p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]/60 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] flex items-center justify-between">
                    <span>OBJECTIVE WEIGHTS</span>
                    <span className="text-sky-400">[GOVERNANCE]</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                    <span className="text-emerald-400">Life: {(weights.lifeSafety * 100).toFixed(0)}%</span>
                    <span className="text-amber-400">Agri: {(weights.agriculture * 100).toFixed(0)}%</span>
                    <span className="text-purple-400">Eco: {(weights.ecosystem * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                  {option.tradeOffSummary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">STATUS</span>
                  <span className="text-xs font-bold text-amber-400">Pending Approval</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-muted)] block">CONFIDENCE</span>
                  <span className="text-base font-extrabold text-sky-400">{option.confidenceScore}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Plan Deep-Dive & Action Gate */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-[var(--border-color)] pb-3 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-400">{currentPlan.id}</span>
              <h2 className="text-base font-bold text-[var(--text-primary)]">{currentPlan.title}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PENDING OPERATOR AUTHORIZATION
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{currentPlan.tradeOffSummary}</p>
          </div>
          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('approval');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle flex items-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Human Approval Gate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expected Outcomes */}
        {currentPlan.expectedOutcomes && currentPlan.expectedOutcomes.length > 0 && (
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
              Expected Operational Outcomes &amp; Provenance
            </span>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
              {currentPlan.expectedOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assignments Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] block">
            Resource Allocation Schedule
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentPlan.assignments.map((asgn, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">{asgn.resourceName}</span>
                  <span className="font-mono text-sky-400 font-semibold">{asgn.etaMinutes}m ETA</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">&rarr; {asgn.incidentName}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">{asgn.notes}</div>
                {asgn.routeDetails && (
                  <div className="text-[10px] font-mono text-[var(--text-muted)]">Route: {asgn.routeDetails}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
