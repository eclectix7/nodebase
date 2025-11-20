import { UnifiedModel, ProviderModelResponse } from "./types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/models";

export async function listAnthropicModels(): Promise<ProviderModelResponse> {
  const res = await fetch(ANTHROPIC_URL, {
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
  });

  const data = await res.json();

  const models: UnifiedModel[] = data.data.map((m: any) => ({
    provider: "anthropic",
    id: m.id,
    displayName: m.display_name,
  }));

  return { provider: "anthropic", models };
}
