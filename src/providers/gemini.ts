import { UnifiedModel, ProviderModelResponse } from "./types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models?key=" +
  process.env.GOOGLE_API_KEY;

export async function listGeminiModels(): Promise<ProviderModelResponse> {
  const res = await fetch(GEMINI_URL);
  const data = await res.json();

  const models: UnifiedModel[] = (data.models ?? []).map((m: any) => ({
    provider: "gemini",
    id: m.name,
    displayName: m.displayName,
    inputTokenLimit: m.inputTokenLimit,
    outputTokenLimit: m.outputTokenLimit,
  }));

  return { provider: "gemini", models };
}
