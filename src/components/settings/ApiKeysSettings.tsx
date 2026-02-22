import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Eye, EyeOff, Key, HardDrive, Github, BarChart2, FileText, Link } from "lucide-react";
import { AVATAR_PROVIDER_LABELS } from "@/types";
import type { LLMProvider } from "@/types";

const CLOUD_PROVIDERS: { id: Exclude<LLMProvider, "auria" | "local">; label: string; placeholder: string }[] = [
  { id: "claude",  label: AVATAR_PROVIDER_LABELS.claude,  placeholder: "sk-ant-..." },
  { id: "gemini",  label: AVATAR_PROVIDER_LABELS.gemini,  placeholder: "AIza..." },
  { id: "mistral", label: AVATAR_PROVIDER_LABELS.mistral, placeholder: "..." },
];

const INTEGRATION_SERVICES: { id: string; label: string; placeholder: string; icon: typeof Github; color: string }[] = [
  { id: "github", label: "GitHub", placeholder: "ghp_...", icon: Github, color: "#58a6ff" },
  { id: "linear", label: "Linear", placeholder: "lin_api_...", icon: BarChart2, color: "#818cf8" },
  { id: "notion", label: "Notion", placeholder: "ntn_...", icon: FileText, color: "#e0e0e0" },
];

const inputClass =
  "w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted/40 outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/25 transition-colors";

export function ApiKeysSettings() {
  const llmApiKeys = useStore((s) => s.llmApiKeys);
  const setLlmApiKey = useStore((s) => s.setLlmApiKey);
  const localLlmEndpoint = useStore((s) => s.localLlmEndpoint);
  const localLlmModel = useStore((s) => s.localLlmModel);
  const setLocalLlmEndpoint = useStore((s) => s.setLocalLlmEndpoint);
  const setLocalLlmModel = useStore((s) => s.setLocalLlmModel);
  const integrationKeys = useStore((s) => s.integrationKeys);
  const setIntegrationKey = useStore((s) => s.setIntegrationKey);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setVisible((v) => ({ ...v, [id]: !v[id] }));

  return (
    <div className="flex flex-col gap-4">
      {/* ── Cloud API Keys ─────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-neon-purple" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Cloud API Keys
          </h3>
        </div>

        {CLOUD_PROVIDERS.map(({ id, label, placeholder }) => {
          const value = llmApiKeys[id] ?? "";
          const show = visible[id] ?? false;

          return (
            <div key={id} className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-text-secondary">
                {label}
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => setLlmApiKey(id, e.target.value)}
                  placeholder={placeholder}
                  spellCheck={false}
                  autoComplete="off"
                  className={`${inputClass} pr-8`}
                />
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {show
                    ? <EyeOff className="h-3.5 w-3.5" />
                    : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {value && (
                <span className="text-[10px] text-emerald-400/70">Connected</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Local LLM ──────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Local LLM (Ollama)
          </h3>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-text-secondary">
            Endpoint
          </label>
          <input
            type="text"
            value={localLlmEndpoint}
            onChange={(e) => setLocalLlmEndpoint(e.target.value)}
            placeholder="http://localhost:11434"
            spellCheck={false}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-text-secondary">
            Model
          </label>
          <input
            type="text"
            value={localLlmModel}
            onChange={(e) => setLocalLlmModel(e.target.value)}
            placeholder="mistral"
            spellCheck={false}
            className={inputClass}
          />
          <span className="text-[10px] text-text-muted/60">
            e.g. mistral, llama3, codellama, deepseek-coder
          </span>
        </div>
      </div>

      {/* ── Integrations ─────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Integrations
          </h3>
        </div>

        {INTEGRATION_SERVICES.map(({ id, label, placeholder, icon: Icon, color }) => {
          const value = integrationKeys[id] ?? "";
          const show = visible[id] ?? false;

          return (
            <div key={id} className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color }} />
                {label}
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => setIntegrationKey(id, e.target.value)}
                  placeholder={placeholder}
                  spellCheck={false}
                  autoComplete="off"
                  className={`${inputClass} pr-8`}
                />
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {show
                    ? <EyeOff className="h-3.5 w-3.5" />
                    : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {value && (
                <span className="text-[10px] text-emerald-400/70">Connected</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-text-muted/60 leading-relaxed">
        Cloud keys are stored locally in your browser. Local provider connects to your Ollama instance — no API key needed, $0 cost. Integration keys connect directly for GitHub and Linear. Notion requires the API server.
      </p>
    </div>
  );
}
