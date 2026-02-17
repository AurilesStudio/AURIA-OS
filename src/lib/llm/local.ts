import type { LLMRequest, LLMResponse } from "./types";

/**
 * Calls a local LLM server (Ollama, llama.cpp, vLLM, etc.)
 * using the OpenAI-compatible `/v1/chat/completions` endpoint.
 */
export async function callLocal(
  endpoint: string,
  model: string,
  request: LLMRequest,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const url = `${endpoint.replace(/\/+$/, "")}/v1/chat/completions`;

  const messages: { role: string; content: string }[] = [];
  if (request.system) {
    messages.push({ role: "system", content: request.system });
  }
  for (const m of request.messages) {
    messages.push({ role: m.role, content: m.content });
  }

  const body: Record<string, unknown> = { model, messages };
  if (request.maxTokens !== undefined) body.max_tokens = request.maxTokens;
  if (request.temperature !== undefined) body.temperature = request.temperature;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Local LLM ${res.status}: ${err}`);
  }

  const data = await res.json();

  return {
    content: data.choices?.[0]?.message?.content ?? "",
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    model,
  };
}
