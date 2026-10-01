import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  FileText,
  Download,
  ShieldCheck,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Activity,
  RotateCcw,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, playTacticalSound, resetScenario, setActiveTab } = useCrisis();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    return log.eventType === filterType;
  });

  const handleExportJSON = () => {
    playTacticalSound('click');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ecocrisis_audit_log_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'HUMAN_APPROVAL':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'SCENARIO_TRIGGER':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'OPTIMIZATION_SOLVED':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'AI_ANALYSIS_STARTED':
      case 'AI_ANALYSIS_COMPLETED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-700/40 text-[var(--text-secondary)] border-slate-600/30';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            Operational Accountability Timeline
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Incident Event Log &amp; Decision Audit
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Structured in-memory operational timeline recording all scenario triggers, AI solver runs, and commander authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('dashboard');
            }}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-secondary)] font-semibold text-xs border border-[var(--border-color)] shadow-subtle flex items-center gap-2 cursor-pointer"
          >
            <span>Return to Situation Room</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-primary)] font-semibold text-xs border border-[var(--border-color)] shadow-subtle flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export Audit Log (JSON)</span>
          </button>
          <button
            onClick={() => {
              playTacticalSound('alert');
              resetScenario();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[var(--text-secondary)] font-semibold text-xs border border-slate-700 flex items-center gap-2 cursor-pointer"
            title="Reset to Baseline T0 state"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Mission (T0)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-color)] glass-panel">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'SCENARIO_TRIGGER', 'AI_ANALYSIS_COMPLETED', 'OPTIMIZATION_SOLVED', 'HUMAN_APPROVAL'].map(type => (
            <button
              key={type}
              onClick={() => {
                playTacticalSound('click');
                setFilterType(type);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-sky-500 text-[var(--text-primary)] shadow-subtle'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {type === 'ALL' ? 'All Events' : type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search event ID, actor, summary..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
        <div className="space-y-3">
          {filteredLogs.map(log => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-2 text-xs transition-colors"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400">{log.timestamp}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getEventBadge(log.eventType)}`}>
                    {log.eventType}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{log.id}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-mono">
                  <span>Actor: <strong className="text-[var(--text-secondary)]">{log.actor}</strong></span>
                  {log.confidence && (
                    <span className="text-emerald-400 font-bold">• {log.confidence}% Conf</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {log.summary}
              </p>

              {log.details && Object.keys(log.details).length > 0 && (
                <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-[11px] font-mono text-[var(--text-muted)] overflow-x-auto">
                  {JSON.stringify(log.details)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
