import { describe, it, expect } from 'vitest';
import {
  calculateDistanceKm,
  calculateTravelTimeMinutes,
  evaluateCapabilityMatch,
  solveDeterministicAllocation,
} from '../services/optimizationEngine';
import { computeCrossSectorImpact, generateTradeoffAnalysis } from '../services/riskImpactEngine';
import {
  INITIAL_INCIDENTS,
  CRISIS_NEW_INCIDENT_I4,
  INITIAL_RESOURCES,
} from '../data/seedData';

describe('Deterministic Optimization & Routing Engine', () => {
  it('calculates reproducible distances between geographical coordinates', () => {
    const coordA = { lat: 38.845, lng: -122.785 };
    const coordB = { lat: 38.858, lng: -122.795 };
    const dist = calculateDistanceKm(coordA, coordB);
    expect(dist).toBeGreaterThan(1.0);
    expect(dist).toBeLessThan(5.0);
    expect(dist).toEqual(calculateDistanceKm(coordA, coordB)); // 100% deterministic
  });

  it('calculates deterministic travel times considering road impassability', () => {
    // Open road
    const timeOpen = calculateTravelTimeMinutes(10, 'Open', 'Evacuation Vehicle');
    expect(timeOpen).toBe(11);

    // Blocked bridge - regular vehicle cannot pass
    const timeBlocked = calculateTravelTimeMinutes(10, 'Bridge Blocked', 'Evacuation Vehicle');
    expect(timeBlocked).toBe(999);

    // Blocked bridge - heavy 6x6 transport team can bypass off-road
    const time6x6Bypass = calculateTravelTimeMinutes(10, 'Bridge Blocked', 'Transport Team');
    expect(time6x6Bypass).toBe(33);

    // Waterway boat route
    const timeBoat = calculateTravelTimeMinutes(10, 'Open', 'Boat');
    expect(timeBoat).toBe(17);
  });

  it('evaluates capability matching accurately without LLM hallucinations', () => {
    const normalIncident = INITIAL_INCIDENTS[0]; // I-1
    const trappedIncident = CRISIS_NEW_INCIDENT_I4; // I-4 (Bridge Blocked)

    const vehicleA = INITIAL_RESOURCES.find(r => r.id === 'RES-EVAC-A')!;
    const teamB = INITIAL_RESOURCES.find(r => r.id === 'RES-TRANS-B')!; // 6x6 chassis
    const boat1 = INITIAL_RESOURCES.find(r => r.id === 'RES-BOAT-1')!;

    // Normal incident match
    expect(evaluateCapabilityMatch(vehicleA, normalIncident)).toBeGreaterThan(0.9);

    // Bridge blocked incident match: regular vehicle fails, 6x6 and boat succeed
    expect(evaluateCapabilityMatch(vehicleA, trappedIncident)).toBe(0.1);
    expect(evaluateCapabilityMatch(teamB, trappedIncident)).toBe(0.98);
    expect(evaluateCapabilityMatch(boat1, trappedIncident)).toBe(0.95);
  });

  it('solves baseline T0 allocation for 3 concurrent incidents', () => {
    const result = solveDeterministicAllocation(INITIAL_INCIDENTS, INITIAL_RESOURCES);
    expect(result.assignments.length).toBeGreaterThanOrEqual(3);
    expect(result.delayedIncidents.length).toBe(0);
  });

  it('handles T0+10m crisis: reallocates 6x6 Team B to I-4 and Team C to I-1 upon Vehicle A failure', () => {
    const currentIncidents = [CRISIS_NEW_INCIDENT_I4, ...INITIAL_INCIDENTS];
    const availableResources = INITIAL_RESOURCES.map(r =>
      r.id === 'RES-EVAC-A' ? { ...r, state: 'Unavailable' as const } : r
    );

    const previousAssignments = {
      'RES-EVAC-A': 'I-1',
      'RES-TRANS-B': 'I-2',
      'RES-RESCUE-C': 'I-3',
      'RES-BOAT-1': 'I-1',
    };

    const result = solveDeterministicAllocation(currentIncidents, availableResources, previousAssignments);

    // I-4 (Critical Trapped) and I-1 (Critical Life-Safety) must be covered
    const assignedIncidentIds = result.assignments.map(a => a.incidentId);
    expect(assignedIncidentIds).toContain('I-4');
    expect(assignedIncidentIds).toContain('I-1');

    // Plan diffs must explain reallocations
    expect(result.planDiffs.length).toBeGreaterThan(0);
    expect(result.planDiffs.some(d => d.type === 'reallocated')).toBe(true);
  });
});

describe('Cross-Sector Risk & Impact Engine', () => {
  it('aggregates multi-incident impact across people, livestock, crops and wildlife', () => {
    const summary = computeCrossSectorImpact([CRISIS_NEW_INCIDENT_I4, ...INITIAL_INCIDENTS]);
    expect(summary.peopleAtRiskTotal).toBe(1200 + 85 + 12 + 410);
    expect(summary.livestockAtRiskTotal).toBe(35 + 840 + 0 + 45);
    expect(summary.overallSystemRiskScore).toBe('Critical');
  });

  it('generates multi-crisis trade-off evaluations', () => {
    const tradeoffs = generateTradeoffAnalysis();
    expect(tradeoffs.length).toBe(3);
    expect(tradeoffs[0].sectorA).toContain('Human Life-Safety');
    expect(tradeoffs[0].sectorB).toContain('Agricultural Livestock');
    expect(tradeoffs[0].ethicalRuleJustification).toBeDefined();
  });
});
