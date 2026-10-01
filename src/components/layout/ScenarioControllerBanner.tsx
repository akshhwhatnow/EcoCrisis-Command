import React from 'react';
import { useCrisis } from '../../context/CrisisContext';
import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Flame,
  Activity,
} from 'lucide-react';

import { MISSION_STAGES, getDerivedMissionStage } from '../../utils/missionWorkflow';

export const ScenarioControllerBanner: React.FC = () => {
  const {
    phase,
    triggerCrisisEvent,
    startReplanning,
    resetScenario,
    isReplanning,
    replanningProgress,
    setActiveTab,
    playTacticalSound,
    activeTab,
  } = useCrisis();

  const currentMissionStage = getDerivedMissionStage(phase, activeTab);
  const currentStep = currentMissionStage.stepNumber;
  const steps = MISSION_STAGES;

  return (
    <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-2.5 flex flex-col lg:flex-row items-center justify-between gap-3 select-none text-xs transition-colors">
      {/* Left: Mission Stepper Rail */}
      <div className="w-full lg:w-auto flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1">
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">MISSION STEPPER</span>
        </div>

        {steps.map((s, idx) => {
          const isActive = currentStep === s.stepNumber;
          const isPassed = currentStep > s.stepNumber;

          return (
            <React.Fragment key={s.stepNumber}>
              {idx > 0 && (
                <div
                  className={`w-3 sm:w-6 h-[2px] shrink-0 ${
                    isPassed ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click');
                  setActiveTab(s.recommendedTab);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-subtle ring-1 ring-sky-400/50'
                    : isPassed
                    ? 'bg-slate-800/80 text-[var(--text-secondary)] border-slate-700 hover:border-slate-500'
                    : 'bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--text-muted)]'
                }`}
                title={`Step ${s.stepNumber}: ${s.label} (${s.shortDesc})`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isActive
                      ? 'bg-sky-400 text-slate-950'
                      : isPassed
                      ? 'bg-sky-500/30 text-sky-300'
                      : 'bg-slate-800 text-[var(--text-muted)]'
                  }`}
                >
                  {isPassed ? '✓' : s.stepNumber}
                </span>
                <span className="font-mono tracking-tight">{s.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Operational Phase Context & Single Primary Forward CTA */}
      <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 shrink-0">
        {/* Context Narrative */}
        <div className="text-[11px] text-[var(--text-secondary)] hidden xl:flex items-center gap-2">
          {phase === 'T0_INITIAL' && (
            <span>
              <strong className="text-[var(--text-primary)]">T0 Baseline:</strong> 3 Incidents seeded [DATABASE — T0 SEED]
            </span>
          )}
          {phase === 'T0_PLUS_10_CRISIS' && (
            <span className="text-red-400 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              T0+10m: Cutoff (I-4) &amp; Vehicle A Breakdown [SIMULATED — DEMO DATA]
            </span>
          )}
          {phase === 'REPLANNING_IN_PROGRESS' && (
            <span className="text-amber-300 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
              Evaluating 8 Domain Agents ({replanningProgress}%)...
            </span>
          )}
          {phase === 'REVISED_PLAN_READY' && (
            <span className="text-purple-300 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Candidate Option 1 Ready • Commander Gating Required
            </span>
          )}
          {phase === 'PLAN_APPROVED' && (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Plan Authorized &amp; Logged [GOVERNANCE GATE — NO AUTONOMOUS DISPATCH]
            </span>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          {phase === 'T0_INITIAL' && (
            <button
              type="button"
              onClick={() => {
                playTacticalSound('alert');
                triggerCrisisEvent();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle transition-all cursor-pointer"
              aria-label="Simulate T0+10m Compound Crisis"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Simulate T0+10m Crisis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {phase === 'T0_PLUS_10_CRISIS' && (
            <button
              type="button"
              onClick={() => {
                playTacticalSound('replan');
                startReplanning();
              }}
              disabled={isReplanning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle transition-all cursor-pointer"
              aria-label="Run Multi-Agent Replanning Pipeline"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isReplanning ? 'animate-spin' : ''}`} />
              <span>Run Multi-Agent Replan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {phase === 'REVISED_PLAN_READY' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click');
                  setActiveTab('plan-diff');
                }}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] font-medium text-xs border border-[var(--border-color)] cursor-pointer"
              >
                Inspect Plan Diff
              </button>
              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click');
                  setActiveTab('approval');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Review &amp; Authorize</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {phase === 'PLAN_APPROVED' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click');
                  setActiveTab('audit');
                }}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] font-medium text-xs border border-[var(--border-color)] cursor-pointer"
              >
                Inspect Audit Log
              </button>
              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click');
                  resetScenario();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] text-xs cursor-pointer transition-colors"
                title="Reset scenario back to T0 initial baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Scenario</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

