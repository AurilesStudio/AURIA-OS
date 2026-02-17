/** Price per 1 million tokens (USD) */
export const LLM_PRICING: Record<string, { input: number; output: number }> = {
  claude:  { input: 3.00, output: 15.00 },  // Sonnet 4.5
  gemini:  { input: 0.10, output: 0.40  },  // Gemini 2.0 Flash
  mistral: { input: 2.00, output: 6.00  },  // Mistral Large
  local:   { input: 0,    output: 0     },  // Self-hosted — free
};

export function computeCost(
  provider: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = LLM_PRICING[provider];
  if (!pricing) return 0;
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output
  );
}
