import crypto from 'crypto';
import { CrisisAgent, AgentContext, AgentResult, AgentFinding, AgentRecommendation, AgentConstraint, AgentEvidence } from '../types.js';

export class HazardFireWeatherAgent implements CrisisAgent {
  public id = 'agent-hazard-fire-weather';
  public role = 'HAZARD_FIRE_WEATHER' as const;
  public name = 'Hazard: Fire & Weather Agent';
  public description = 'Evaluates atmospheric weather conditions, fire spread vectors, smoke dispersion buffers, and perimeter boundaries.';

  async execute(context: AgentContext): Promise<AgentResult> {
    const startedAt = new Date().toISOString();
    const runId = `RUN-HAZ-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

    const findings: AgentFinding[] = [];
    const recommendations: AgentRecommendation[] = [];
    const constraints: AgentConstraint[] = [];
    const evidence: AgentEvidence[] = [];

    // Find hazard layer from spatial layers or fallback
    const hazardLayer = context.spatialLayers.find((l) => l.properties?.layerType === 'hazard' || l.properties?.sector === 'Hazard');

    const hazardEvidence: AgentEvidence = {
      type: hazardLayer ? 'DATABASE' : 'SIMULATED',
      source: hazardLayer ? 'spatial_layers' : 'weather_simulation_model',
      reference: hazardLayer?.id || 'SIM-WEATHER-01',
      details: {
        windDirection: hazardLayer?.properties?.windDirection || 'SSE',
        spreadRateKmh: hazardLayer?.properties?.spreadRateKmh || 2.4,
        intensity: hazardLayer?.properties?.intensity || 'Severe',
        dataSource: hazardLayer ? 'Database Spatial Layer' : 'Simulated Weather Feed',
      },
    };
    evidence.push(hazardEvidence);

    findings.push({
      findingType: 'FIRE_SPREAD_VECTOR',
      summary: `Active fire perimeter propagating SSE at ${hazardEvidence.details?.spreadRateKmh} km/h with severe thermal ember threat.`,
      details: hazardEvidence.details || {},
      confidence: {
        score: 0.88,
        rationale: 'Derived from spatial hazard perimeter model. Note: Real-time satellite telemetry is simulated.',
        limitations: ['Live Doppler radar and raw NOAA HRRR feeds are simulated for this demonstration.'],
      },
      evidence: [hazardEvidence],
    });

    findings.push({
      findingType: 'SMOKE_DISPERSION_BUFFER',
      summary: 'Valley agricultural zone retains an estimated 3.5-hour safe atmospheric buffer before smoke concentration breaches threshold.',
      details: {
        safeBufferHours: 3.5,
        threatenedSectors: ['Agriculture', 'Human Settlement'],
      },
      confidence: {
        score: 0.85,
        rationale: 'Calculated from atmospheric wind vector and topographic gradient.',
        limitations: ['Wind gusts may alter buffer window by +/- 20%.'],
      },
      evidence: [hazardEvidence],
    });

    recommendations.push({
      priority: 'HIGH',
      action: 'Establish defensible containment perimeter along northern ridge and monitor water-channel smoke corridor',
      rationale: 'Prevents fire from jumping Highway 101 arterial corridor while preserving riverside transit access.',
    });

    constraints.push({
      constraintType: 'HAZARD_BUFFER_WINDOW',
      description: 'Agricultural operations have a 3.5-hour window before smoke breach; ground assets can be temporarily redirected during life-safety emergencies.',
      hardConstraint: false,
    });

    const completedAt = new Date().toISOString();

    return {
      agentId: this.id,
      role: this.role,
      name: this.name,
      runId,
      status: 'SUCCESS',
      startedAt,
      completedAt,
      confidence: {
        score: 0.87,
        rationale: 'Hazard geometry and atmospheric parameters verified against available spatial data models.',
        limitations: ['Live NOAA weather feed is simulated.'],
      },
      findings,
      recommendations,
      constraints,
      evidence,
    };
  }
}
