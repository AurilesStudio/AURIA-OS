import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { getAvatarSystemPrompt } from "@/types/avatar";
import { executeLLM } from "@/lib/llm/execute";
import { computeCost } from "@/lib/llm/pricing";

/**
 * Handles the working → success/error → idle cycle for a given avatar.
 * Cloud providers use the global API key from settings.
 * Local provider uses the configured Ollama endpoint (no key needed).
 * "auria" provider falls back to simulation.
 */
export function useAvatarAction(avatarId: string) {
  const avatar = useStore((s) => s.avatars.find((a) => a.id === avatarId));
  const roles = useStore((s) => s.roles);
  const llmApiKeys = useStore((s) => s.llmApiKeys);
  const localLlmEndpoint = useStore((s) => s.localLlmEndpoint);
  const localLlmModel = useStore((s) => s.localLlmModel);
  const completeAction = useStore((s) => s.completeAction);
  const failAction = useStore((s) => s.failAction);
  const setAvatarStatus = useStore((s) => s.setAvatarStatus);
  const addTokenUsage = useStore((s) => s.addTokenUsage);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (avatar?.status !== "working" || !avatar.currentAction) return;

    const { provider } = avatar;
    const apiKey = llmApiKeys[provider] ?? "";
    const prompt = avatar.currentAction.prompt;
    const systemPrompt = getAvatarSystemPrompt(avatar, roles);

    // Determine if we can make a real call
    const isLocal = provider === "local";
    const canCall = isLocal || (provider !== "auria" && apiKey);

    // Fallback simulation
    if (!canCall) {
      const duration = 3000 + Math.random() * 2000;
      timerRef.current = setTimeout(() => {
        completeAction(avatarId, "Task completed successfully");
        timerRef.current = setTimeout(() => {
          setAvatarStatus(avatarId, "idle");
        }, 2000);
      }, duration);

      return () => clearTimeout(timerRef.current);
    }

    // Real LLM call
    const controller = new AbortController();
    abortRef.current = controller;

    executeLLM(
      provider,
      apiKey,
      {
        messages: [{ role: "user", content: prompt }],
        system: systemPrompt || undefined,
      },
      controller.signal,
      { localEndpoint: localLlmEndpoint, localModel: localLlmModel },
    )
      .then((response) => {
        const cost = computeCost(provider, response.inputTokens, response.outputTokens);
        completeAction(avatarId, response.content, {
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          cost,
        });
        addTokenUsage(provider, response.inputTokens, response.outputTokens);

        timerRef.current = setTimeout(() => {
          setAvatarStatus(avatarId, "idle");
        }, 2000);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        failAction(avatarId, err instanceof Error ? err.message : String(err));

        timerRef.current = setTimeout(() => {
          setAvatarStatus(avatarId, "idle");
        }, 2000);
      });

    return () => {
      controller.abort();
      clearTimeout(timerRef.current);
    };
  }, [avatar?.status, avatar?.currentAction?.id, avatarId, completeAction, failAction, setAvatarStatus, addTokenUsage, roles, llmApiKeys, localLlmEndpoint, localLlmModel]);
}
