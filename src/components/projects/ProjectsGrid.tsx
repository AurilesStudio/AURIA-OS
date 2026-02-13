import { useStore } from "@/store/useStore";
import { ProjectCard } from "./ProjectCard";
import { LayoutGrid } from "lucide-react";

export function ProjectsGrid() {
  const projects = useStore((s) => s.projects);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <LayoutGrid className="h-4 w-4 text-neon-pink" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Projects
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
