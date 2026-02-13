import { motion } from "framer-motion";
import { GlowCard } from "@/components/shared/GlowCard";
import { useActivityStream } from "@/hooks/useActivityStream";
import { GitPullRequest, TestTube, ListChecks } from "lucide-react";

const actions = [
  {
    label: "Git Pull & Restart",
    icon: GitPullRequest,
    color: "#ff003c",
    action: "git-pull",
  },
  {
    label: "Run Tests",
    icon: TestTube,
    color: "#bf00ff",
    action: "run-tests",
  },
  {
    label: "Check Linear HP",
    icon: ListChecks,
    color: "#ff2d7a",
    action: "check-linear",
  },
] as const;

export function QuickActions() {
  const { log } = useActivityStream();

  const handleAction = (action: string, label: string) => {
    log("CMD", `Quick action: ${label}`, "quick-actions");
    if (action === "git-pull") {
      log("INFO", "Pulling latest from all repos...", "git");
      setTimeout(() => log("INFO", "All repos up to date", "git"), 1200);
    } else if (action === "run-tests") {
      log("INFO", "Running test suite across projects...", "ci");
      setTimeout(() => log("INFO", "Tests passed: 42/42", "ci"), 2000);
    } else if (action === "check-linear") {
      log("INFO", "Fetching Linear homepage metrics...", "linear");
      setTimeout(
        () => log("INFO", "Linear: 12 issues open, 3 in progress", "linear"),
        800,
      );
    }
  };

  return (
    <GlowCard>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Quick Actions
      </h2>
      <div className="flex flex-col gap-2">
        {actions.map(({ label, icon: Icon, color, action }, i) => (
          <motion.button
            key={action}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            onClick={() => handleAction(action, label)}
            className="flex items-center gap-2 rounded-md border border-white/5 bg-bg-elevated px-3 py-2 text-left text-xs transition-all hover:border-white/10"
            style={{ color }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </motion.button>
        ))}
      </div>
    </GlowCard>
  );
}
