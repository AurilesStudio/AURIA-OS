import type { LinearProject } from "@/lib/linearClient";

interface Props {
  projects: LinearProject[];
}

const stateColors: Record<string, string> = {
  planned: "text-blue-400",
  started: "text-amber-400",
  paused: "text-gray-400",
  completed: "text-emerald-400",
  cancelled: "text-red-400",
  canceled: "text-red-400",
};

export function LinearProjectList({ projects }: Props) {
  return (
    <div className="p-4">
      <span className="text-[10px] uppercase text-text-muted tracking-wider">Projects</span>

      {projects.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">No projects found</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary truncate">{p.name}</span>
                <span className={`text-[10px] capitalize ${stateColors[p.state] ?? "text-text-muted"}`}>
                  {p.state}
                </span>
              </div>

              {p.description && (
                <p className="text-xs text-text-muted line-clamp-2">{p.description}</p>
              )}

              {/* Progress bar */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">Progress</span>
                  <span className="text-[10px] text-[#818cf8]">{Math.round(p.progress * 100)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[#818cf8]"
                    style={{ width: `${p.progress * 100}%` }}
                  />
                </div>
              </div>

              {p.startDate && (
                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                  <span>{new Date(p.startDate).toLocaleDateString()}</span>
                  {p.targetDate && (
                    <>
                      <span>→</span>
                      <span>{new Date(p.targetDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
