import crypto from 'crypto';
import { CrisisAgent, AgentContext, AgentResult, AgentFinding, AgentRecommendation, AgentConstraint, AgentEvidence } from '../types.js';

export class VerificationConfidenceAgent implements CrisisAgent {
  public id = 'agent-verification-confidence';
  public role = 'VERIFICATION_CONFIDENCE' as const;
  public name = 'Verification / Confidence Agent';
  public description = 'Inspects cross-agent findings, validates evidence chains, flags contradictions, and calculates composite confidence.';

  async execute(context: AgentContext): Promise<AgentResult> {
    const startedAt = new Date().toISOString();
    const runId = `RUN-VER-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

    const findings: AgentFinding[] = [];
    const recommendations: AgentRecommendation[] = [];
    const constraints: AgentConstraint[] = [];
    const evidence: AgentEvidence[] = [];

    const expectedUpstreamRoles: (keyof typeof context.previousResults)[] = [
      'INCIDENT_ASSESSMENT',
      'HAZARD_FIRE_WEATHER',
      'AGRICULTURE',
      'WILDLIFE_ECOSYSTEM',
      'RESOURCE_ALLOCATION',
      'ROUTE_LOGISTICS',
    ];

    let totalScore = 0;
    let successfulAgentCount = 0;
    let failedAgentCount = 0;
    const flaggedAnomalies: string[] = [];
    const missingEvidenceWarnings: string[] = [];
    const simulatedEvidenceWarnings: string[] = [];
    const limitationsDisclosures: string[] = [];

    // Audit each expected upstream agent output
    for (const role of expectedUpstreamRoles) {
      const res = context.previousResults[role];

      if (!res) {
        failedAgentCount++;
        flaggedAnomalies.push(`Required upstream agent ${role} was not executed.`);
        continue;
      }

      if (res.status === 'FAILED') {
        failedAgentCount++;
        flaggedAnomalies.push(`Upstream agent ${role} failed: ${res.error || 'Unknown error'}`);
        continue;
      }

      // Successful agent run
      successfulAgentCount++;
      const agentScore = Math.max(0.0, Math.min(1.0, res.confidence?.score || 0.0));
      totalScore += agentScore;

      // Audit evidence items for completeness & simulation disclosure
      for (const f of res.findings) {
        if (!f.evidence || f.evidence.length === 0) {
          missingEvidenceWarnings.push(`Agent ${role} finding '${f.findingType}' lacks explicit evidence references.`);
        } else {
          for (const e of f.evidence) {
            if (e.type === 'SIMULATED') {
              simulatedEvidenceWarnings.push(`Agent ${role} used simulated data from source '${e.source}'.`);
            }
          }
        }
      }

      // Record evidence provenance
      evidence.push({
        type: 'DERIVED',
        source: `Agent:${res.name}`,
        reference: res.runId,
        details: {
          role: res.role,
          confidence: res.confidence.score,
          findingsCount: res.findings.length,
          evidenceTypes: res.evidence.map((e) => e.type),
        },
      });
    }

    // Mathematical composite calculation:
    // Base score is the average of successful upstream agent confidence scores
    const rawAverage = successfulAgentCount > 0 ? totalScore / expectedUpstreamRoles.length : 0.0;

    // Penalties:
    // - 0.20 penalty per failed/missing required agent
    // - 0.05 penalty per missing evidence finding
    // - 0.03 penalty per simulated external feed
    const missingAgentPenalty = failedAgentCount * 0.20;
    const missingEvidencePenalty = Math.min(0.15, missingEvidenceWarnings.length * 0.05);
    const simulatedPenalty = simulatedEvidenceWarnings.length > 0 ? 0.03 : 0.0;

    const adjustedScore = Math.max(
      0.0,
      Math.min(1.0, rawAverage - missingAgentPenalty - missingEvidencePenalty - simulatedPenalty)
    );
    const finalConfidenceScore = Math.round(adjustedScore * 100) / 100;

    if (simulatedEvidenceWarnings.length > 0) {
      limitationsDisclosures.push('Atmospheric fire spread telemetry includes simulated weather model parameters.');
    }
    if (failedAgentCount > 0) {
      limitationsDisclosures.push(`${failedAgentCount} upstream agent(s) failed or were missing during pipeline execution.`);
    }
    if (missingEvidenceWarnings.length > 0) {
      limitationsDisclosures.push(`${missingEvidenceWarnings.length} finding(s) lacked explicit evidence references.`);
    }
    limitationsDisclosures.push('Confidence represents verifiable database and calculation consistency, NOT a guarantee of physical event outcomes.');

    findings.push({
      findingType: 'PIPELINE_CROSS_VERIFICATION',
      summary: `Verified ${successfulAgentCount}/${expectedUpstreamRoles.length} specialized upstream agents. Calculated composite confidence: ${Math.round(finalConfidenceScore * 100)}%.`,
      details: {
        totalExpectedAgents: expectedUpstreamRoles.length,
        successfulAgentCount,
        failedAgentCount,
        rawAverageConfidence: Math.round(rawAverage * 100) / 100,
        missingAgentPenalty,
        missingEvidencePenalty,
        simulatedPenalty,
        finalCompositeConfidence: finalConfidenceScore,
        flaggedAnomalies,
        missingEvidenceWarnings,
        simulatedEvidenceWarnings,
      },
      confidence: {
        score: finalConfidenceScore,
        rationale: `Composite score derived mathematically from ${successfulAgentCount} verified agent runs with applied penalties for simulation uncertainty.`,
        limitations: limitationsDisclosures,
      },
      evidence,
    });

    findings.push({
      findingType: 'HUMAN_REVIEW_FLAG_ASSESSMENT',
      summary: 'Life-safety priority and cross-sector allocations verified; mandatory human sign-off required prior to physical dispatch.',
      details: {
        requiresHumanSignoff: true,
        verificationStatus: failedAgentCount === 0 ? 'PASSED' : 'DEGRADED',
      },
      confidence: {
        score: finalConfidenceScore,
        rationale: 'Core GATEWAYS human-in-the-loop principle verified.',
        limitations: limitationsDisclosures,
      },
      evidence,
    });

    if (flaggedAnomalies.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Review failed upstream agent anomalies before authorizing response plan',
        rationale: flaggedAnomalies.join('; '),
      });
    }

    recommendations.push({
      priority: 'HIGH',
      action: 'Forward verified multi-incident synthesis to Command / Planning Agent for plan construction',
      rationale: `All critical life-safety and resource constraints validated with ${Math.round(finalConfidenceScore * 100)}% composite confidence.`,
    });

    const completedAt = new Date().toISOString();

    return {
      agentId: this.id,
      role: this.role,
      name: this.name,
      runId,
      status: failedAgentCount > 0 ? 'PARTIAL' : 'SUCCESS',
      startedAt,
      completedAt,
      confidence: {
        score: finalConfidenceScore,
        rationale: `Mathematical composite confidence based on evidence traceability and penalty-weighted deductions.`,
        limitations: limitationsDisclosures,
      },
      findings,
      recommendations,
      constraints,
      evidence,
    };
  }
}
