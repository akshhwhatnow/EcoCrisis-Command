import crypto from 'crypto';
import { CrisisAgent, AgentContext, AgentResult, AgentFinding, AgentRecommendation, AgentConstraint, AgentEvidence } from '../types.js';

export class IncidentAssessmentAgent implements CrisisAgent {
  public id = 'agent-incident-assessment';
  public role = 'INCIDENT_ASSESSMENT' as const;
  public name = 'Incident Assessment Agent';
  public description = 'Assesses multi-incident severity, life-safety urgency, and sector impact prioritization.';

  async execute(context: AgentContext): Promise<AgentResult> {
    const startedAt = new Date().toISOString();
    const runId = `RUN-INC-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

    const findings: AgentFinding[] = [];
    const recommendations: AgentRecommendation[] = [];
    const constraints: AgentConstraint[] = [];
    const evidence: AgentEvidence[] = [];

    // Assess incidents from context
    for (const inc of context.incidents) {
      const isLifeSafety = inc.severity === 'Critical' || inc.impact_people_at_risk > 0;
      const evidenceItem: AgentEvidence = {
        type: 'DATABASE',
        source: 'incidents',
        reference: inc.id,
        details: {
          name: inc.name,
          severity: inc.severity,
          urgency: inc.urgency,
          peopleAtRisk: inc.impact_people_at_risk,
        },
      };
      evidence.push(evidenceItem);

      findings.push({
        findingType: 'INCIDENT_TRIAGE',
        summary: `${inc.id} (${inc.name}) classified as ${inc.severity} severity with ${inc.urgency} urgency in ${inc.sector}.`,
        details: {
          incidentId: inc.id,
          sector: inc.sector,
          severity: inc.severity,
          urgency: inc.urgency,
          isLifeSafetyCritical: isLifeSafety,
          accessibility: inc.accessibility_status,
        },
        confidence: {
          score: 0.95,
          rationale: 'Directly verified from persistent database incident records.',
          limitations: ['Static report; on-scene ground telemetry updates pending.'],
        },
        evidence: [evidenceItem],
      });

      if (isLifeSafety) {
        recommendations.push({
          priority: 'CRITICAL',
          action: `Prioritize immediate mass evacuation transport to ${inc.id}`,
          rationale: `Human settlement at ${inc.id} has ${inc.impact_people_at_risk} residents in immediate hazard path.`,
          targetEntityId: inc.id,
        });

        constraints.push({
          constraintType: 'LIFE_SAFETY_PRIORITY',
          description: `Mandatory allocation of high-capacity transport assets to ${inc.id} before secondary agricultural/wildlife tasks.`,
          hardConstraint: true,
        });
      }
    }

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
        score: 0.94,
        rationale: 'Complete incident registry available from database with valid triage attributes.',
        limitations: ['Real-time sensor feeds are simulated in current demonstration.'],
      },
      findings,
      recommendations,
      constraints,
      evidence,
    };
  }
}
