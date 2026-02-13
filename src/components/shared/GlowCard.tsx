import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "red" | "purple" | "pink";
}

export function GlowCard({
  children,
  className,
  glowColor,
}: GlowCardProps) {
  const glowClass = glowColor
    ? {
        red: "hover:glow-red",
        purple: "hover:glow-purple",
        pink: "hover:glow-pink",
      }[glowColor]
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-lg border border-white/5 bg-bg-surface p-4 transition-shadow duration-300",
        glowClass,
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
