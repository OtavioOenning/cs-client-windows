import { promises as fs } from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { GameDetectionResult } from "../shared/types";

const execAsync = promisify(exec);

// CS2 replaced CS:GO in place and kept the original Steam folder/app names.
const CS2_APP_ID = "730";
const CS2_FOLDER_NAME = "Counter-Strike Global Offensive";
const CS2_EXE_NAME = "cs2.exe";

const DEFAULT_STEAM_PATHS = [
  "C:\\Program Files (x86)\\Steam",
  "C:\\Program Files\\Steam",
];

/**
 * Reads the Steam install path from the registry on a best-effort basis.
 * This only ever READS a single, well-known Valve registry value — it does
 * not scan the registry broadly and does not touch any other application's
 * keys.
 */
async function readSteamPathFromRegistry(): Promise<string | null> {
  if (process.platform !== "win32") return null;
  try {
    const { stdout } = await execAsync(
      'reg query "HKEY_CURRENT_USER\\Software\\Valve\\Steam" /v SteamPath'
    );
    const match = stdout.match(/SteamPath\s+REG_SZ\s+(.+)/i);
    if (match?.[1]) {
      return match[1].trim().replace(/\//g, "\\");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Steam can split its library across multiple drives. The set of library
 * roots is recorded in steamapps/libraryfolders.vdf (plain text, Valve's KV
 * format). We only look for quoted path-like strings — no VDF parser
 * dependency required for this.
 */
async function readLibraryFolders(steamPath: string): Promise<string[]> {
  const vdfPath = path.join(steamPath, "steamapps", "libraryfolders.vdf");
  try {
    const raw = await fs.readFile(vdfPath, "utf-8");
    const matches = [...raw.matchAll(/"path"\s*"([^"]+)"/gi)];
    return matches.map((m) => m[1].replace(/\\\\/g, "\\"));
  } catch {
    return [];
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function detectCs2Installation(
  overridePath: string | null
): Promise<GameDetectionResult> {
  if (overridePath) {
    const exePath = path.join(overridePath, CS2_EXE_NAME);
    if (await pathExists(exePath)) {
      return { found: true, installPath: overridePath, exePath, source: "override" };
    }
    return {
      found: false,
      reason: `No ${CS2_EXE_NAME} found at the configured override path: ${overridePath}`,
    };
  }

  const steamRoots = new Set<string>(DEFAULT_STEAM_PATHS);
  const registryPath = await readSteamPathFromRegistry();
  if (registryPath) steamRoots.add(registryPath);

  const candidateLibraryRoots = new Set<string>();
  for (const steamRoot of steamRoots) {
    candidateLibraryRoots.add(steamRoot);
    const libs = await readLibraryFolders(steamRoot);
    for (const lib of libs) candidateLibraryRoots.add(lib);
  }

  for (const root of candidateLibraryRoots) {
    const installPath = path.join(root, "steamapps", "common", CS2_FOLDER_NAME);
    const exePath = path.join(installPath, "game", "bin", "win64", CS2_EXE_NAME);
    const altExePath = path.join(installPath, CS2_EXE_NAME); // defensive fallback
    if (await pathExists(exePath)) {
      return { found: true, installPath, exePath, source: "steam-library" };
    }
    if (await pathExists(altExePath)) {
      return { found: true, installPath, exePath: altExePath, source: "steam-library" };
    }
  }

  return {
    found: false,
    reason:
      "Could not find a CS2 installation under any detected Steam library. " +
      "If Steam is installed in a non-default location, set a manual path in Settings.",
  };
}

export function buildSteamLaunchUri(extraArgs: string[]): string {
  // steam://run/<appid>//<args> launches through the user's existing Steam
  // client/session — we never touch Steam credentials or its process memory.
  const argString = extraArgs.filter(Boolean).join(" ");
  return `steam://run/${CS2_APP_ID}//${encodeURIComponent(argString)}`;
}
