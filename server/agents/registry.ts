import { CrisisAgent, AgentRole } from './types.js';
import { IncidentAssessmentAgent } from './agents/incidentAssessmentAgent.js';
import { HazardFireWeatherAgent } from './agents/hazardFireWeatherAgent.js';
import { AgricultureAgent } from './agents/agricultureAgent.js';
import { WildlifeEcosystemAgent } from './agents/wildlifeEcosystemAgent.js';
import { ResourceAllocationAgent } from './agents/resourceAllocationAgent.js';
import { RouteLogisticsAgent } from './agents/routeLogisticsAgent.js';
import { VerificationConfidenceAgent } from './agents/verificationConfidenceAgent.js';
import { CommandPlanningAgent } from './agents/commandPlanningAgent.js';

export class AgentRegistry {
  private agents: Map<AgentRole, CrisisAgent> = new Map();
  private executionOrder: AgentRole[] = [];

  constructor() {
    this.registerDefaultAgents();
  }

  private registerDefaultAgents(): void {
    // Exactly 7 Specialized Agents + 1 Command/Planning Agent = 8 Total Agent Roles
    const agentList: CrisisAgent[] = [
      new IncidentAssessmentAgent(),
      new HazardFireWeatherAgent(),
      new AgricultureAgent(),
      new WildlifeEcosystemAgent(),
      new ResourceAllocationAgent(),
      new RouteLogisticsAgent(),
      new VerificationConfidenceAgent(),
      new CommandPlanningAgent(),
    ];

    for (const agent of agentList) {
      this.agents.set(agent.role, agent);
      this.executionOrder.push(agent.role);
    }
  }

  public getAgent(role: AgentRole): CrisisAgent | undefined {
    return this.agents.get(role);
  }

  public getAllAgents(): CrisisAgent[] {
    return this.executionOrder.map((role) => this.agents.get(role)!);
  }

  public getExecutionOrder(): AgentRole[] {
    return [...this.executionOrder];
  }
}

export const defaultAgentRegistry = new AgentRegistry();
