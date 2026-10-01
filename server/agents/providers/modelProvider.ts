export interface AgentModelProvider {
  id: string;
  name: string;
  generateStructuredReasoning<T>(prompt: string, schema?: any, options?: Record<string, any>): Promise<T>;
}

export class DeterministicMockProvider implements AgentModelProvider {
  public id = 'mock-deterministic-provider';
  public name = 'Deterministic Multi-Agent Logic Provider (SIMULATED_AGENT_REASONING)';

  async generateStructuredReasoning<T>(prompt: string, schema?: any, options?: Record<string, any>): Promise<T> {
    // In mock mode, this provider returns deterministic, rule-based structured reasoning payloads
    // clearly annotated as SIMULATED_AGENT_REASONING.
    return {
      provider: this.id,
      mode: 'SIMULATED_AGENT_REASONING',
      timestamp: new Date().toISOString(),
      promptPreview: prompt.slice(0, 100),
      options,
    } as unknown as T;
  }
}

export const defaultModelProvider = new DeterministicMockProvider();
