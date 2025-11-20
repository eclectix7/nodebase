import { UnifiedModel, ProviderModelResponse } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/models";

export async function listOpenAIModels(): Promise<ProviderModelResponse> {
  const res = await fetch(OPENAI_URL, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  const data = await res.json();

  const models: UnifiedModel[] = data.data.map((m: any) => ({
    provider: "openai",
    id: m.id,
  }));

  return { provider: "openai", models };
}
