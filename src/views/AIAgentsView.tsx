import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  Bot,
  Flame,
  Sprout,
  Trees,
  Compass,
  Navigation,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Code,
  Terminal,
  ArrowRight,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { AIAgent } from '../types';
import { AgentEvidenceTrace } from '../components/command/AgentEvidenceTrace';

export const AIAgentsView: React.FC = () => {
  const {
    agents,
    selectedAgentId,
    setSelectedAgentId,
    startReplanning,
    isReplanning,
    activeAgentProcessingId,
    playTacticalSound,
    setActiveTab: setNavTab,
  } = useCrisis();

  const [localTab, setLocalTab] = useState<
    'Current Analysis' | 'Risk Map' | 'Projections' | 'Data Sources' | 'Tool Calls'
  >('Current Analysis');

  const selectedAgent: AIAgent =
    agents.find(a => a.id === selectedAgentId) || agents[0] || ({} as AIAgent);

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'agent-incident':
        return AlertTriangle;
      case 'agent-hazard':
        return Flame;
      case 'agent-agri':
        return Sprout;
      case 'agent-wildlife':
        return Trees;
      case 'agent-alloc':
        return Compass;
      case 'agent-route':
        return Navigation;
      case 'agent-verification':
        return ShieldCheck;
      case 'agent-command':
        return Cpu;
      default:
        return Bot;
    }
  };

  // Radial node positions around center command orchestrator
  const nodePositions = [
    { id: 'agent-incident', x: 120, y: 70, label: 'Incident CAD' },
    { id: 'agent-hazard', x: 260, y: 50, label: 'Hazard & Wind' },
    { id: 'agent-agri', x: 380, y: 100, label: 'Agriculture' },
    { id: 'agent-wildlife', x: 400, y: 220, label: 'Wildlife Eco' },
    { id: 'agent-route', x: 320, y: 320, label: 'Route & Bypass' },
    { id: 'agent-alloc', x: 180, y: 330, label: 'Allocation' },
    { id: 'agent-verification', x: 80, y: 220, label: 'Verification' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Top Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-sky-400" />
            <span>Multi-Agent AI Coordination Network</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            8 specialized domain agents analyzing compound hazards, cross-sector impacts, accessibility, and verifiable resource optimization
          </p>
        </div>

        <button
          onClick={() => {
            playTacticalSound('replan');
            startReplanning();
          }}
          disabled={isReplanning}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-semibold text-xs shadow-subtle flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReplanning ? 'animate-spin' : ''}`} />
          <span>{isReplanning ? 'Orchestrating Agents...' : 'Re-Run Multi-Agent Pipeline'}</span>
        </button>
      </div>

      {/* Main Grid: Interactive Agent Network Graph + Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 cols): Interactive Agent Network Topology Graph */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 shadow-panel glass-panel space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                Agent Network Topology
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                Radial orchestrator architecture
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              8 Active Nodes
            </span>
          </div>

          {/* Interactive Topology Graph SVG */}
          <div className="relative w-full h-[380px] bg-[var(--bg-primary)]/80 rounded-xl border border-[var(--border-color)] overflow-hidden flex items-center justify-center p-2">
            <svg viewBox="0 0 480 380" className="w-full h-full">
              {/* Radial Connection Lines */}
              {nodePositions.map(pos => {
                const isSelected = selectedAgentId === pos.id || selectedAgentId === 'agent-command';
                return (
                  <line
                    key={`line-${pos.id}`}
                    x1="240"
                    y1="190"
                    x2={pos.x}
                    y2={pos.y}
                    stroke={isSelected ? '#0ea5e9' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? '4,2' : 'none'}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Central Command Orchestrator Node */}
              <g
                className="cursor-pointer group"
                onClick={() => {
                  playTacticalSound('click');
                  setSelectedAgentId('agent-command');
                }}
              >
                <circle
                  cx="240"
                  cy="190"
                  r="34"
                  fill="#0d1527"
                  stroke={selectedAgentId === 'agent-command' ? '#8b5cf6' : '#2e4472'}
                  strokeWidth="2.5"
                  className="transition-all duration-200 hover:scale-105"
                />
                <circle
                  cx="240"
                  cy="190"
                  r="24"
                  fill="rgba(139, 92, 246, 0.18)"
                  className="animate-subtle-pulse"
                />
                <text
                  x="240"
                  y="186"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="Inter, sans-serif"
                >
                  COMMAND
                </text>
                <text
                  x="240"
                  y="198"
                  textAnchor="middle"
                  fill="#a78bfa"
                  fontSize="8"
                  fontFamily="Inter, sans-serif"
                >
                  Orchestrator
                </text>
              </g>

              {/* 7 Peripheral Domain Nodes */}
              {nodePositions.map(pos => {
                const agent = agents.find(a => a.id === pos.id);
                const isSelected = selectedAgentId === pos.id;
                const isProcessing = activeAgentProcessingId === pos.id;

                return (
                  <g
                    key={pos.id}
                    className="cursor-pointer"
                    onClick={() => {
                      playTacticalSound('click');
                      setSelectedAgentId(pos.id);
                    }}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="22"
                      fill={isSelected ? '#0f172a' : '#070b12'}
                      stroke={
                        isProcessing
                          ? '#10b981'
                          : isSelected
                          ? '#0ea5e9'
                          : 'rgba(255,255,255,0.2)'
                      }
                      strokeWidth={isSelected || isProcessing ? 2 : 1}
                      className="transition-all duration-200 hover:scale-110"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 3}
                      textAnchor="middle"
                      fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                      fontSize="8"
                      fontWeight="600"
                      fontFamily="Inter, sans-serif"
                    >
                      {agent?.confidence || 90}%
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 32}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#94a3b8'}
                      fontSize="9"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="Inter, sans-serif"
                    >
                      {pos.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Node List */}
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {agents.map(ag => {
              const isSelected = ag.id === selectedAgentId;
              const Icon = getAgentIcon(ag.id);
              return (
                <button
                  key={ag.id}
                  onClick={() => {
                    playTacticalSound('click');
                    setSelectedAgentId(ag.id);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/15 text-[var(--text-primary)] font-semibold border border-sky-400/40'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{ag.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">{ag.confidence}% Conf</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Agent Operational Deep-Dive */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
          {/* Agent Header */}
          <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                {React.createElement(getAgentIcon(selectedAgent.id), { className: 'w-6 h-6' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">{selectedAgent.name}</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedAgent.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{selectedAgent.role}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Confidence Rating
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-400">
                {selectedAgent.confidence}%
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 border-b border-[var(--border-color)] pb-2 overflow-x-auto">
            {(['Current Analysis', 'Risk Map', 'Projections', 'Data Sources', 'Tool Calls'] as const).map(
              tab => (
                <button
                  key={tab}
                  onClick={() => {
                    playTacticalSound('click');
                    setLocalTab(tab);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    localTab === tab
                      ? 'bg-sky-500 text-[var(--text-primary)] shadow-subtle'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {localTab === 'Current Analysis' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 block mb-1">
                    Current Operational Assessment
                  </span>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    {selectedAgent.currentTask || selectedAgent.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      Assigned Scope
                    </span>
                    <span className="text-xs text-[var(--text-primary)] font-medium">{selectedAgent.role}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      Last Execution Time
                    </span>
                    <span className="text-xs font-mono text-sky-400 font-semibold">
                      {selectedAgent.lastRunTimestamp || '10:24:45 AM'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {localTab === 'Risk Map' && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                  Domain Hazard Surface
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Evaluating radiant heat exposure vectors, smoke inhalation boundaries, and road impassability contours.
                </p>
                <div className="p-2.5 rounded-lg bg-[var(--bg-primary)] text-xs font-mono text-emerald-400">
                  Spatial bounds: [38.810, -122.825] to [38.875, -122.740]
                </div>
              </div>
            )}

            {localTab === 'Projections' && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">
                  Time-Horizon Projections (+60m / +180m)
                </span>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                  <li>T0+60m: Smoke PM2.5 boundary enters eastern cattle pasture.</li>
                  <li>T0+120m: Radiant heat threatens Hillside power substation.</li>
                  <li>T0+180m: North river bridge zone remains impassable by heavy road transit.</li>
                </ul>
              </div>
            )}

            {localTab === 'Data Sources' && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 block font-mono">
                  Authoritative Evidence &amp; Input Sources
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[var(--text-primary)] font-semibold">Incident Triage Records</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-600/40">
                        [FROM GATEWAYS]
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">Verified incident locations and population estimates</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[var(--text-primary)] font-semibold">PostgreSQL Spatial Baseline</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-600/40">
                        [DATABASE — T0 SEED]
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">Staged resources and regional spatial zones</span>
                  </div>
                </div>
              </div>
            )}

            {localTab === 'Tool Calls' && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono text-xs text-sky-300 space-y-1.5">
                <div>&gt; solve_allocation_heuristic(incidents=[I-1,I-2,I-3,I-4], fleet=active_units)</div>
                <div className="text-emerald-400">&gt; Method: Deterministic Weighted Allocation Heuristic</div>
                <div className="text-[var(--text-muted)]">&gt; Cost assignment: [RES-FIRE-02 -&gt; I-4 via 6x6 Bypass (22m ETA)]</div>
                <div className="text-purple-400">&gt; Provenance: [CALCULATION — HEURISTIC OPTIMIZATION]</div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click');
                  setNavTab('plan-diff');
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-bold text-xs shadow-subtle flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Proceed to Plan Diff</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Evidence Traceability Section */}
      <AgentEvidenceTrace onSelectAgent={setSelectedAgentId} />
    </div>
  );
};
