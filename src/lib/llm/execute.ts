import type { LLMProvider } from "@/types/avatar";
import type { LLMRequest, LLMResponse } from "./types";
import { callClaude } from "./claude";
import { callGemini } from "./gemini";
import { callMistral } from "./mistral";
import { callLocal } from "./local";

export interface ExecuteLLMOptions {
  localEndpoint?: string;
  localModel?: string;
}

export async function executeLLM(
  provider: LLMProvider,
  apiKey: string,
  request: LLMRequest,
  signal?: AbortSignal,
  options?: ExecuteLLMOptions,
): Promise<LLMResponse> {
  switch (provider) {
    case "claude":
      return callClaude(apiKey, request, signal);
    case "gemini":
      return callGemini(apiKey, request, signal);
    case "mistral":
      return callMistral(apiKey, request, signal);
    case "local":
      return callLocal(
        options?.localEndpoint || "http://localhost:11434",
        options?.localModel || "mistral",
        request,
        signal,
      );
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
