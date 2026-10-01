import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  Sliders,
  Play,
  RotateCcw,
  Flame,
  Wind,
  Truck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const ReplanningSimulatorView: React.FC = () => {
  const { startReplanning, isReplanning, setActiveTab, playTacticalSound } = useCrisis();

  const [windSpeed, setWindSpeed] = useState<number>(48);
  const [windDirection, setWindDirection] = useState<string>('NE');
  const [lifeSafetyWeight, setLifeSafetyWeight] = useState<number>(95);
  const [agricultureWeight, setAgricultureWeight] = useState<number>(65);
  const [wildlifeWeight, setWildlifeWeight] = useState<number>(60);
  const [bridgeStatus, setBridgeStatus] = useState<'Open' | 'Collapsed'>('Collapsed');
  const [vehicleAStatus, setVehicleAStatus] = useState<'Operational' | 'Breakdown'>('Breakdown');

  const [simResult, setSimResult] = useState<{
    solved: boolean;
    duration: number;
    recommendedOption: string;
    tradeoffs: string;
  } | null>(null);

  const handleRunSimulation = async () => {
    playTacticalSound('replan');
    await startReplanning();
    setSimResult({
      solved: true,
      duration: 0.45,
      recommendedOption: 'Option 1: Recommended Plan (Deterministic Weighted Heuristic)',
      tradeoffs: 'Safeguards 100% human lives via 6x6 bypass and river ferry; preserves cattle via 3.5h smoke buffer.',
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            What-If Scenario Simulation Sandbox
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Custom Crisis Stress-Testing &amp; Optimization Solver
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Evaluate custom wind vectors, bridge cutoffs, vehicle breakdowns, and multi-objective optimization weights.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isReplanning}
          className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle flex items-center gap-2 cursor-pointer transition-all"
        >
          <Sparkles className={`w-4 h-4 ${isReplanning ? 'animate-spin' : ''}`} />
          <span>{isReplanning ? 'Solving Multi-Agent Optimization...' : 'Execute What-If Simulation'}</span>
        </button>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Environmental & Infrastructure Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4 text-xs">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              1. Atmospheric &amp; Hazard Vectors
            </span>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  <span>Wind Speed (km/h)</span>
                  <span className="text-sky-400 font-mono">{windSpeed} km/h</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={windSpeed}
                  onChange={e => setWindSpeed(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1.5">
                  Wind Direction Vector
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {['N', 'NE', 'E', 'SE'].map(dir => (
                    <button
                      key={dir}
                      onClick={() => setWindDirection(dir)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        windDirection === dir
                          ? 'bg-sky-500/20 text-sky-400 border-sky-400'
                          : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4 text-xs">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              2. Infrastructure &amp; Fleet Failures
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">Highway 27 North Bridge</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Crestview river crossing</span>
                </div>
                <button
                  onClick={() => setBridgeStatus(b => (b === 'Open' ? 'Collapsed' : 'Open'))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                    bridgeStatus === 'Collapsed'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {bridgeStatus}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">Evacuation Vehicle A</span>
                  <span className="text-[11px] text-[var(--text-muted)]">80-passenger heavy hauler</span>
                </div>
                <button
                  onClick={() => setVehicleAStatus(v => (v === 'Operational' ? 'Breakdown' : 'Operational'))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                    vehicleAStatus === 'Breakdown'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {vehicleAStatus}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Weighting & Solver Output (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4 text-xs">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              3. Multi-Objective Solver Weights
            </span>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  <span>Human Life-Safety Priority</span>
                  <span className="text-sky-400 font-mono font-bold">{lifeSafetyWeight}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={lifeSafetyWeight}
                  onChange={e => setLifeSafetyWeight(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  <span>Agricultural Herd &amp; Crop Weight</span>
                  <span className="text-emerald-400 font-mono font-bold">{agricultureWeight}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={agricultureWeight}
                  onChange={e => setAgricultureWeight(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  <span>Wildlife Sanctuary &amp; Corridor Weight</span>
                  <span className="text-purple-400 font-mono font-bold">{wildlifeWeight}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={wildlifeWeight}
                  onChange={e => setWildlifeWeight(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Solver Result Card */}
          {simResult && (
            <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/30 p-5 shadow-panel space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulation Solver Converged</span>
                </div>
                <span className="font-mono text-emerald-300">{simResult.duration}s</span>
              </div>

              <div>
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Recommended Allocation</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{simResult.recommendedOption}</span>
              </div>

              <p className="text-[11px] text-emerald-200 leading-relaxed">
                {simResult.tradeoffs}
              </p>

              <button
                onClick={() => {
                  playTacticalSound('click');
                  setActiveTab('approval');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Inspect in Human Approval Gateway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
