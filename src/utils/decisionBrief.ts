/**
 * EcoCrisis Command - Decision Brief Export Utility
 * Generates an auditable, provenance-tagged JSON decision brief for commanders and oversight bodies.
 */

export interface DecisionBriefPayload {
  exportMetadata: {
    system: string;
    version: string;
    exportedAt: string;
    exportedByRole: string;
    operationalStatus: string;
    provenanceStandard: string;
  };
  scenario: {
    phase: string;
    activePlanId: string;
    planTitle: string;
    confidenceScore: number;
    compositeConfidenceScore: string;
  };
  resourceAllocations: Array<{
    resourceId: string;
    resourceName: string;
    assignment: string;
    routeOrSector: string;
    action: string;
    provenance: string;
  }>;
  delayedIncidents: Array<{
    incidentId: string;
    reason: string;
    mitigationStrategy: string;
    provenance: string;
  }>;
  tradeoffsAndRisks: Array<{
    sector: string;
    consequence: string;
    mitigation: string;
    riskLevel: string;
    provenance: string;
  }>;
  governanceConstraints: string[];
}

export function generateDecisionBrief(
  activePlan: any,
  currentUserRole: string,
  phase: string,
  planDiffs: any[] = []
): DecisionBriefPayload {
  const brief: DecisionBriefPayload = {
    exportMetadata: {
      system: 'EcoCrisis Command — Global Multi-Agent AI Response System',
      version: '1.0.0 (Phase 7 Hardened)',
      exportedAt: new Date().toISOString(),
      exportedByRole: currentUserRole,
      operationalStatus: phase === 'PLAN_APPROVED' ? 'APPROVED_BY_COMMANDER' : 'AWAITING_HUMAN_AUTHORIZATION',
      provenanceStandard: 'Gateways 2026 Authoritative Provenance Taxonomy',
    },
    scenario: {
      phase,
      activePlanId: activePlan?.id || 'PLAN-T1-OPT1',
      planTitle: activePlan?.title || 'Candidate Option 1 — Life-Safety Priority Profile',
      confidenceScore: activePlan?.confidenceScore || 89,
      compositeConfidenceScore: `${activePlan?.confidenceScore || 89}% [CALCULATION]`,
    },
    resourceAllocations: (activePlan?.assignments || []).map((a: any) => ({
      resourceId: a.resourceId,
      resourceName: a.resourceName,
      assignment: a.incidentName || a.incidentId,
      routeOrSector: a.routeDetails || 'Sector Dispatch',
      action: a.action || 'Assign',
      provenance: a.notes?.includes('[') ? a.notes : '[FROM GATEWAYS]',
    })),
    delayedIncidents: (activePlan?.delayedIncidentIds || ['I-2', 'I-3']).map((id: string) => ({
      incidentId: id,
      reason: activePlan?.delayedReasons?.[id] || 'Delayed due to scarce-resource life-safety priority triage',
      mitigationStrategy:
        id === 'I-2'
          ? '3.5 hr safe smoke buffer + perimeter sprinkler monitoring [SIMULATED — DEMO DATA]'
          : 'Continuous aerial thermal drone monitoring [RECOMMENDATION]',
      provenance: id === 'I-2' ? '[SIMULATED — DEMO DATA]' : '[RECOMMENDATION]',
    })),
    tradeoffsAndRisks: [
      {
        sector: 'Life Safety (I-4 & I-1)',
        consequence: 'Simulated 410 cut-off residents reached via 6x6 North River Bypass [SIMULATED — DEMO DATA]; Hillside Village evacuation supported [FROM GATEWAYS]',
        mitigation: 'Rescue Team C and Transport Team B dedicated to human life extraction [FROM GATEWAYS]',
        riskLevel: 'Low (Prioritized)',
        provenance: '[FROM GATEWAYS]',
      },
      {
        sector: 'Agriculture (I-2 Farm)',
        consequence: 'Livestock evacuation postponed during peak threat window [FROM GATEWAYS]',
        mitigation: 'Automated perimeter sprinkler systems + simulated 3.5h safe smoke buffer window [SIMULATED — DEMO DATA]',
        riskLevel: 'Medium',
        provenance: '[SIMULATED — DEMO DATA]',
      },
      {
        sector: 'Ecology (I-3 Sanctuary)',
        consequence: 'Direct wildlife ground extraction suspended [FROM GATEWAYS]',
        mitigation: 'Continuous aerial thermal corridor monitoring [RECOMMENDATION]',
        riskLevel: 'Medium',
        provenance: '[RECOMMENDATION]',
      },
    ],
    governanceConstraints: [
      'Autonomous CAD / E-911 dispatch is strictly prohibited [GOVERNANCE CONSTRAINT].',
      'Human operator authorization required prior to any operational dispatch [GOVERNANCE CONSTRAINT].',
      'Confidence score reflects algorithmic and database consistency, not real-world guarantee [GOVERNANCE CONSTRAINT].',
    ],
  };

  return brief;
}

export function downloadDecisionBriefJson(
  activePlan: any,
  currentUserRole: string,
  phase: string,
  planDiffs: any[] = []
): void {
  const brief = generateDecisionBrief(activePlan, currentUserRole, phase, planDiffs);
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(brief, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `ecocrisis-decision-brief-${activePlan?.id || 'PLAN'}-${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
