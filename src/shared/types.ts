/**
 * Shared contract between the main process and the renderer.
 *
 * Keep this file dependency-free (no Electron/Node imports) so it can be
 * imported from the renderer's browser-side bundle as well as from main.
 */

export const IPC = {
  SETTINGS_GET: "settings:get",
  SETTINGS_SET: "settings:set",
  GAME_DETECT: "game:detect",
  GAME_LAUNCH: "game:launch",
  GAME_STATUS_EVENT: "game:status", // main -> renderer push event
  APP_GET_VERSION: "app:getVersion",
  WINDOW_MINIMIZE: "window:minimize",
  WINDOW_MAXIMIZE_TOGGLE: "window:maximizeToggle",
  WINDOW_CLOSE: "window:close",
} as const;

export type AppTheme = "dark" | "midnight";

export interface WindowBounds {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export interface LaunchOptions {
  /** -novid: skip the Valve intro video */
  skipIntro: boolean;
  /** -high: request High priority class from Windows at process start */
  highPriority: boolean;
  /** +fps_max 0: uncap the client FPS limiter */
  uncapFps: boolean;
  /** Extra raw tokens the user typed themselves, split on whitespace */
  customArgs: string;
}

export interface Boosters {
  /** Re-apply High priority to the running cs2.exe process once detected */
  processPriority: boolean;
  /** Temporarily switch the active Windows power plan to High performance */
  highPerformancePowerPlan: boolean;
}

export interface CrosshairConfig {
  style: 0 | 1 | 2 | 3 | 4 | 5;
  size: number;
  thickness: number;
  gap: number;
  colorR: number;
  colorG: number;
  colorB: number;
  outline: boolean;
  dot: boolean;
  t: boolean; // cl_crosshair_t
}

export interface ViewmodelConfig {
  fov: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  presetPos: 0 | 1 | 2 | 3;
}

export interface ProConfigProfile {
  id: string;
  name: string;
  crosshair: CrosshairConfig;
  viewmodel: ViewmodelConfig;
  updatedAt: string; // ISO timestamp
}

export interface AppSettings {
  theme: AppTheme;
  windowBounds: WindowBounds;
  launchOptions: LaunchOptions;
  boosters: Boosters;
  proConfigProfiles: ProConfigProfile[];
  activeProfileId: string | null;
  cs2InstallPathOverride: string | null;
  recentActivity: RecentActivityEntry[];
}

export interface RecentActivityEntry {
  id: string;
  label: string;
  timestamp: string; // ISO
}

export type GameDetectionResult =
  | { found: true; installPath: string; exePath: string; source: "default" | "steam-library" | "override" }
  | { found: false; reason: string };

export type GameStatus = "idle" | "launching" | "running" | "error";

export interface GameStatusEvent {
  status: GameStatus;
  message?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  windowBounds: { width: 1280, height: 800 },
  launchOptions: {
    skipIntro: true,
    highPriority: false,
    uncapFps: true,
    customArgs: "",
  },
  boosters: {
    processPriority: false,
    highPerformancePowerPlan: false,
  },
  proConfigProfiles: [],
  activeProfileId: null,
  cs2InstallPathOverride: null,
  recentActivity: [],
};

/** Narrow, defensive check used before trusting anything read back from disk. */
export function isAppSettingsShape(value: unknown): value is Partial<AppSettings> {
  return typeof value === "object" && value !== null;
}
