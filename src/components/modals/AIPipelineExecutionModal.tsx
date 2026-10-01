import React from 'react';
import { useCrisis } from '../../context/CrisisContext';
import {
  Sparkles,
  Bot,
  Flame,
  Sprout,
  Trees,
  Navigation,
  Compass,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  ArrowRight,
  X,
} from 'lucide-react';

export const AIPipelineExecutionModal: React.FC = () => {
  const {
    isReplanning,
    replanningProgress,
    activeAgentProcessingId,
    agents,
    setActiveTab,
    playTacticalSound,
    dismissReplanningModal,
  } = useCrisis();

  if (!isReplanning && replanningProgress === 0) return null;

  const pipelineStages = [
    {
      id: 'agent-incident',
      name: 'Incident Assessment',
      icon: Flame,
      loadingText: 'Assessing incident severity and normalizing multi-source CAD telemetry...',
      color: '#ef4444',
    },
    {
      id: 'agent-hazard',
      name: 'Hazard & Weather',
      icon: Flame,
      loadingText: 'Evaluating simulated fire spread, smoke dispersion & 48 km/h wind conditions [SIMULATED — DEMO DATA]...',
      color: '#f97316',
    },
    {
      id: 'agent-agri',
      name: 'Agriculture & Livestock',
      icon: Sprout,
      loadingText: 'Evaluating agricultural exposure (450 ha) and 3.5 hr herd smoke buffer...',
      color: '#eab308',
    },
    {
      id: 'agent-wildlife',
      name: 'Wildlife & Ecosystem',
      icon: Trees,
      loadingText: 'Assessing Pine Ridge sanctuary corridor & animal displacement vectors...',
      color: '#a855f7',
    },
    {
      id: 'agent-route',
      name: 'Route & Logistics',
      icon: Navigation,
      loadingText: 'Isolating collapsed Hwy 27 bridge and routing 6x6 North River bypass...',
      color: '#3b82f6',
    },
    {
      id: 'agent-verification',
      name: 'Verification Agent',
      icon: ShieldCheck,
      loadingText: 'Triangulating multi-source sensor confidence and generating 5 human review flags...',
      color: '#10b981',
    },
    {
      id: 'agent-alloc',
      name: 'Resource Optimization',
      icon: Compass,
      loadingText: 'Executing deterministic Hungarian solver for scarce resource matching...',
      color: '#06b6d4',
    },
    {
      id: 'agent-command',
      name: 'Command Orchestrator',
      icon: Cpu,
      loadingText: 'Synthesizing Option 1 Recommended plan and compiling visual Plan Diff...',
      color: '#8b5cf6',
    },
  ];

  const currentStageIndex = pipelineStages.findIndex(s => s.id === activeAgentProcessingId);
  const currentStage = pipelineStages[currentStageIndex] || pipelineStages[pipelineStages.length - 1];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-3xl rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-highlight)] p-6 sm:p-8 shadow-2xl glass-panel-elevated space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 glow-accent animate-pulse">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  Multi-Agent AI Decision Pipeline
                </h3>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {replanningProgress}%
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Orchestrating 8 specialized domain agents with deterministic optimization solver
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Solver Mode
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Deterministic Hungarian + Constraints
              </span>
            </div>

            {replanningProgress === 100 && (
              <button
                onClick={() => {
                  playTacticalSound('click');
                  dismissReplanningModal();
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Contextual Action Status */}
        <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-3.5 glow-accent">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Active Pipeline Stage: {currentStage.name}
            </div>
            <p className="text-xs text-[var(--text-primary)] font-medium truncate mt-0.5 animate-pulse">
              {currentStage.loadingText}
            </p>
          </div>
        </div>

        {/* Sequential 8-Agent Stepper Visualizer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {pipelineStages.map((stage, idx) => {
            const isCurrent = stage.id === activeAgentProcessingId;
            const isPassed = currentStageIndex > idx || replanningProgress === 100;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border text-xs transition-all flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-emerald-500/20 border-emerald-500 shadow-md glow-accent scale-102'
                    : isPassed
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-[var(--bg-card)]/40 border-[var(--border-color)] opacity-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isPassed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-emerald-500 text-slate-950 animate-bounce'
                      : 'bg-slate-800 text-[var(--text-muted)]'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-[11px] text-[var(--text-primary)] block truncate">
                    {stage.name}
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono">
                    {isPassed ? 'Completed' : isCurrent ? 'Analyzing...' : 'Queued'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
            <span>Deterministic Spatial Overlay Execution</span>
            <span>{replanningProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden border border-[var(--border-color)]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${replanningProgress}%` }}
            />
          </div>
        </div>

        {/* Completion Footer */}
        {replanningProgress === 100 && (
          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Multi-Agent Replanning Converged (0.45s) • Option 1 Ready</span>
            </div>

            <button
              onClick={() => {
                playTacticalSound('click');
                dismissReplanningModal();
                setActiveTab('approval');
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs shadow-lg glow-accent flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Revised Plan & Diff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
