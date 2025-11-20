export interface UnifiedModel {
  provider: "openai" | "anthropic" | "gemini";
  id: string;
  displayName?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

export interface ProviderModelResponse {
  provider: UnifiedModel["provider"];
  models: UnifiedModel[];
}
