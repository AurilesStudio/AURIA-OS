// ── Zone Theme Definitions ───────────────────────────────────────────
// Subtle atmospheric identity per project zone.
// Philosophy: dark space base, each zone gets a *hint* of colour — not a makeover.

export interface ZoneTheme {
  projectId: string;
  /** Very faint ground tint */
  groundColor: string;
  /** Ground opacity — kept very low for subtlety */
  groundOpacity: number;
  /** Soft point-light colour */
  lightColor: string;
  /** Light intensity — gentle ambiance only */
  lightIntensity: number;
  /** Neon accent for zone border */
  accentColor: string;
  /** Zone particle / atmosphere tint */
  atmosphereColor: string;
  /** Decoration category */
  decoType: "desert" | "cyber" | "ocean" | "forest" | "arena";
}

export const ZONE_THEMES: ZoneTheme[] = [
  {
    // Arena — warm orange hint
    projectId: "project-5",
    groundColor: "#2a1508",
    groundOpacity: 0.25,
    lightColor: "#ff8844",
    lightIntensity: 0.6,
    accentColor: "#ff4400",
    atmosphereColor: "#ff6622",
    decoType: "arena",
  },
  {
    // SAAS — desert gold hint
    projectId: "project-1",
    groundColor: "#1f1508",
    groundOpacity: 0.2,
    lightColor: "#cc9944",
    lightIntensity: 0.5,
    accentColor: "#cc8833",
    atmosphereColor: "#ddaa44",
    decoType: "desert",
  },
  {
    // Trading — cold cyan hint
    projectId: "project-2",
    groundColor: "#060d14",
    groundOpacity: 0.3,
    lightColor: "#0088aa",
    lightIntensity: 0.6,
    accentColor: "#00aacc",
    atmosphereColor: "#00ccee",
    decoType: "cyber",
  },
  {
    // Prospectauri — ocean teal hint
    projectId: "project-3",
    groundColor: "#081a1a",
    groundOpacity: 0.2,
    lightColor: "#008877",
    lightIntensity: 0.5,
    accentColor: "#00aa99",
    atmosphereColor: "#00ccbb",
    decoType: "ocean",
  },
  {
    // PM — forest green hint
    projectId: "project-4",
    groundColor: "#0a140a",
    groundOpacity: 0.25,
    lightColor: "#338844",
    lightIntensity: 0.5,
    accentColor: "#33aa55",
    atmosphereColor: "#44cc66",
    decoType: "forest",
  },
];

export function getThemeForProject(projectId: string): ZoneTheme | undefined {
  return ZONE_THEMES.find((t) => t.projectId === projectId);
}
