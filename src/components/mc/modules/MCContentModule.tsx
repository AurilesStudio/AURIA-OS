import { FileText } from "lucide-react";
import { useStore } from "@/store/useStore";

export function MCContentModule() {
  const count = useStore((s) => s.mcContentPipeline.length);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <FileText className="h-12 w-12 text-text-muted/30" />
      <h2 className="text-lg font-semibold text-text-primary">Content Pipeline</h2>
      <p className="text-sm text-text-muted">
        {count > 0 ? `${count} item${count > 1 ? "s" : ""}` : "No content yet"}
      </p>
      <p className="max-w-sm text-center text-xs text-text-muted/60">
        Manage your content from idea to publication across all platforms.
      </p>
    </div>
  );
}
