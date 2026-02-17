import type { LLMRequest, LLMResponse } from "./types";

const MODEL = "mistral-large-latest";
const API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function callMistral(
  apiKey: string,
  request: LLMRequest,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const messages: { role: string; content: string }[] = [];

  if (request.system) {
    messages.push({ role: "system", content: request.system });
  }

  for (const m of request.messages) {
    messages.push({ role: m.role, content: m.content });
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
  };
  if (request.maxTokens !== undefined) body.max_tokens = request.maxTokens;
  if (request.temperature !== undefined) body.temperature = request.temperature;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Mistral API ${res.status}: ${err}`);
  }

  const data = await res.json();

  return {
    content: data.choices?.[0]?.message?.content ?? "",
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    model: MODEL,
  };
}
