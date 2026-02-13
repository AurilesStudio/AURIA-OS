import { useState, useRef } from "react";
import { GlowCard } from "@/components/shared/GlowCard";
import { useCommand } from "@/hooks/useCommand";
import { useAvatar } from "@/hooks/useAvatar";
import { ChevronRight } from "lucide-react";

export function OmniPrompt() {
  const [input, setInput] = useState("");
  const { execute, navigateHistory } = useCommand();
  const { selectedAvatar, assign } = useAvatar();
  const inputRef = useRef<HTMLInputElement>(null);

  const label = selectedAvatar ? selectedAvatar.name : "AURIA";
  const color = selectedAvatar ? selectedAvatar.color : "#ff003c";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    if (selectedAvatar) {
      // Assign task to selected avatar
      assign(trimmed);
    } else {
      // Normal command execution
      execute(trimmed);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const cmd = navigateHistory("up");
      setInput(cmd);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const cmd = navigateHistory("down");
      setInput(cmd);
    }
  };

  return (
    <GlowCard className="p-3" glowColor="red">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span
          className="text-sm font-bold"
          style={{ color, textShadow: `0 0 10px ${color}80` }}
        >
          {label}
        </span>
        <ChevronRight className="h-4 w-4" style={{ color }} />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedAvatar
              ? `Assign task to ${selectedAvatar.name}...`
              : "Enter command..."
          }
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted/50"
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </GlowCard>
  );
}
