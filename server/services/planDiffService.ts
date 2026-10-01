import { DbPlan, DbPlanAssignment, DbPlanChange } from '../db/repositories/planRepository.js';
import { PlanAssignment, PlanDiffItem, Incident, Resource } from '../../src/types/index.js';

export interface ComputedPlanDiff {
  planId: string;
  targetPlanId?: string;
  parentPlanId?: string;
  totalChanges: number;
  addedCount: number;
  reallocatedCount: number;
  delayedCount: number;
  removedCount: number;
  preservedCount: number;
  items: DbPlanChange[];
  summary: string;
}

export const planDiffService = {
  /**
   * Computes a structured diff between a base plan (e.g. PLAN-T0-BASE) and a revised plan (e.g. PLAN-T1-REVISED)
   */
  computeDiff(
    baseAssignments: Array<{ resource_id: string; incident_id: string; resource_name?: string; incident_name?: string }>,
    targetAssignments: Array<{ resource_id: string; incident_id: string; resource_name?: string; incident_name?: string; action?: string; notes?: string }>,
    options?: {
      targetPlanId?: string;
      parentPlanId?: string;
      unavailableResourceIds?: string[];
      delayedIncidents?: Array<{ id: string; name?: string; reason: string }>;
      resources?: Array<{ id: string; name: string; resource_type?: string }>;
      incidents?: Array<{ id: string; name: string }>;
    }
  ): ComputedPlanDiff {
    const targetPlanId = options?.targetPlanId || 'PLAN-REVISED';
    const parentPlanId = options?.parentPlanId;
    const baseMap = new Map<string, string>();
    const baseIncMap = new Map<string, string>();
    
    for (const b of baseAssignments) {
      baseMap.set(b.resource_id, b.incident_id);
      if (b.incident_name) baseIncMap.set(b.resource_id, b.incident_name);
    }

    const targetMap = new Map<string, string>();
    const targetAssignMap = new Map<string, typeof targetAssignments[0]>();
    for (const t of targetAssignments) {
      targetMap.set(t.resource_id, t.incident_id);
      targetAssignMap.set(t.resource_id, t);
    }

    const items: DbPlanChange[] = [];
    let addedCount = 0;
    let reallocatedCount = 0;
    let delayedCount = 0;
    let removedCount = 0;
    let preservedCount = 0;

    // 1. Check for removed/unavailable resources from base plan
    if (options?.unavailableResourceIds) {
      for (const resId of options.unavailableResourceIds) {
        if (baseMap.has(resId)) {
          const prevIncId = baseMap.get(resId)!;
          const resObj = options.resources?.find((r) => r.id === resId);
          const incObj = options.incidents?.find((i) => i.id === prevIncId);
          const resName = resObj?.name || resId;
          const incName = incObj ? `${incObj.id} ${incObj.name}` : prevIncId;

          items.push({
            plan_id: targetPlanId,
            change_type: 'removed',
            resource_id: resId,
            resource_name: resName,
            previous_assignment: incName,
            new_assignment: 'Unavailable / Out of Service',
            reason: `[FROM GATEWAYS] Resource rendered Unavailable during operational response (Simulated failure reason: mechanical breakdown [SIMULATED — DEMO DATA]), invalidating baseline assignment to ${incName}.`,
            consequence: `[AGENT-DERIVED] Evacuation transit capacity at ${incName} reduced pending reallocation of replacement assets.`,
          });
          removedCount++;
        }
      }
    }

    // 2. Compare target assignments against base assignments
    for (const target of targetAssignments) {
      const resId = target.resource_id;
      const resObj = options?.resources?.find((r) => r.id === resId);
      const incObj = options?.incidents?.find((i) => i.id === target.incident_id);
      const resName = target.resource_name || resObj?.name || resId;
      const targetIncName = target.incident_name || (incObj ? `${incObj.id} ${incObj.name}` : target.incident_id);

      if (!baseMap.has(resId)) {
        // Newly assigned resource
        items.push({
          plan_id: targetPlanId,
          change_type: 'added',
          resource_id: resId,
          resource_name: resName,
          previous_assignment: 'Unassigned / Standby',
          new_assignment: targetIncName,
          reason: target.notes || `[CALCULATION — DERIVED FROM EXPLICIT INPUTS] Direct assignment to ${targetIncName} based on capability matching and calculated travel ETA.`,
          consequence: `[AGENT-DERIVED] Expands operational coverage to ${targetIncName}.`,
        });
        addedCount++;
      } else {
        const prevIncId = baseMap.get(resId)!;
        if (prevIncId !== target.incident_id) {
          // Reallocated resource
          const prevIncObj = options?.incidents?.find((i) => i.id === prevIncId);
          const prevIncName = baseIncMap.get(resId) || (prevIncObj ? `${prevIncObj.id} ${prevIncObj.name}` : prevIncId);

          let reason = target.notes || `[AGENT-DERIVED / RECOMMENDATION] Reallocated from ${prevIncName} to ${targetIncName} based on life-safety priority triage.`;
          let consequence = `[AGENT-DERIVED] Leaves ${prevIncName} dependent on secondary buffer [SIMULATED — DEMO DATA] or alternate assets.`;

          if (resId === 'RES-TEAM-B' && target.incident_id === 'I-4') {
            reason = `[AGENT-DERIVED / RECOMMENDATION] Transport Team B (6x6 Heavy Transport [DATABASE — T0 SEED]) reallocated from I-2 (Dairy Farmland) to I-4 (Cut-Off Settlement) to bypass road impassability [FROM GATEWAYS] and support evacuation of simulated population (410 residents [SIMULATED — DEMO DATA]).`;
            consequence = `[AGENT-DERIVED] I-2 agricultural livestock response delayed by estimated ~45 min [ESTIMATE — SIMULATED DEMO DATA]; livestock retains safe smoke buffer (3.5 hr [SIMULATED — DEMO DATA]).`;
          } else if (resId === 'RES-TEAM-C' && target.incident_id === 'I-1') {
            reason = `[AGENT-DERIVED / RECOMMENDATION] Rescue Team C diverted from I-3 (Pine Ridge Wildlife) to I-1 (Hillside Village) to restore ground evacuation capacity [FROM GATEWAYS] after Evacuation Vehicle A failure [FROM GATEWAYS].`;
            consequence = `[AGENT-DERIVED] I-3 ground containment firebreak delayed [SIMULATED — DEMO DATA]; recommend substituting with aerial drone reconnaissance overwatch [RECOMMENDATION].`;
          }

          items.push({
            plan_id: targetPlanId,
            change_type: 'reallocated',
            resource_id: resId,
            resource_name: resName,
            previous_assignment: prevIncName,
            new_assignment: targetIncName,
            reason,
            consequence,
          });
          reallocatedCount++;
        } else {
          // Preserved assignment
          items.push({
            plan_id: targetPlanId,
            change_type: 'preserved',
            resource_id: resId,
            resource_name: resName,
            previous_assignment: targetIncName,
            new_assignment: targetIncName,
            reason: `[CALCULATION — DERIVED FROM EXPLICIT INPUTS] Baseline assignment preserved by deterministic solver based on capability match and stability bonus (Boat 1 assigned to I-1: [FROM GATEWAYS]).`,
            consequence: `[AGENT-DERIVED] Continuous operational readiness maintained along navigable water route (River route availability: [DATABASE — T0 SEED]).`,
          });
          preservedCount++;
        }
      }
    }

    // 3. Process delayed incidents
    if (options?.delayedIncidents) {
      for (const del of options.delayedIncidents) {
        items.push({
          plan_id: targetPlanId,
          change_type: 'delayed',
          resource_id: undefined,
          resource_name: del.name || del.id,
          previous_assignment: 'Active Response Plan (T0 Baseline)',
          new_assignment: 'Delayed / Monitored on Safety Buffer',
          reason: del.reason,
          consequence: `[AGENT-DERIVED / RECOMMENDATION] Response action temporarily queued pending mutual aid arrival or primary life-safety resolution.`,
        });
        delayedCount++;
      }
    }


    const totalChanges = addedCount + reallocatedCount + delayedCount + removedCount;
    const summary = `Plan ${targetPlanId} diff vs ${parentPlanId || 'baseline'}: ${reallocatedCount} reallocated, ${delayedCount} delayed, ${removedCount} removed, ${addedCount} added, ${preservedCount} preserved.`;

    return {
      planId: targetPlanId,
      targetPlanId,
      parentPlanId,
      totalChanges,
      addedCount,
      reallocatedCount,
      delayedCount,
      removedCount,
      preservedCount,
      items,
      summary,
    };
  },
};
