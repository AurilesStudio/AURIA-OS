import type { LLMRequest, LLMResponse } from "./types";

const MODEL = "gemini-2.0-flash";

function buildUrl(apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
}

export async function callGemini(
  apiKey: string,
  request: LLMRequest,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const contents = request.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = { contents };

  if (request.system) {
    body.systemInstruction = { parts: [{ text: request.system }] };
  }

  if (request.temperature !== undefined || request.maxTokens !== undefined) {
    const config: Record<string, unknown> = {};
    if (request.temperature !== undefined) config.temperature = request.temperature;
    if (request.maxTokens !== undefined) config.maxOutputTokens = request.maxTokens;
    body.generationConfig = config;
  }

  const res = await fetch(buildUrl(apiKey), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini API ${res.status}: ${err}`);
  }

  const data = await res.json();

  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
    inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
    model: MODEL,
  };
}
