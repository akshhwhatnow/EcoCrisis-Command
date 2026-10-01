import { Incident, IncidentImpact } from '../types';

export interface SectorImpactSummary {
  peopleAtRiskTotal: number;
  evacuationProgressPct: number;
  livestockAtRiskTotal: number;
  livestockSafeBufferHrs: number;
  cropHectaresTotal: number;
  cropEconomicLossEstimatedUSD: number;
  endangeredSpeciesCount: number;
  habitatAreaKm2Total: number;
  infrastructureCount: number;
  overallSystemRiskScore: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface TradeoffItem {
  sectorA: string;
  sectorB: string;
  decisionText: string;
  gainDescription: string;
  costDescription: string;
  ethicalRuleJustification: string;
  urgencyDeltaMinutes: number;
}

export function computeCrossSectorImpact(incidents: Incident[]): SectorImpactSummary {
  const active = incidents.filter(i => i.status !== 'Resolved');

  let peopleAtRisk = 0;
  let livestock = 0;
  let crops = 0;
  let endangered = 0;
  let habitatArea = 0;
  let infraCount = 0;

  for (const inc of active) {
    peopleAtRisk += inc.impact.peopleAtRisk;
    livestock += inc.impact.livestockCount;
    crops += inc.impact.cropHectares;
    habitatArea += inc.impact.habitatAreaKm2;
    endangered += inc.impact.wildlifeSpecies.length * 20; // approximate population factor
    infraCount += inc.impact.infrastructureRisk.length;
  }

  const cropLossUSD = crops * 9300; // $9,300 per hectare for premium grapes/crops

  let riskScore: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
  if (active.some(i => i.severity === 'Critical')) riskScore = 'Critical';
  else if (active.some(i => i.severity === 'High')) riskScore = 'High';

  return {
    peopleAtRiskTotal: peopleAtRisk,
    evacuationProgressPct: 68,
    livestockAtRiskTotal: livestock,
    livestockSafeBufferHrs: 3.5,
    cropHectaresTotal: crops,
    cropEconomicLossEstimatedUSD: cropLossUSD,
    endangeredSpeciesCount: endangered,
    habitatAreaKm2Total: Math.round(habitatArea * 10) / 10,
    infrastructureCount: infraCount,
    overallSystemRiskScore: riskScore,
  };
}

export function generateTradeoffAnalysis(): TradeoffItem[] {
  return [
    {
      sectorA: 'Human Life-Safety (I-4)',
      sectorB: 'Agricultural Livestock (I-2)',
      decisionText: '[AGENT-DERIVED / RECOMMENDATION] Diverting Transport Team B from I-2 (Farmland) to I-4 (Isolated Community)',
      gainDescription: 'Rapid extraction for isolated community (simulated 410 residents [SIMULATED — DEMO DATA]) cut off by bridge impassability [FROM GATEWAYS].',
      costDescription: 'Delays evacuation of dairy cattle (simulated 840 cattle [SIMULATED — DEMO DATA]) by estimated ~45 min [ESTIMATE — SIMULATED DEMO DATA] (farm retains safe smoke buffer of 3.5 hr [SIMULATED — DEMO DATA]).',
      ethicalRuleJustification: '[GOVERNANCE CONSTRAINT — PROPOSED ENGINEERING DECISION] Immediate human life-safety strictly supersedes agricultural asset protection when safe time buffer exists.',
      urgencyDeltaMinutes: 45,
    },
    {
      sectorA: 'Human Community Evacuation (I-1)',
      sectorB: 'Wildlife Sanctuary Protection (I-3)',
      decisionText: '[AGENT-DERIVED / RECOMMENDATION] Reallocating Rescue Team C from I-3 (Pine Ridge Sanctuary) to I-1 (Hillside Village)',
      gainDescription: 'Replaces disabled Evacuation Vehicle A [FROM GATEWAYS], restoring ground mass evacuation capacity for Hillside Village (simulated 1,200 residents [SIMULATED — DEMO DATA]).',
      costDescription: 'Delays physical ground firebreak containment at ecological reserve (simulated elk habitat [SIMULATED — DEMO DATA]).',
      ethicalRuleJustification: '[GOVERNANCE CONSTRAINT — PROPOSED ENGINEERING DECISION] Substitute physical ground teams with aerial drone reconnaissance overwatch [RECOMMENDATION] during peak life-safety demand.',
      urgencyDeltaMinutes: 60,
    },
    {
      sectorA: 'Dual Waterway Corridor',
      sectorB: 'Single-Point Marina Staging',
      decisionText: '[RECOMMENDATION] Widening Boat 1 patrol corridor to encompass both I-1 riverside and I-4 northern river bank',
      gainDescription: 'Provides secondary amphibious escape route for cut-off residents without waiting for bridge repairs [RECOMMENDATION].',
      costDescription: 'Increases boat turnaround interval from estimated 8 minutes to 16 minutes per evacuation cycle [ESTIMATE — SIMULATED DEMO DATA].',
      ethicalRuleJustification: '[GOVERNANCE CONSTRAINT — PROPOSED ENGINEERING DECISION] Multi-modal transit utilization across adjacent water barriers under infrastructure failure.',
      urgencyDeltaMinutes: 12,
    },
  ];
}

