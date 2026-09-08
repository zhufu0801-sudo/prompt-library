// This phase intentionally has no provider SDK, network call, model name or key.
export const aiCapabilities = {
  enabled: false,
  provider: null,
  recommend: false,
  optimize: false,
  run: false,
} as const;
export interface AIProvider {
  recommend(input: {
    templateId: string;
    values: Record<string, unknown>;
  }): Promise<string[]>;
  optimize(input: { prompt: string; lockedFields: string[] }): Promise<string>;
  run(input: { prompt: string }): Promise<string>;
}
export class DisabledAIProvider implements AIProvider {
  async recommend(): Promise<string[]> {
    throw new Error('AI_NOT_CONFIGURED');
  }
  async optimize(): Promise<string> {
    throw new Error('AI_NOT_CONFIGURED');
  }
  async run(): Promise<string> {
    throw new Error('AI_NOT_CONFIGURED');
  }
}
