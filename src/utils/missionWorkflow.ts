import { ScenarioPhase, ActiveTab } from '../types';

export type MissionStage = 'ASSESS' | 'DISRUPTION' | 'REASON' | 'COMPARE' | 'DECIDE' | 'AUDIT';

export interface MissionStageInfo {
  stage: MissionStage;
  stepNumber: number;
  label: string;
  shortDesc: string;
  recommendedTab: ActiveTab;
  phaseNarrative: string;
  forwardActionLabel?: string;
  forwardActionType?: 'simulate_crisis' | 'start_replan' | 'inspect_diff' | 'review_gate' | 'view_audit' | 'reset_scenario';
}

export const MISSION_STAGES: Array<{
  stage: MissionStage;
  stepNumber: number;
  label: string;
  shortDesc: string;
  recommendedTab: ActiveTab;
}> = [
  { stage: 'ASSESS', stepNumber: 1, label: 'ASSESS', shortDesc: 'T0 Baseline', recommendedTab: 'dashboard' },
  { stage: 'DISRUPTION', stepNumber: 2, label: 'DISRUPTION', shortDesc: 'T0+10m Crisis', recommendedTab: 'dashboard' },
  { stage: 'REASON', stepNumber: 3, label: 'REASON', shortDesc: '8 Domain Agents', recommendedTab: 'agents' },
  { stage: 'COMPARE', stepNumber: 4, label: 'COMPARE', shortDesc: 'Plan Diff & Matrix', recommendedTab: 'plan-diff' },
  { stage: 'DECIDE', stepNumber: 5, label: 'DECIDE', shortDesc: 'Human Gate', recommendedTab: 'approval' },
  { stage: 'AUDIT', stepNumber: 6, label: 'AUDIT', shortDesc: 'Governance Ledger', recommendedTab: 'audit' },
];

/**
 * Pure derived mapping from authoritative ScenarioPhase to UI Mission Stage.
 * Does NOT duplicate operational state.
 */
export function getDerivedMissionStage(phase: ScenarioPhase, activeTab?: ActiveTab): MissionStageInfo {
  switch (phase) {
    case 'T0_INITIAL':
      return {
        stage: 'ASSESS',
        stepNumber: 1,
        label: 'ASSESS',
        shortDesc: 'T0 Baseline',
        recommendedTab: 'dashboard',
        phaseNarrative: 'T0 Baseline: 3 Incidents seeded [DATABASE — T0 SEED]',
        forwardActionLabel: 'Simulate T0+10m Crisis',
        forwardActionType: 'simulate_crisis',
      };

    case 'T0_PLUS_10_CRISIS':
      return {
        stage: 'DISRUPTION',
        stepNumber: 2,
        label: 'DISRUPTION',
        shortDesc: 'T0+10m Crisis',
        recommendedTab: 'dashboard',
        phaseNarrative: 'T0+10m: Cutoff (I-4) & Vehicle A Breakdown [SIMULATED — DEMO DATA]',
        forwardActionLabel: 'Run Multi-Agent Replan',
        forwardActionType: 'start_replan',
      };

    case 'REPLANNING_IN_PROGRESS':
      return {
        stage: 'REASON',
        stepNumber: 3,
        label: 'REASON',
        shortDesc: '8 Domain Agents',
        recommendedTab: 'agents',
        phaseNarrative: 'Evaluating 8 Domain Agents via Deterministic Weighted Allocation Heuristic [CALCULATION]',
        forwardActionLabel: 'Evaluating Pipeline...',
      };

    case 'REVISED_PLAN_READY':
      // In REVISED_PLAN_READY, if user is already reviewing approval, stage is DECIDE; otherwise COMPARE
      if (activeTab === 'approval') {
        return {
          stage: 'DECIDE',
          stepNumber: 5,
          label: 'DECIDE',
          shortDesc: 'Human Gate',
          recommendedTab: 'approval',
          phaseNarrative: 'Candidate Option 1 Ready • Mandatory Human Commander Authorization Required [GOVERNANCE CONSTRAINT]',
          forwardActionLabel: 'Authorize Plan',
          forwardActionType: 'review_gate',
        };
      }
      return {
        stage: 'COMPARE',
        stepNumber: 4,
        label: 'COMPARE',
        shortDesc: 'Plan Diff & Matrix',
        recommendedTab: 'plan-diff',
        phaseNarrative: 'Candidate Option 1 Ready (Deterministic Heuristic) • Review Trade-Offs [CALCULATION]',
        forwardActionLabel: 'Review & Authorize',
        forwardActionType: 'inspect_diff',
      };

    case 'PLAN_APPROVED':
      return {
        stage: 'AUDIT',
        stepNumber: 6,
        label: 'AUDIT',
        shortDesc: 'Governance Ledger',
        recommendedTab: 'audit',
        phaseNarrative: 'Plan Authorized & Logged to Audit Ledger [GOVERNANCE — NO AUTONOMOUS DISPATCH]',
        forwardActionLabel: 'Reset Mission (T0)',
        forwardActionType: 'reset_scenario',
      };

    case 'DISPATCH_IN_PROGRESS':
    default:
      return {
        stage: 'ASSESS',
        stepNumber: 1,
        label: 'ASSESS',
        shortDesc: 'Operational Baseline',
        recommendedTab: 'dashboard',
        phaseNarrative: 'Operational State Active [DATABASE]',
      };
  }
}
