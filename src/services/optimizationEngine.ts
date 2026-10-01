import {
  Incident,
  Resource,
  PlanAssignment,
  PlanDiffItem,
  Coordinates,
} from '../types';

// Deterministic distance calculation using Haversine formula with terrain adjustment
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates, terrainPenalty = 1.25): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * terrainPenalty * 10) / 10;
}

// Deterministic travel time calculation in minutes based on road accessibility and speed profile
export function calculateTravelTimeMinutes(
  distanceKm: number,
  roadCondition: 'Open' | 'Partly Threatened' | 'Rough Track Only' | 'Cut Off' | 'Bridge Blocked',
  resourceType: string
): number {
  let avgSpeedKmh = 50; // default standard speed

  if (resourceType === 'Boat') {
    avgSpeedKmh = 35; // water speed
    return Math.max(3, Math.round((distanceKm / avgSpeedKmh) * 60));
  }
  if (resourceType === 'Aerial Drone' || resourceType === 'Helitack Unit') {
    avgSpeedKmh = 140; // air speed
    return Math.max(2, Math.round((distanceKm / avgSpeedKmh) * 60));
  }

  switch (roadCondition) {
    case 'Open':
      avgSpeedKmh = 55;
      break;
    case 'Partly Threatened':
      avgSpeedKmh = 30;
      break;
    case 'Rough Track Only':
      avgSpeedKmh = 20;
      break;
    case 'Bridge Blocked':
    case 'Cut Off':
      avgSpeedKmh = resourceType === 'Transport Team' ? 18 : 0; // Only heavy 6x6 can bypass
      break;
  }

  if (avgSpeedKmh === 0) return 999; // Inaccessible via standard vehicle
  return Math.max(4, Math.round((distanceKm / avgSpeedKmh) * 60));
}

// Capability matching score (0.0 to 1.0)
export function evaluateCapabilityMatch(resource: Resource, incident: Incident): number {
  if (resource.state === 'Unavailable') return 0;

  // Bridge Blocked / Cut Off requires 6x6 or Boat or Helitack
  if (incident.accessibility.status === 'Bridge Blocked' || incident.accessibility.status === 'Cut Off') {
    if (resource.type === 'Transport Team' && resource.specialCapabilities.some(c => c.includes('6x6') || c.includes('Off-Road'))) {
      return 0.98;
    }
    if (resource.type === 'Boat') return 0.95;
    if (resource.type === 'Helitack Unit') return 0.92;
    return 0.1; // Regular buses / ambulances cannot traverse
  }

  // Water access / Riverside
  if (incident.accessibility.riverRouteAvailable && resource.type === 'Boat') {
    return 0.95;
  }

  // Community Evacuation
  if (incident.type.includes('Community Evacuation') || incident.severity === 'Critical') {
    if (resource.type === 'Evacuation Vehicle') return 0.95;
    if (resource.type === 'Rescue Team') return 0.92;
    if (resource.type === 'Transport Team') return 0.88;
  }

  // Agriculture & Livestock
  if (incident.type.includes('Agricultural') || incident.type.includes('Livestock') || incident.type.includes('Farm')) {
    if (resource.type === 'Transport Team' && resource.specialCapabilities.some(c => c.includes('Livestock'))) return 0.98;
    if (resource.type === 'Agricultural Support') return 0.95;
    if (resource.type === 'Veterinary Support') return 0.90;
    return 0.15; // Rescue teams / boats cannot herd or transport cattle
  }

  // Wildlife
  if (incident.type.includes('Wildlife') || incident.type.includes('Biodiversity')) {
    if (resource.type === 'Wildlife Team') return 0.98;
    if (resource.type === 'Rescue Team' && resource.specialCapabilities.some(c => c.includes('Wildlife'))) return 0.95;
    if (resource.type === 'Veterinary Support') return 0.90;
  }

  return 0.6;
}

// Deterministic Multi-Incident Resource Allocation Solver
export function solveDeterministicAllocation(
  incidents: Incident[],
  resources: Resource[],
  previousAssignments: Record<string, string> = {}
): {
  assignments: PlanAssignment[];
  delayedIncidents: string[];
  delayedReasons: Record<string, string>;
  planDiffs: PlanDiffItem[];
  objectiveScore: number;
} {
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const availableResources = resources.filter(r => r.state !== 'Unavailable');

  // Severity weights
  const severityWeight: Record<string, number> = {
    'Critical': 100,
    'High': 60,
    'Medium-High': 40,
    'Medium': 25,
    'Low': 10,
  };

  const urgencyWeight: Record<string, number> = {
    'Immediate': 50,
    'Hours': 20,
    'Monitoring': 5,
  };

  // Sort incidents by total urgency and life safety weight
  const sortedIncidents = [...activeIncidents].sort((a, b) => {
    const scoreA = (severityWeight[a.severity] || 0) + (urgencyWeight[a.urgency] || 0) + (a.impact.peopleAtRisk > 0 ? 80 : 0);
    const scoreB = (severityWeight[b.severity] || 0) + (urgencyWeight[b.urgency] || 0) + (b.impact.peopleAtRisk > 0 ? 80 : 0);
    return scoreB - scoreA;
  });

  const assignments: PlanAssignment[] = [];
  const assignedResourceIds = new Set<string>();
  const coveredIncidentIds = new Set<string>();
  const delayedIncidents: string[] = [];
  const delayedReasons: Record<string, string> = {};

  // Step 1: Assign best matching primary resources to priority incidents
  for (const incident of sortedIncidents) {
    // Determine max resources needed for this incident
    const maxResourcesNeeded = (incident.severity === 'Critical' && incident.impact.peopleAtRisk > 100) ? 2 : 1;
    let incidentAssignedCount = 0;

    while (incidentAssignedCount < maxResourcesNeeded) {
      const candidates = availableResources
        .filter(r => !assignedResourceIds.has(r.id))
        .map(r => {
          const dist = calculateDistanceKm(r.coordinates, incident.coordinates);
          const travelTime = calculateTravelTimeMinutes(dist, incident.accessibility.status, r.type);
          const capability = evaluateCapabilityMatch(r, incident);
          const stabilityBonus = previousAssignments[r.id] === incident.id ? 25 : 0;

          if (travelTime >= 999 || capability <= 0.2) {
            return { resource: r, score: -1, travelTime, capability, dist };
          }

          const score =
            (severityWeight[incident.severity] || 0) * 0.4 +
            capability * 50 -
            travelTime * 0.8 +
            stabilityBonus;

          return { resource: r, score, travelTime, capability, dist };
        })
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score);

      if (candidates.length > 0) {
        const best = candidates[0];
        assignedResourceIds.add(best.resource.id);
        coveredIncidentIds.add(incident.id);
        incidentAssignedCount++;

        const isReallocation = previousAssignments[best.resource.id] && previousAssignments[best.resource.id] !== incident.id;
        const prevIncidentName = previousAssignments[best.resource.id]
          ? incidents.find(i => i.id === previousAssignments[best.resource.id])?.name
          : undefined;

        assignments.push({
          resourceId: best.resource.id,
          resourceName: best.resource.name,
          resourceType: best.resource.type,
          incidentId: incident.id,
          incidentName: `${incident.id} ${incident.name}`,
          action: isReallocation ? 'Reallocate' : 'Assign',
          notes: isReallocation
            ? `Reallocated from ${prevIncidentName} to cover higher priority life-safety objective at ${incident.id}.`
            : `Direct assignment optimized for ETA (${best.travelTime}m) and capability.`,
          etaMinutes: best.travelTime,
          routeDetails: `${best.dist} km via primary operational corridor`,
          previousAssignment: prevIncidentName,
        });
      } else {
        break;
      }
    }
  }

  // Step 2: Identify Delayed Incidents
  for (const incident of sortedIncidents) {
    if (!coveredIncidentIds.has(incident.id)) {
      delayedIncidents.push(incident.id);
      if (incident.impact.livestockCount > 0) {
        delayedReasons[incident.id] = `[AGENT-DERIVED / RECOMMENDATION] Agricultural response delayed temporarily based on simulated safe smoke buffer (3.5 hr [SIMULATED — DEMO DATA]); transport assets prioritized for life-safety evacuation [FROM GATEWAYS].`;
      } else if (incident.impact.wildlifeSpecies.length > 0) {
        delayedReasons[incident.id] = `[AGENT-DERIVED / RECOMMENDATION] Wildlife ground containment team diverted to emergency community evacuation [FROM GATEWAYS]; recommend monitoring via aerial drone reconnaissance [RECOMMENDATION].`;
      } else {
        delayedReasons[incident.id] = `[AGENT-DERIVED / RECOMMENDATION] Queued behind higher urgency life-safety incidents [FROM GATEWAYS]; mutual aid requested.`;
      }
    }
  }




  // Calculate Plan Diffs
  const planDiffs: PlanDiffItem[] = [];

  for (const assignment of assignments) {
    const prevIncId = previousAssignments[assignment.resourceId];
    if (prevIncId && prevIncId !== assignment.incidentId) {
      const prevInc = incidents.find(i => i.id === prevIncId);
      planDiffs.push({
        resourceId: assignment.resourceId,
        resourceName: assignment.resourceName,
        previousAssignment: `${prevIncId} ${prevInc?.name || ''}`,
        newAssignment: assignment.incidentName,
        reason: assignment.notes,
        type: 'reallocated',
      });
    } else if (!prevIncId) {
      planDiffs.push({
        resourceId: assignment.resourceId,
        resourceName: assignment.resourceName,
        previousAssignment: 'Unassigned / Available',
        newAssignment: assignment.incidentName,
        reason: assignment.notes,
        type: 'added',
      });
    }
  }

  for (const delId of delayedIncidents) {
    const inc = incidents.find(i => i.id === delId);
    if (inc) {
      planDiffs.push({
        resourceId: 'DELAYED',
        resourceName: `${inc.id} ${inc.name}`,
        previousAssignment: 'Active Response Plan',
        newAssignment: 'Delayed / Monitored on Buffer',
        reason: delayedReasons[delId] || 'Delayed due to scarce resource priority triage.',
        type: 'delayed',
      });
    }
  }

  return {
    assignments,
    delayedIncidents,
    delayedReasons,
    planDiffs,
    objectiveScore: Math.round((coveredIncidentIds.size / activeIncidents.length) * 100),
  };
}
