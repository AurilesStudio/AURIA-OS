import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { ContentBoardHeader } from "../content/ContentBoardHeader";
import { ContentBoard } from "../content/ContentBoard";
import { ContentModal } from "../content/ContentModal";

export function MCContentModule() {
  const items = useStore((s) => s.mcContentPipeline);
  const [createOpen, setCreateOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("");

  const filteredItems = useMemo(() => {
    if (!platformFilter) return undefined; // undefined = show all (unfiltered)
    return items.filter(
      (item) => item.platform.toLowerCase() === platformFilter.toLowerCase(),
    );
  }, [items, platformFilter]);

  return (
    <div className="flex h-full flex-col">
      <ContentBoardHeader
        onNewContent={() => setCreateOpen(true)}
        platformFilter={platformFilter}
        onPlatformFilter={setPlatformFilter}
      />
      <ContentBoard filteredItems={filteredItems} />

      <ContentModal
        open={createOpen}
        item={null}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
