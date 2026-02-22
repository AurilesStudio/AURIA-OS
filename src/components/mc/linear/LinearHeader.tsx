import { BarChart2, RefreshCw, Search, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { LinearTeam } from "@/lib/linearClient";

interface Props {
  teams: LinearTeam[];
  selectedTeam: LinearTeam | null;
  onSelectTeam: (team: LinearTeam) => void;
  search: string;
  onSearch: (v: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function LinearHeader({ teams, selectedTeam, onSelectTeam, search, onSearch, onRefresh, loading }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center gap-3 border-b border-white/5 px-6 py-3">
      <BarChart2 className="h-5 w-5 text-[#818cf8]" />

      <span className="text-sm font-semibold text-text-primary">Linear</span>

      {/* Team selector */}
      {teams.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-bg-base/50 px-2 py-1 text-xs text-text-primary hover:border-[#818cf8]/30 transition-colors"
          >
            {selectedTeam?.name ?? "Select team"}
            <ChevronDown className="h-3 w-3 text-text-muted" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 w-48 rounded-lg border border-white/10 bg-bg-surface shadow-xl">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { onSelectTeam(t); setDropdownOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors ${
                    selectedTeam?.id === t.id ? "text-[#818cf8]" : "text-text-primary"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search issues..."
          className="w-40 rounded-md border border-white/10 bg-bg-base/50 pl-7 pr-2 py-1 text-xs text-text-primary placeholder:text-text-muted/40 outline-none focus:border-[#818cf8]/50"
        />
      </div>

      <button
        onClick={onRefresh}
        className="rounded-md p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      </button>

      <div className={`h-2 w-2 rounded-full ${selectedTeam ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-gray-500"}`} />
    </div>
  );
}
