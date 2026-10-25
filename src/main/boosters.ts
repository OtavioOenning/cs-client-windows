import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Boosters } from "../shared/types";

const execAsync = promisify(exec);

/**
 * Everything here is a standard, Windows-sanctioned tweak that any
 * "game booster" utility (and Windows' own Game Mode) performs: raising the
 * foreground game's process priority, and switching the active power plan
 * while playing. None of this reads or writes CS2's memory, hooks its
 * process, or touches anti-cheat — it only talks to the OS scheduler and
 * power subsystem, and every change is reverted on exit.
 */

let previousPowerSchemeGuid: string | null = null;

async function getActivePowerScheme(): Promise<string | null> {
  try {
    const { stdout } = await execAsync("powercfg /GETACTIVESCHEME");
    const match = stdout.match(/GUID:\s*([0-9a-fA-F-]{36})/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

const HIGH_PERFORMANCE_GUID = "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c";

export async function applyBoosters(enabled: Boosters): Promise<void> {
  if (process.platform !== "win32") return;

  if (enabled.highPerformancePowerPlan) {
    previousPowerSchemeGuid = await getActivePowerScheme();
    try {
      await execAsync(`powercfg /SETACTIVE ${HIGH_PERFORMANCE_GUID}`);
    } catch (err) {
      console.warn("[boosters] Could not switch power plan:", err);
    }
  }
}

export async function revertBoosters(): Promise<void> {
  if (process.platform !== "win32") return;

  if (previousPowerSchemeGuid) {
    try {
      await execAsync(`powercfg /SETACTIVE ${previousPowerSchemeGuid}`);
    } catch (err) {
      console.warn("[boosters] Could not restore previous power plan:", err);
    } finally {
      previousPowerSchemeGuid = null;
    }
  }
}

/**
 * Raises cs2.exe's process priority once it appears. Polls briefly after
 * launch rather than assuming an exact PID, since the launch goes through
 * steam:// and we don't get a direct child process handle.
 */
export async function raiseCs2ProcessPriority(): Promise<boolean> {
  if (process.platform !== "win32") return false;
  try {
    const { stdout } = await execAsync(
      'powershell -NoProfile -Command "(Get-Process -Name cs2 -ErrorAction SilentlyContinue).Id"'
    );
    const pid = stdout.trim().split(/\s+/)[0];
    if (!pid) return false;
    await execAsync(
      `powershell -NoProfile -Command "(Get-Process -Id ${pid}).PriorityClass = 'High'"`
    );
    return true;
  } catch (err) {
    console.warn("[boosters] Could not raise cs2.exe priority:", err);
    return false;
  }
}
