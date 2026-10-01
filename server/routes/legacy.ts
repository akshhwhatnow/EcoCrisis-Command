import { Router, Request, Response } from 'express';
import {
  INITIAL_INCIDENTS,
  CRISIS_NEW_INCIDENT_I4,
  INITIAL_RESOURCES,
  INITIAL_AGENTS,
  INITIAL_RESPONSE_PLANS,
  INITIAL_REVIEW_FLAGS,
  INITIAL_AUDIT_LOG,
} from '../../src/data/seedData.js';
import { solveDeterministicAllocation } from '../../src/services/optimizationEngine.js';
import { computeCrossSectorImpact } from '../../src/services/riskImpactEngine.js';

export const legacyRouter = Router();

// Legacy in-memory state store maintained for backward compatibility during Phase 2
const legacyState = {
  phase: 'T0_INITIAL',
  incidents: [...INITIAL_INCIDENTS],
  resources: [...INITIAL_RESOURCES],
  agents: [...INITIAL_AGENTS],
  plans: [...INITIAL_RESPONSE_PLANS],
  reviewFlags: [...INITIAL_REVIEW_FLAGS],
  auditLogs: [...INITIAL_AUDIT_LOG],
};

legacyRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString(), version: '1.0.0-legacy' });
});

legacyRouter.get('/state', (req: Request, res: Response) => {
  const impact = computeCrossSectorImpact(legacyState.incidents);
  res.json({ ...legacyState, impact });
});

legacyRouter.get('/incidents', (req: Request, res: Response) => {
  res.json(legacyState.incidents);
});

legacyRouter.get('/resources', (req: Request, res: Response) => {
  res.json(legacyState.resources);
});

legacyRouter.get('/agents', (req: Request, res: Response) => {
  res.json(legacyState.agents);
});

legacyRouter.get('/plans', (req: Request, res: Response) => {
  res.json(legacyState.plans);
});

legacyRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json(legacyState.auditLogs);
});

legacyRouter.post('/scenario/trigger-crisis', (req: Request, res: Response) => {
  legacyState.phase = 'T0_PLUS_10_CRISIS';

  if (!legacyState.incidents.some((i) => i.id === 'I-4')) {
    legacyState.incidents.unshift(CRISIS_NEW_INCIDENT_I4);
  }

  legacyState.resources = legacyState.resources.map((r) =>
    r.id === 'RES-EVAC-A'
      ? {
          ...r,
          state: 'Unavailable' as const,
          isSimulatedFailure: true,
          failureReason: 'Mechanical Transmission Failure / Overheated Radiator',
        }
      : r
  );

  res.json({ message: 'T0+10m Crisis Triggered', state: legacyState });
});

legacyRouter.post('/replanning', (req: Request, res: Response) => {
  legacyState.phase = 'REVISED_PLAN_READY';
  const previousAssignments: Record<string, string> = {
    'RES-EVAC-A': 'I-1',
    'RES-TRANS-B': 'I-2',
    'RES-RESCUE-C': 'I-3',
    'RES-BOAT-1': 'I-1',
  };

  const solved = solveDeterministicAllocation(legacyState.incidents, legacyState.resources, previousAssignments);
  res.json({ message: 'Dynamic Replanning Solved', solved, state: legacyState });
});

legacyRouter.post('/approval', (req: Request, res: Response) => {
  legacyState.phase = 'PLAN_APPROVED';
  res.json({ message: 'Plan Approved & Dispatched', state: legacyState });
});

legacyRouter.post('/scenario/reset', (req: Request, res: Response) => {
  legacyState.phase = 'T0_INITIAL';
  legacyState.incidents = [...INITIAL_INCIDENTS];
  legacyState.resources = [...INITIAL_RESOURCES];
  legacyState.agents = [...INITIAL_AGENTS];
  legacyState.plans = [...INITIAL_RESPONSE_PLANS];
  legacyState.reviewFlags = [...INITIAL_REVIEW_FLAGS];
  legacyState.auditLogs = [...INITIAL_AUDIT_LOG];
  res.json({ message: 'Scenario Reset to T0', state: legacyState });
});
