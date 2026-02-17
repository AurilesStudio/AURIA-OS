export interface LLMRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}
