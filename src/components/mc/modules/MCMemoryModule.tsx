import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { MemoryHeader } from "../memory/MemoryHeader";
import { MemoryList } from "../memory/MemoryList";
import { MemoryModal } from "../memory/MemoryModal";
import type { MCMemory, MCMemoryCategory } from "@/types/mission-control";

export function MCMemoryModule() {
  const memories = useStore((s) => s.mcMemories);

  const [createOpen, setCreateOpen] = useState(false);
  const [editMemory, setEditMemory] = useState<MCMemory | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MCMemoryCategory | "">("");

  const filtered = useMemo(() => {
    let result = memories;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.source.toLowerCase().includes(q),
      );
    }

    if (categoryFilter) {
      result = result.filter((m) => m.category === categoryFilter);
    }

    // Sort newest first
    return [...result].sort((a, b) => b.createdAt - a.createdAt);
  }, [memories, search, categoryFilter]);

  return (
    <div className="flex h-full flex-col">
      <MemoryHeader
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilter={setCategoryFilter}
        onNewMemory={() => setCreateOpen(true)}
      />

      <MemoryList
        memories={filtered}
        onEdit={setEditMemory}
      />

      {/* Create modal */}
      <MemoryModal
        open={createOpen}
        memory={null}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit modal */}
      <MemoryModal
        open={editMemory !== null}
        memory={editMemory}
        onClose={() => setEditMemory(null)}
      />
    </div>
  );
}
