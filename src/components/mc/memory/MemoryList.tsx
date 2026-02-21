import type { MCMemory } from "@/types/mission-control";
import { MemoryCard } from "./MemoryCard";
import { Brain } from "lucide-react";

interface MemoryListProps {
  memories: MCMemory[];
  onEdit: (memory: MCMemory) => void;
}

export function MemoryList({ memories, onEdit }: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Brain className="h-10 w-10 text-text-muted/20" />
        <p className="text-xs text-text-muted/60">No memories found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="flex flex-col gap-2">
        {memories.map((mem) => (
          <MemoryCard
            key={mem.id}
            memory={mem}
            onClick={() => onEdit(mem)}
          />
        ))}
      </div>
    </div>
  );
}
