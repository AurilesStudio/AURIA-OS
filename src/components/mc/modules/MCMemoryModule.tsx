import { Brain } from "lucide-react";
import { useStore } from "@/store/useStore";

export function MCMemoryModule() {
  const count = useStore((s) => s.mcMemories.length);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Brain className="h-12 w-12 text-text-muted/30" />
      <h2 className="text-lg font-semibold text-text-primary">Memory</h2>
      <p className="text-sm text-text-muted">
        {count > 0 ? `${count} memor${count > 1 ? "ies" : "y"}` : "No memories yet"}
      </p>
      <p className="max-w-sm text-center text-xs text-text-muted/60">
        Store decisions, learnings, and context for your projects.
      </p>
    </div>
  );
}
