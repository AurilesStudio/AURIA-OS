import type { LinearCycle } from "@/lib/linearClient";

interface Props {
  cycles: LinearCycle[];
}

export function LinearCycleList({ cycles }: Props) {
  return (
    <div className="p-4">
      <span className="text-[10px] uppercase text-text-muted tracking-wider">Cycles</span>

      {cycles.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">No cycles found</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {cycles.map((c) => {
            const now = Date.now();
            const start = new Date(c.startsAt).getTime();
            const end = new Date(c.endsAt).getTime();
            const isActive = now >= start && now <= end;
            const isPast = now > end;

            return (
              <div
                key={c.id}
                className={`flex flex-col gap-3 rounded-lg border p-4 ${
                  isActive
                    ? "border-[#818cf8]/30 bg-[#818cf8]/[0.03]"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    Cycle {c.number}
                  </span>
                  {c.name && <span className="text-xs text-text-muted">— {c.name}</span>}
                  {isActive && (
                    <span className="rounded-full bg-[#818cf8]/20 px-1.5 py-0.5 text-[9px] text-[#818cf8]">Active</span>
                  )}
                  {isPast && (
                    <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-text-muted">Completed</span>
                  )}
                </div>

                {/* Progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">
                      {c.completedScopeCount} / {c.scopeCount} issues
                    </span>
                    <span className="text-[10px] text-[#818cf8]">{Math.round(c.progress * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-[#818cf8]"
                      style={{ width: `${c.progress * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                  <span>{new Date(c.startsAt).toLocaleDateString()}</span>
                  <span>→</span>
                  <span>{new Date(c.endsAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
