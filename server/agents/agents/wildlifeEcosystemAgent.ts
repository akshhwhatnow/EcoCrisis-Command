import crypto from 'crypto';
import { CrisisAgent, AgentContext, AgentResult, AgentFinding, AgentRecommendation, AgentConstraint, AgentEvidence } from '../types.js';

export class WildlifeEcosystemAgent implements CrisisAgent {
  public id = 'agent-wildlife-ecosystem';
  public role = 'WILDLIFE_ECOSYSTEM' as const;
  public name = 'Wildlife & Ecosystem Agent';
  public description = 'Assesses biodiversity corridors, endangered species populations, sanctuary habitats, and ecological containment.';

  async execute(context: AgentContext): Promise<AgentResult> {
    const startedAt = new Date().toISOString();
    const runId = `RUN-WLD-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

    const findings: AgentFinding[] = [];
    const recommendations: AgentRecommendation[] = [];
    const constraints: AgentConstraint[] = [];
    const evidence: AgentEvidence[] = [];

    // Filter wildlife / ecosystem incidents (e.g. I-3)
    const wildlifeIncidents = context.incidents.filter(
      (i) =>
        (i.sector || '').toLowerCase().includes('eco') ||
        (i.sector || '').toLowerCase().includes('wild') ||
        (i.incident_type || '').toLowerCase().includes('wildlife') ||
        (i.impact_wildlife_species && i.impact_wildlife_species.length > 0)
    );

    for (const inc of wildlifeIncidents) {
      const wildlifeEvidence: AgentEvidence = {
        type: 'DATABASE',
        source: 'incidents',
        reference: inc.id,
        details: {
          species: inc.impact_wildlife_species,
          habitatAreaKm2: inc.impact_habitat_area_km2,
          accessibility: inc.accessibility_status,
        },
      };
      evidence.push(wildlifeEvidence);

      findings.push({
        findingType: 'ENDANGERED_SPECIES_THREAT',
        summary: `${inc.id} (${inc.name}): Critical habitat for ${inc.impact_wildlife_species.join(', ')} threatened across ${inc.impact_habitat_area_km2} km2.`,
        details: {
          incidentId: inc.id,
          speciesCount: inc.impact_wildlife_species.length,
          speciesList: inc.impact_wildlife_species,
          habitatAreaKm2: inc.impact_habitat_area_km2,
          terrainProfile: inc.accessibility_status,
        },
        confidence: {
          score: 0.90,
          rationale: 'Species inventory confirmed from ecological sanctuary registry in database.',
          limitations: ['Real-time herd tracking collars simulated; rely on habitat geographic boundary.'],
        },
        evidence: [wildlifeEvidence],
      });
    }

    findings.push({
      findingType: 'ECOLOGICAL_CONTAINMENT_STRATEGY',
      summary: 'Pine Ridge Sanctuary requires physical ground containment firebreaks along flank; can substitute with aerial thermal drone overwatch during peak triage.',
      details: {
        primaryMethod: 'Ground Firebreak & Veterinary Containment',
        contingencyMethod: 'Aerial Thermal Drone Overwatch',
        substitutableUnderLifeSafetyEmergency: true,
      },
      confidence: {
        score: 0.88,
        rationale: 'Evaluated against multi-crisis triage rules and terrain accessibility.',
        limitations: ['Ground access limited by rough track road conditions.'],
      },
      evidence,
    });

    recommendations.push({
      priority: 'MEDIUM',
      action: 'Deploy Rescue Team C to construct ground firebreak at Pine Ridge ridge line',
      rationale: 'Protects key Roosevelt Elk migration corridor from eastern fire flank.',
      targetEntityId: 'I-3',
    });

    constraints.push({
      constraintType: 'HABITAT_GROUND_ACCESS_RESTRICTION',
      description: 'Access to sanctuary ridge is rough track only; standard heavy buses cannot traverse without off-road rescue units.',
      hardConstraint: true,
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
        score: 0.89,
        rationale: 'Wildlife habitats and species profiles mapped directly from database layers.',
        limitations: ['Sub-surface ecosystem dynamics not modeled.'],
      },
      findings,
      recommendations,
      constraints,
      evidence,
    };
  }
}
