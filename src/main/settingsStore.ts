import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  isAppSettingsShape,
} from "../shared/types";

/**
 * Minimal, dependency-free settings persistence.
 *
 * We deliberately did NOT reach for SQLite for this first milestone: the app
 * only persists a single small settings document (preferences, window
 * bounds, PRO Config profiles), which a validated JSON file handles well
 * without pulling in a native module that has to be rebuilt per Electron
 * version. If/when "recent activity" grows into something queryable, revisit
 * this with better-sqlite3 behind the same loadSettings/saveSettings
 * interface so callers don't need to change.
 */

const SETTINGS_FILE = "settings.json";

function settingsPath(): string {
  return path.join(app.getPath("userData"), SETTINGS_FILE);
}

function backupPath(): string {
  return path.join(app.getPath("userData"), `${SETTINGS_FILE}.bak`);
}

function mergeWithDefaults(partial: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    windowBounds: { ...DEFAULT_SETTINGS.windowBounds, ...partial.windowBounds },
    launchOptions: { ...DEFAULT_SETTINGS.launchOptions, ...partial.launchOptions },
    boosters: { ...DEFAULT_SETTINGS.boosters, ...partial.boosters },
    proConfigProfiles: Array.isArray(partial.proConfigProfiles)
      ? partial.proConfigProfiles
      : DEFAULT_SETTINGS.proConfigProfiles,
    recentActivity: Array.isArray(partial.recentActivity)
      ? partial.recentActivity
      : DEFAULT_SETTINGS.recentActivity,
  };
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(settingsPath(), "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (!isAppSettingsShape(parsed)) {
      throw new Error("settings.json did not contain an object");
    }
    return mergeWithDefaults(parsed);
  } catch (err) {
    // First launch (ENOENT) is expected and not an error worth logging loudly.
    const isMissing = (err as NodeJS.ErrnoException)?.code === "ENOENT";
    if (!isMissing) {
      console.warn("[settingsStore] Failed to read settings.json, falling back to defaults:", err);
      // Preserve the unreadable file for diagnostics instead of silently
      // overwriting it on the next save.
      try {
        await fs.copyFile(settingsPath(), backupPath());
      } catch {
        // Nothing to back up (file may genuinely not exist) — ignore.
      }
    }
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const dir = app.getPath("userData");
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${settingsPath()}.tmp`;
  const serialized = JSON.stringify(settings, null, 2);
  // Write to a temp file then rename, so a crash mid-write can never leave
  // settings.json half-written / corrupted.
  await fs.writeFile(tmpPath, serialized, "utf-8");
  await fs.rename(tmpPath, settingsPath());
}
