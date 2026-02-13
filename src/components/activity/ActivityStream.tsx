import { useEffect, useRef } from "react";
import { GlowCard } from "@/components/shared/GlowCard";
import { ActivityEntry } from "./ActivityEntry";
import { useActivityStream } from "@/hooks/useActivityStream";
import { ScrollText } from "lucide-react";

export function ActivityStream() {
  const { activities } = useActivityStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities.length]);

  return (
    <GlowCard className="flex h-full flex-col overflow-hidden p-0" glowColor="red">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <ScrollText className="h-4 w-4 text-neon-red" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Activity Stream
        </h2>
        <span className="ml-auto text-xs text-text-muted tabular-nums">
          {activities.length} entries
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-2 font-mono"
      >
        {activities.map((entry) => (
          <ActivityEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </GlowCard>
  );
}
