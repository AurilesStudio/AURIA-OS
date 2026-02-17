import type { LLMRequest, LLMResponse } from "./types";

const MODEL = "claude-sonnet-4-5-20250929";
const API_URL = "https://api.anthropic.com/v1/messages";

export async function callClaude(
  apiKey: string,
  request: LLMRequest,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: request.maxTokens ?? 1024,
    messages: request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };
  if (request.system) body.system = request.system;
  if (request.temperature !== undefined) body.temperature = request.temperature;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Claude API ${res.status}: ${err}`);
  }

  const data = await res.json();

  return {
    content: data.content?.[0]?.text ?? "",
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
    model: MODEL,
  };
}
