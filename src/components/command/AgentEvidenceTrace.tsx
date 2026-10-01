import React, { useState } from 'react';
import { useCrisis } from '../../context/CrisisContext';
import {
  FileText,
  ShieldCheck,
  Flame,
  Sprout,
  Trees,
  Navigation,
  Scale,
  Compass,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface AgentEvidenceTraceProps {
  highlightedDiffIndex?: number;
  onSelectAgent?: (agentId: string) => void;
  className?: string;
}

interface EvidenceTraceItem {
  planDiffTarget: string;
  actionTaken: string;
  agentId: string;
  agentName: string;
  primaryCitation: string;
  provenanceTag: string;
  findingSummary: string;
  consequenceDerived: string;
  hasEvidence: boolean;
}

export const AgentEvidenceTrace: React.FC<AgentEvidenceTraceProps> = ({
  highlightedDiffIndex,
  onSelectAgent,
  className = '',
}) => {
  const { agents, setSelectedAgentId, setActiveTab, playTacticalSound } = useCrisis();

  const traceItems: EvidenceTraceItem[] = [
    {
      planDiffTarget: 'Transport Team B (RES-TRANS-B) &rarr; I-4 Reallocation',
      actionTaken: 'Rerouted from I-2 Valley Dairy to I-4 Cut-Off Settlement',
      agentId: 'agent-route',
      agentName: 'Route & Logistics Domain Agent',
      primaryCitation: 'Database accessibility_status="Bridge Blocked" (FACT) & Haversine terrain calculation',
      provenanceTag: '[FROM GATEWAYS]',
      findingSummary: 'Highway 27 access road cut off [FROM GATEWAYS]; bypass trail requires 6x6 high-clearance transit (Transport Team B).',
      consequenceDerived: 'Trapped settlement extraction enabled via 6x6 bypass (simulated 410 residents [SIMULATED — DEMO DATA]); estimated transit ~22m [ESTIMATE — SIMULATED DEMO DATA].',
      hasEvidence: true,
    },
    {
      planDiffTarget: 'I-2 Valley Dairy Farm & Livestock &rarr; Postponement',
      actionTaken: 'Deferred response with sprinkler suppression and recommended monitoring',
      agentId: 'agent-hazard',
      agentName: 'Hazard: Fire & Weather Domain Agent',
      primaryCitation: 'Atmospheric Dispersion Model (Synthetic)',
      provenanceTag: '[SIMULATED — DEMO DATA]',
      findingSummary: 'Model estimates a 3.5-hour simulated smoke buffer before atmospheric concentration breaches threshold [SIMULATED — DEMO DATA].',
      consequenceDerived: 'Livestock evacuation (simulated 840 cattle [SIMULATED — DEMO DATA]) deferred during immediate life-safety triage [GOVERNANCE CONSTRAINT].',
      hasEvidence: true,
    },
    {
      planDiffTarget: 'Rescue Team C (RES-RESCUE-C) &rarr; I-1 Reallocation',
      actionTaken: 'Rerouted from I-3 Wildlife Sanctuary to I-1 Hillside Village',
      agentId: 'agent-incident',
      agentName: 'Incident Assessment Domain Agent',
      primaryCitation: 'Resource status update: RES-VEH-A status="Unavailable" [FROM GATEWAYS]',
      provenanceTag: '[FROM GATEWAYS]',
      findingSummary: 'Evacuation Vehicle A rendered unavailable [FROM GATEWAYS] (mechanical breakdown [SIMULATED — DEMO DATA]), leaving staging capacity gap at Hillside Village [FROM GATEWAYS].',
      consequenceDerived: 'Rescue Team C reallocated to maintain Hillside Village evacuation support alongside Rescue Boat 1 [FROM GATEWAYS].',
      hasEvidence: true,
    },
    {
      planDiffTarget: 'Rescue Boat 1 (RES-BOAT-1) &rarr; I-1 Corridor Preserved',
      actionTaken: 'Continuous amphibious ferry operations maintained',
      agentId: 'agent-alloc',
      agentName: 'Resource Allocation Domain Agent',
      primaryCitation: 'Database river_route_available=true (FACT) & allocation heuristic',
      provenanceTag: '[DATABASE — T0 SEED]',
      findingSummary: 'Water corridor availability confirmed in T0 database; jet-drive rescue craft unaffected by road blockage.',
      consequenceDerived: 'River evacuation operates independently of road corridor disruption [DATABASE — T0 SEED].',
      hasEvidence: true,
    },
    {
      planDiffTarget: 'I-3 Pine Ridge Wildlife Sanctuary &rarr; Drone Observation',
      actionTaken: 'Ground team substituted with recommended drone monitoring',
      agentId: 'agent-wildlife',
      agentName: 'Wildlife & Ecosystem Domain Agent',
      primaryCitation: 'Ecological Containment Guidelines',
      provenanceTag: '[RECOMMENDATION]',
      findingSummary: 'Animals moving southwest naturally away from fire flank; ground team substitution recommended during peak life-safety demand.',
      consequenceDerived: 'Recommended aerial thermal drone monitoring [RECOMMENDATION]; physical ground containment deferred pending mutual aid.',
      hasEvidence: true,
    },
    {
      planDiffTarget: 'Confidence Score Verification (89%)',
      actionTaken: 'Cross-agent evidence audit and mathematical calculation',
      agentId: 'agent-verification',
      agentName: 'Verification / Confidence Domain Agent',
      primaryCitation: 'verificationConfidenceAgent cross-verification audit',
      provenanceTag: '[CALCULATION — DERIVED FROM EXPLICIT INPUTS]',
      findingSummary: 'Calculated mathematical composite confidence (89%) from 6 verified upstream agent outputs minus simulation uncertainty penalty (-3%).',
      consequenceDerived: 'Confidence score recorded in plan record; mandatory human authorization required prior to dispatch [GOVERNANCE CONSTRAINT].',
      hasEvidence: true,
    },
  ];

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
      } else if (tag.includes('SIMULATED') || tag.includes('ESTIMATE')) {
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

  const handleAgentClick = (agentId: string) => {
    playTacticalSound('click');
    setSelectedAgentId(agentId);
    if (onSelectAgent) {
      onSelectAgent(agentId);
    } else {
      setActiveTab('agents');
    }
  };

  return (
    <div
      className={`rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
              Agent Evidence &rarr; Plan Diff Traceability
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              Explicit citations linking domain agent reasoning to operational plan adjustments
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
          6 Backend Evidence Links
        </span>
      </div>

      {/* Traceability Items List */}
      <div className="space-y-3">
        {traceItems.map((item, idx) => {
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-slate-600 transition-all text-xs space-y-2.5"
            >
              {/* Target & Agent Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)]/60 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                    Plan Diff Change
                  </span>
                  <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                    <span dangerouslySetInnerHTML={{ __html: item.planDiffTarget }} />
                  </div>
                </div>

                <button
                  onClick={() => handleAgentClick(item.agentId)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{item.agentName}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Evidence Citation & Finding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    Agent Finding &amp; Citation:
                  </span>
                  {item.hasEvidence ? (
                    <p className="text-[var(--text-primary)] leading-relaxed">
                      {item.findingSummary}{' '}
                      <span className="text-[9px] font-mono text-[var(--text-muted)]">({item.primaryCitation})</span>
                    </p>
                  ) : (
                    <p className="text-amber-400 italic">Evidence not available.</p>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Derived Operational Consequence:
                  </span>
                  <p className="text-[var(--text-primary)] leading-relaxed font-medium">
                    {formatProvenanceBadges(item.consequenceDerived)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
