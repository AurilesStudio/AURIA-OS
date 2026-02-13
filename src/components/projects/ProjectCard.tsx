import { motion } from "framer-motion";
import { GlowCard } from "@/components/shared/GlowCard";
import { NeonProgress } from "@/components/shared/NeonProgress";
import { STATUS_COLORS } from "@/lib/constants";
import type { ProjectData, SystemStatus } from "@/types";
import { Folder } from "lucide-react";

interface ProjectCardProps {
  project: ProjectData;
  index: number;
}

const statusMap: Record<string, SystemStatus> = {
  "In Progress": "PROCESSING",
  Planned: "IDLE",
  Backlog: "IDLE",
  Done: "SUCCESS",
  Cancelled: "ERROR",
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const mappedStatus = statusMap[project.status] ?? "IDLE";
  const statusColor = STATUS_COLORS[mappedStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <GlowCard className="flex h-full flex-col gap-3" glowColor="purple">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-neon-purple" />
            <h3 className="text-sm font-semibold text-text-primary">
              {project.name}
            </h3>
          </div>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase"
            style={{
              color: statusColor,
              borderColor: `${statusColor}40`,
              backgroundColor: `${statusColor}10`,
            }}
          >
            {project.status}
          </span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          {project.description}
        </p>
        <div className="mt-auto">
          <div className="mb-1 flex justify-between text-[10px] text-text-muted">
            <span>{project.team}</span>
            <span>{project.progress}%</span>
          </div>
          <NeonProgress
            value={project.progress}
            max={100}
            color={statusColor}
          />
        </div>
      </GlowCard>
    </motion.div>
  );
}
