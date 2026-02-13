import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";

export function useCommand() {
  const addCommand = useStore((s) => s.addCommand);
  const addActivity = useStore((s) => s.addActivity);
  const commandHistory = useStore((s) => s.commandHistory);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const execute = useCallback(
    (command: string) => {
      const trimmed = command.trim();
      if (!trimmed) return;

      addCommand(trimmed);
      addActivity({
        type: "CMD",
        message: `> ${trimmed}`,
        source: "omni-prompt",
      });

      // Simulate command responses
      const lower = trimmed.toLowerCase();
      if (lower === "status") {
        addActivity({
          type: "SYSTEM",
          message: "System status: IDLE — All services nominal",
          source: "core",
        });
      } else if (lower === "help") {
        addActivity({
          type: "INFO",
          message:
            "Available: status, help, clear, projects, gauges",
          source: "core",
        });
      } else if (lower === "projects") {
        addActivity({
          type: "INFO",
          message: "6 projects loaded from Linear workspace",
          source: "linear",
        });
      } else if (lower === "gauges") {
        addActivity({
          type: "INFO",
          message:
            "Gemini: 847K/2M | Claude: 1.23M/5M | Mistral: 312K/1M",
          source: "monitoring",
        });
      } else {
        addActivity({
          type: "WARN",
          message: `Unknown command: "${trimmed}" — type "help" for available commands`,
          source: "core",
        });
      }

      setHistoryIndex(-1);
    },
    [addCommand, addActivity],
  );

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      if (commandHistory.length === 0) return "";

      let newIndex: number;
      if (direction === "up") {
        newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
      } else {
        newIndex =
          historyIndex === -1
            ? -1
            : Math.min(commandHistory.length - 1, historyIndex + 1);
      }

      setHistoryIndex(newIndex);
      return newIndex === -1
        ? ""
        : (commandHistory[newIndex]?.command ?? "");
    },
    [commandHistory, historyIndex],
  );

  return { execute, navigateHistory, commandHistory };
}
