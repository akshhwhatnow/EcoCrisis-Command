import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  RotateCcw,
  Check,
  MessageSquare,
  Percent,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResourceContentionCard } from '../components/command/ResourceContentionCard';
import { downloadDecisionBriefJson } from '../utils/decisionBrief';

export const HumanApprovalView: React.FC = () => {
  const {
    activePlan,
    planDiffs,
    reviewFlags,
    acknowledgeReviewFlag,
    approvePlan,
    rejectPlan,
    requestChanges,
    requestReanalysis,
    addOperatorNote,
    currentUserRole,
    phase,
    setActiveTab,
    playTacticalSound,
  } = useCrisis();

  const [operatorComments, setOperatorComments] = useState<string>('');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const [changeRequestModalOpen, setChangeRequestModalOpen] = useState<boolean>(false);
  const [changeNotes, setChangeNotes] = useState<string>('');

  const [noteModalOpen, setNoteModalOpen] = useState<boolean>(false);
  const [singleNote, setSingleNote] = useState<string>('');

  const isApproved = phase === 'PLAN_APPROVED';

  const handleApprove = async () => {
    setIsApproving(true);
    playTacticalSound('success');

    try {
      // Confetti removed as per user request
    } catch (e) {
      // ignore
    }

    await approvePlan(operatorComments);
    setIsApproving(false);
  };

  const handleRejectConfirm = () => {
    playTacticalSound('alert');
    rejectPlan(rejectionReason || 'Rejected by commander review');
    setRejectionModalOpen(false);
  };

  const handleChangeRequestConfirm = () => {
    playTacticalSound('click');
    requestChanges(changeNotes || 'Operator requested resource adjustment');
    setChangeRequestModalOpen(false);
    setChangeNotes('');
  };

  const handleAddNoteConfirm = async () => {
    if (!singleNote.trim()) return;
    playTacticalSound('click');
    await addOperatorNote(singleNote);
    setNoteModalOpen(false);
    setSingleNote('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] mx-auto select-none">
      {/* Top Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Human-in-the-Loop Command Gateway
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isApproved ? 'Operational Response Plan Authorized' : 'Human Commander Decision & Gating Required'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {isApproved
              ? 'Plan status recorded as APPROVED. Governance ledger updated [GOVERNANCE CONSTRAINT — NO REAL-WORLD DISPATCH IN PHASE 5B].'
              : 'Autonomous AI dispatch is strictly prohibited. Verify trade-offs, confidence breakdown, and authorize response plan.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playTacticalSound('click');
              downloadDecisionBriefJson(activePlan, currentUserRole, phase, planDiffs);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold cursor-pointer transition-colors shadow-subtle"
            title="Download full JSON decision audit brief with provenance metadata"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Brief (JSON)</span>
          </button>
          <div className="text-right">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">Authorized Approver</span>
            <span className="text-xs font-bold text-sky-400 font-mono">{currentUserRole}</span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
              isApproved
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            {isApproved ? 'AUTHORIZED' : 'PENDING DECISION'}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix (Baseline Plan vs Proposed Revised Plan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Baseline Plan Box */}
        <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 shadow-subtle glass-panel space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div>
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase block">
                PRIOR BASELINE (T0)
              </span>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">PLAN-T0-BASE</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-[var(--text-secondary)] border border-slate-700">
              Confidence: 95%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1">
              <div className="font-semibold text-[var(--text-primary)]">Baseline Resource Assignments:</div>
              <ul className="text-[11px] text-[var(--text-secondary)] space-y-1 font-mono list-disc list-inside">
                <li>RES-EVAC-A &rarr; I-1 Hillside Village (80 pax capacity)</li>
                <li>RES-TRANS-B &rarr; I-2 Valley Dairy Farm (Livestock evac)</li>
                <li>RES-RESCUE-C &rarr; I-3 Wildlife Sanctuary (Habitat rescue)</li>
                <li>RES-BOAT-1 &rarr; I-1 River Shoreline (Water patrol)</li>
              </ul>
            </div>

            <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-[11px] text-red-300">
              <strong>Failure Invalidation:</strong> Vehicle A broke down [SIMULATED — DEMO DATA]; access road cut off to I-4 (simulated 410 residents [SIMULATED — DEMO DATA]). Baseline can no longer achieve life-safety objectives.
            </div>
          </div>
        </div>

        {/* Proposed Revised Plan Box */}
        <div className="rounded-2xl bg-[var(--bg-secondary)] border border-sky-500/40 p-4 shadow-subtle glass-panel space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase block">
                  PROPOSED REVISED PLAN (T1)
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-sm font-bold text-sky-300">
                {activePlan?.id || 'PLAN-T1-REVISED'}: Life-Safety Priority
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Confidence: {activePlan?.confidenceScore || 89}%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-sky-500/20 space-y-1">
              <div className="font-semibold text-[var(--text-primary)]">Reallocated Assignments:</div>
              <ul className="text-[11px] text-sky-200 space-y-1 font-mono list-disc list-inside">
                <li>
                  RES-TRANS-B &rarr; <strong>I-4 Cut-Off Settlement</strong> via 6x6 Bypass (estimated ~22m ETA [ESTIMATE — SIMULATED DEMO DATA]) [FROM GATEWAYS]
                </li>
                <li>
                  RES-RESCUE-C &rarr; <strong>I-1 Hillside Village</strong> (Replaces disabled Vehicle A) [FROM GATEWAYS]
                </li>
                <li>
                  RES-BOAT-1 &rarr; <strong>I-1 Water Corridor</strong> (Preserved continuous ferry) [DATABASE — T0 SEED]
                </li>
                <li>
                  I-2 &amp; I-3 &rarr; <strong>Delayed</strong> with sprinkler suppression &amp; recommended monitoring [SIMULATED — DEMO DATA]
                </li>
              </ul>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300">
              <strong>Deterministic Decision:</strong> Deterministic weighted allocation heuristic reallocates scarce all-terrain transport to immediate human life preservation [GOVERNANCE CONSTRAINT].
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Resource Contention Visualizer */}
      <ResourceContentionCard />

      {/* Main Grid: Left Column Decision Controls & Confidence, Right Column Verification Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 cols): Decision & Confidence Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Confidence Score Breakdown Card (Authoritative Backend Model) */}
          <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 shadow-panel glass-panel space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-400" />
                Backend Confidence Audit Model
              </span>
              <span className="font-mono text-xs font-extrabold text-emerald-400">
                {activePlan?.confidenceScore || 89}%
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Base Upstream Agent Score Average</span>
                <span className="font-mono text-[var(--text-primary)]">92.0% [CALCULATION]</span>
              </div>
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                <span>• Upstream Domain Pipeline Status</span>
                <span className="font-mono text-emerald-400">6 / 6 verified</span>
              </div>
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                <span>• Missing Upstream Agent Penalty</span>
                <span className="font-mono text-[var(--text-muted)]">0.0%</span>
              </div>
              <div className="flex justify-between text-[11px] text-amber-300">
                <span>• Simulated Environmental Data Penalty</span>
                <span className="font-mono text-amber-400">-3.0% [SIMULATED]</span>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] flex justify-between font-bold text-xs">
                <span className="text-[var(--text-primary)]">Composite Confidence Score</span>
                <span className="font-mono text-emerald-400">89.0% [CALCULATION]</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)] leading-tight">
              Confidence represents database and heuristic calculation consistency, NOT a physical outcome guarantee [GOVERNANCE CONSTRAINT].
            </div>
          </div>

          {/* Commander Decision & Action Controls */}
          <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Operator Decision Gateway
              </span>
              <span className="text-[10px] font-mono text-sky-400 font-bold">{currentUserRole}</span>
            </div>

            {/* Operator Notes Field */}
            {!isApproved && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                  Commander Authorization Justification
                </label>
                <textarea
                  value={operatorComments}
                  onChange={e => setOperatorComments(e.target.value)}
                  placeholder="Enter operational justification notes for the permanent audit ledger (optional)..."
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 h-20 resize-none"
                />
              </div>
            )}

            {/* Structured Action Buttons */}
            {!isApproved ? (
              <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs shadow-panel flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isApproving ? 'RECORDING AUTHORIZATION...' : 'AUTHORIZE OPERATIONAL RESPONSE PLAN'}</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      playTacticalSound('click');
                      requestReanalysis();
                    }}
                    className="py-2 px-1 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-[var(--text-secondary)] font-medium text-[11px] border border-[var(--border-color)] cursor-pointer text-center"
                  >
                    Re-Analyze
                  </button>
                  <button
                    onClick={() => setChangeRequestModalOpen(true)}
                    className="py-2 px-1 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-amber-300 font-medium text-[11px] border border-amber-500/30 cursor-pointer text-center"
                  >
                    Request Change
                  </button>
                  <button
                    onClick={() => setNoteModalOpen(true)}
                    className="py-2 px-1 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-sky-300 font-medium text-[11px] border border-sky-500/30 cursor-pointer text-center"
                  >
                    Add Note
                  </button>
                </div>

                <button
                  onClick={() => setRejectionModalOpen(true)}
                  className="w-full py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 font-medium text-xs border border-red-500/30 cursor-pointer transition-colors text-center"
                >
                  Reject Response Plan
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-bold text-sm text-[var(--text-primary)]">Plan Authorized by Commander</span>
                </div>
                <p className="text-[11px] text-emerald-300 font-mono">
                  Signed by <strong className="text-[var(--text-primary)]">{currentUserRole}</strong> • Recorded in Audit Ledger [NO REAL-WORLD DISPATCH IN SIMULATION MODE].
                </p>
                <div className="pt-2 border-t border-emerald-500/30 grid grid-cols-1 gap-2 font-sans">
                  <button
                    onClick={() => {
                      playTacticalSound('click');
                      setActiveTab('audit');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-subtle"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Decision Audit Trail</span>
                  </button>
                  <button
                    onClick={() => {
                      playTacticalSound('click');
                      downloadDecisionBriefJson(activePlan, currentUserRole, phase, planDiffs);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Official Decision Brief (JSON)</span>
                  </button>
                  <button
                    onClick={() => {
                      playTacticalSound('click');
                      setActiveTab('dashboard');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Return to Situation Room</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Verification Flags & Inspection Checklist */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 shadow-panel glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                Verification Agent Pre-Approval Checklist
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                Triangulated multi-source risk validation
              </span>
            </div>
            <span className="text-xs font-mono text-sky-400 font-bold">
              {reviewFlags.filter(f => f.acknowledged).length}/{reviewFlags.length} Acknowledged
            </span>
          </div>

          <div className="space-y-2.5">
            {reviewFlags.map(flag => (
              <div
                key={flag.id}
                className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                  flag.acknowledged
                    ? 'bg-[var(--bg-tertiary)]/40 border-[var(--border-color)] opacity-75'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-highlight)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        flag.severity === 'Critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : flag.severity === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {flag.severity}
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">{flag.title}</span>
                  </div>

                  {!flag.acknowledged ? (
                    <button
                      onClick={() => {
                        playTacticalSound('click');
                        acknowledgeReviewFlag(flag.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-semibold text-[10px] cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <Check className="w-3.5 h-3.5" /> Acknowledged
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {flag.reason}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] border-t border-[var(--border-color)]/60 pt-1.5">
                  <span>Affected: {flag.affectedIncidents.join(', ')}</span>
                  <span className="text-emerald-400 font-semibold">{activePlan?.confidenceScore || 89}% Confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] border border-red-500/40 p-5 shadow-panel space-y-4">
            <div className="flex items-center gap-2.5 text-red-400">
              <XCircle className="w-5 h-5" />
              <h3 className="text-sm font-bold">Reject Operational Plan</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Specify the command reason for rejecting this multi-agent allocation:
            </p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g., Highway bridge access confirmed cleared by state DOT..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] h-24 focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-[var(--text-primary)] font-bold text-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Change Modal */}
      {changeRequestModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] border border-amber-500/40 p-5 shadow-panel space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-sm font-bold">Request Plan Modifications</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Specify desired constraint or parameter changes for the AI optimization pipeline:
            </p>
            <textarea
              value={changeNotes}
              onChange={e => setChangeNotes(e.target.value)}
              placeholder="e.g., Prioritize livestock evacuation over habitat containment..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] h-24 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setChangeRequestModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRequestConfirm}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-[var(--text-primary)] font-bold text-xs cursor-pointer"
              >
                Submit Change Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Operator Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] border border-sky-500/40 p-5 shadow-panel space-y-4">
            <div className="flex items-center gap-2.5 text-sky-400">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-sm font-bold">Add Operational Audit Note</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Record an operator note into the permanent audit ledger:
            </p>
            <textarea
              value={singleNote}
              onChange={e => setSingleNote(e.target.value)}
              placeholder="e.g., Mutual aid strike team requested from District 4..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] h-24 focus:outline-none focus:border-sky-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setNoteModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNoteConfirm}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-bold text-xs cursor-pointer"
              >
                Save Note to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
