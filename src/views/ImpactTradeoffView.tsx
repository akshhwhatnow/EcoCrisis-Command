import React, { useState, useEffect } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  Scale,
  Users,
  Sprout,
  Trees,
  Building,
  ArrowRight,
  TrendingUp,
  Sliders,
  Share2,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { plansApi, incidentsApi } from '../services/api';
import { ObjectiveWeights, PlanComparisonSummary, SensitivityAnalysisResult, IncidentDependency, ThreatPropagationResult } from '../types';

export const ImpactTradeoffView: React.FC = () => {
  const { sectorImpact, responsePlans, setActiveTab, playTacticalSound } = useCrisis();

  // State for Comparison Matrix
  const [comparisonSummary, setComparisonSummary] = useState<PlanComparisonSummary | null>(null);

  // State for Sensitivity Analysis
  const [customWeights, setCustomWeights] = useState<ObjectiveWeights>({
    lifeSafety: 0.50,
    agriculture: 0.20,
    ecosystem: 0.15,
    fleetStress: 0.075,
    travelLogistics: 0.075,
  });
  const [sensitivityResult, setSensitivityResult] = useState<SensitivityAnalysisResult | null>(null);

  // State for Dependencies and Threat Propagation
  const [dependencies, setDependencies] = useState<IncidentDependency[]>([]);
  const [threatPropagation, setThreatPropagation] = useState<ThreatPropagationResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [compData, depData, threatData] = await Promise.all([
          plansApi.getPlanComparison().catch(() => null),
          incidentsApi.getAllDependencies().catch(() => []),
          incidentsApi.getThreatPropagation('I-4').catch(() => null),
        ]);

        if (isMounted) {
          if (compData) setComparisonSummary(compData);
          if (depData && depData.length > 0) setDependencies(depData);
          if (threatData) setThreatPropagation(threatData);
        }
      } catch (err) {
        console.warn('Could not load comparison/dependency data:', err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Recalculate sensitivity when weights change
  useEffect(() => {
    let isMounted = true;
    async function updateSensitivity() {
      try {
        const res = await plansApi.calculateSensitivity(customWeights);
        if (isMounted && res) {
          setSensitivityResult(res);
        }
      } catch {
        // Fallback local calculation
        const sum =
          customWeights.lifeSafety +
          customWeights.agriculture +
          customWeights.ecosystem +
          customWeights.fleetStress +
          customWeights.travelLogistics || 1;

        const evaluated = responsePlans.map((p) => {
          let score = p.confidenceScore;
          if (p.id.includes('opt-1') || p.id.includes('OPT1')) {
            score = 96 * (customWeights.lifeSafety / sum) + 42 * (customWeights.agriculture / sum) + 38 * (customWeights.ecosystem / sum) + 78 * (customWeights.fleetStress / sum) + 84 * (customWeights.travelLogistics / sum);
          } else if (p.id.includes('opt-2') || p.id.includes('OPT2')) {
            score = 79 * (customWeights.lifeSafety / sum) + 94 * (customWeights.agriculture / sum) + 35 * (customWeights.ecosystem / sum) + 85 * (customWeights.fleetStress / sum) + 72 * (customWeights.travelLogistics / sum);
          } else {
            score = 88 * (customWeights.lifeSafety / sum) + 45 * (customWeights.agriculture / sum) + 82 * (customWeights.ecosystem / sum) + 74 * (customWeights.fleetStress / sum) + 79 * (customWeights.travelLogistics / sum);
          }
          return {
            planId: p.id,
            optionKey: p.id,
            title: p.title,
            originalObjectiveScore: p.confidenceScore,
            adjustedUtilityScore: Math.round(score * 10) / 10,
            rankDelta: 0,
            rationale: 'Local sensitivity calculation fallback [CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
          };
        });

        if (isMounted) {
          setSensitivityResult({
            customWeights,
            calculatedAt: new Date().toISOString(),
            rankings: evaluated.sort((a, b) => b.adjustedUtilityScore - a.adjustedUtilityScore),
            summary: 'Read-only sensitivity evaluation under modified objective priorities.',
            provenance: '[CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
          });
        }
      }
    }

    const timer = setTimeout(updateSensitivity, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [customWeights, responsePlans]);

  const handleWeightChange = (key: keyof ObjectiveWeights, val: number) => {
    setCustomWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto select-none">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            Decision Intelligence &amp; Multi-Plan Trade-Off Analysis
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Cross-Sector Evaluation &amp; Sensitivity Modeling
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            5-dimensional scorecard comparing candidate plans, cascading threat propagation DAG, and interactive sensitivity weighting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('plans');
            }}
            className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] font-semibold text-xs border border-[var(--border-color)] flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>View Candidate Plans</span>
          </button>
          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('approval');
            }}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle flex items-center gap-2 cursor-pointer"
          >
            <span>Proceed to Human Approval Gate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sector Impact Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel space-y-2">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-bold uppercase tracking-wider">Human Life-Safety</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {sectorImpact.peopleAtRiskTotal} <span className="text-xs font-normal text-[var(--text-muted)]">At Risk</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% Evacuation Route Feasibility</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Livestock &amp; Agriculture</span>
            <Sprout className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {sectorImpact.livestockAtRiskTotal} <span className="text-xs font-normal text-[var(--text-muted)]">Cattle (Simulated)</span>
          </div>
          <div className="text-[11px] text-amber-300 flex items-center gap-1">
            <span>3.5 hr safe smoke buffer window [SIMULATED]</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">Wildlife Sanctuary</span>
            <Trees className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {sectorImpact.habitatAreaKm2Total} km² <span className="text-xs font-normal text-[var(--text-muted)]">Sanctuary</span>
          </div>
          <div className="text-[11px] text-purple-300 flex items-center gap-1">
            <span>Drone Reconnaissance Overwatch [RECOMMENDATION]</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] glass-panel space-y-2">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Infrastructure</span>
            <Building className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {sectorImpact.infrastructureCount} <span className="text-xs font-normal text-[var(--text-muted)]">Assets</span>
          </div>
          <div className="text-[11px] text-red-400 flex items-center gap-1">
            <span>Bridge Bravo Cut-off (6x6 Bypass Active)</span>
          </div>
        </div>
      </div>

      {/* 5-Dimension Multi-Plan Scorecard Matrix */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
        <div className="border-b border-[var(--border-color)] pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <span>5-Dimensional Strategic Comparison Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                [GOVERNANCE CONSTRAINT &amp; DERIVED INPUTS]
              </span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Multi-criteria analysis across Life Safety, Agriculture, Ecosystem, Fleet Stress, and Travel Logistics.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase">
                <th className="py-2.5 px-3">Dimension</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Option 1 (Life-Safety)</th>
                <th className="py-2.5 px-3">Option 2 (Agriculture)</th>
                <th className="py-2.5 px-3">Option 3 (Balanced)</th>
                <th className="py-2.5 px-3">Provenance Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/60 font-mono">
              {comparisonSummary?.matrix ? (
                comparisonSummary.matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-[var(--text-primary)]">{row.displayName}</td>
                    <td className="py-3 px-3 text-sky-400">{(row.weight * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-emerald-400">{row.scores['PLAN-T1-OPT1'] || 90} / 100</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-sans">{row.metrics['PLAN-T1-OPT1']?.value}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-amber-400">{row.scores['PLAN-T1-OPT2'] || 75} / 100</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-sans">{row.metrics['PLAN-T1-OPT2']?.value}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-purple-400">{row.scores['PLAN-T1-OPT3'] || 82} / 100</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-sans">{row.metrics['PLAN-T1-OPT3']?.value}</div>
                    </td>
                    <td className="py-3 px-3 text-[10px] text-[var(--text-muted)] font-sans">{row.provenance}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="hover:bg-[var(--bg-tertiary)]/50">
                    <td className="py-3 px-3 font-sans font-bold text-[var(--text-primary)]">Human Life-Safety Preservation</td>
                    <td className="py-3 px-3 text-sky-400">50.0%</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">96 / 100 (100% covered)</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">79 / 100 (71% covered)</td>
                    <td className="py-3 px-3 text-purple-400 font-bold">88 / 100 (84% covered)</td>
                    <td className="py-3 px-3 text-[10px] text-[var(--text-muted)]">[GOVERNANCE CONSTRAINT]</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-tertiary)]/50">
                    <td className="py-3 px-3 font-sans font-bold text-[var(--text-primary)]">Agricultural &amp; Livestock Protection</td>
                    <td className="py-3 px-3 text-sky-400">20.0%</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">42 / 100 (3.5h buffer)</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">94 / 100 (100% saved)</td>
                    <td className="py-3 px-3 text-purple-400 font-bold">45 / 100 (queued)</td>
                    <td className="py-3 px-3 text-[10px] text-[var(--text-muted)]">[SIMULATED — DEMO DATA]</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-tertiary)]/50">
                    <td className="py-3 px-3 font-sans font-bold text-[var(--text-primary)]">Ecological &amp; Habitat Containment</td>
                    <td className="py-3 px-3 text-sky-400">15.0%</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">38 / 100 (drone overwatch)</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">35 / 100 (topography)</td>
                    <td className="py-3 px-3 text-purple-400 font-bold">82 / 100 (ground team)</td>
                    <td className="py-3 px-3 text-[10px] text-[var(--text-muted)]">[AGENT-DERIVED]</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-tertiary)]/50">
                    <td className="py-3 px-3 font-sans font-bold text-[var(--text-primary)]">Fleet Mechanical &amp; Crew Strain</td>
                    <td className="py-3 px-3 text-sky-400">7.5%</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">78 / 100</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">85 / 100</td>
                    <td className="py-3 px-3 text-purple-400 font-bold">74 / 100</td>
                    <td className="py-3 px-3 text-[10px] text-[var(--text-muted)]">[CALCULATION — DERIVED]</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-tertiary)]/50">
                    <td className="py-3 px-3 font-sans font-bold text-[var(--text-primary)]">Travel Logistics &amp; ETA Efficiency</td>
                    <td className="py-3 px-3 text-sky-400">7.5%</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">84 / 100 (18.0 min avg)</td>
                    <td className="py-3 px-3 text-amber-400 font-bold">72 / 100 (16.0 min avg)</td>
                    <td className="py-3 px-3 text-purple-400 font-bold">79 / 100 (17.0 min avg)</td>
                    <td className="py-3 px-3 text-[10px] text-[var(--text-muted)]">[CALCULATION — DERIVED]</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Sensitivity Analysis Sliders + Cascading Threat Propagation DAG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Interactive Sensitivity Analysis */}
        <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Interactive Sensitivity Simulator</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Adjust objective weights to test plan ranking sensitivity. (Read-only simulation; does not mutate operational plans).
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PURE SIMULATION
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Slider 1: Life Safety */}
            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-primary)] font-sans text-xs">
                <span>Human Life Safety</span>
                <span className="font-mono text-emerald-400 font-bold">{(customWeights.lifeSafety * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={customWeights.lifeSafety}
                onChange={(e) => handleWeightChange('lifeSafety', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Slider 2: Agriculture */}
            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-primary)] font-sans text-xs">
                <span>Agriculture &amp; Livestock</span>
                <span className="font-mono text-amber-400 font-bold">{(customWeights.agriculture * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={customWeights.agriculture}
                onChange={(e) => handleWeightChange('agriculture', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Slider 3: Ecosystem */}
            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-primary)] font-sans text-xs">
                <span>Ecological Sanctuary</span>
                <span className="font-mono text-purple-400 font-bold">{(customWeights.ecosystem * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={customWeights.ecosystem}
                onChange={(e) => handleWeightChange('ecosystem', parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Slider 4: Fleet Stress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-primary)] font-sans text-xs">
                <span>Fleet Strain &amp; Reliability</span>
                <span className="font-mono text-sky-400 font-bold">{(customWeights.fleetStress * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.4"
                step="0.02"
                value={customWeights.fleetStress}
                onChange={(e) => handleWeightChange('fleetStress', parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Slider 5: Travel Logistics */}
            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-primary)] font-sans text-xs">
                <span>Travel Logistics &amp; Speed</span>
                <span className="font-mono text-blue-400 font-bold">{(customWeights.travelLogistics * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.4"
                step="0.02"
                value={customWeights.travelLogistics}
                onChange={(e) => handleWeightChange('travelLogistics', parseFloat(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Dynamic Sensitivity Rankings */}
          {sensitivityResult && (
            <div className="mt-4 pt-3 border-t border-[var(--border-color)] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
                Simulated Plan Rankings Under Custom Weights
              </span>
              <div className="space-y-1.5">
                {sensitivityResult.rankings.map((rank, idx) => (
                  <div
                    key={rank.planId}
                    className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-400">#{idx + 1}</span>
                      <span className="font-bold text-[var(--text-primary)]">{rank.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">
                        Utility: <strong className="text-emerald-400">{rank.adjustedUtilityScore}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] italic mt-1">
                {sensitivityResult.summary}
              </p>
            </div>
          )}
        </div>

        {/* Cascading Incident Dependency DAG & Threat Propagation */}
        <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Cascading Incident Dependency DAG</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Cycle-safe directed graph tracing secondary threat propagation and resource strain across incidents.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              DAG PROPAGATION
            </span>
          </div>

          <div className="space-y-3">
            {/* Seed / Dynamic Dependencies List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Active Incident Dependency Links
              </span>
              <div className="space-y-2">
                {dependencies.length > 0 ? (
                  dependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-sky-400">{dep.sourceIncidentId} &rarr; {dep.targetIncidentId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {dep.dependencyType}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">{dep.description}</p>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono block">{dep.provenance}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-sky-400">I-4 &rarr; I-1</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          ResourceDrain
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Extraction of 410 cut-off residents at I-4 diverts heavy vehicle capacity, requiring Rescue Team C re-route.
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">[GOVERNANCE CONSTRAINT]</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-sky-400">I-1 &rarr; I-2</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ThreatSpread
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Uncontained smoke plume along eastern ridge threatens dairy livestock if evacuation is delayed beyond 3.5h.
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">[SIMULATED — DEMO DATA]</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-sky-400">I-1 &rarr; I-3</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          AccessBlockage
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Ridge access road smoke blockage restricts overland transport to wildlife sanctuary; requires aerial drone surveillance.
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">[AGENT-DERIVED]</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Threat Propagation Impact Summary */}
            {threatPropagation && threatPropagation.cascadingImpacts && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-purple-300">
                  <ShieldAlert className="w-4 h-4" />
                  <span>I-4 Cascading Threat Propagation Advice</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[var(--text-secondary)]">
                  {threatPropagation.cascadingImpacts.map((impact, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-mono text-sky-400 font-bold shrink-0">{impact.targetIncidentId}:</span>
                      <span>{impact.operationalAdvice} <strong className="text-[var(--text-muted)] font-mono text-[10px]">{impact.provenance}</strong></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
