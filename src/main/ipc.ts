import { app, ipcMain, shell, BrowserWindow } from "electron";
import { IPC, AppSettings, GameStatusEvent } from "../shared/types";
import { loadSettings, saveSettings } from "./settingsStore";
import { detectCs2Installation, buildSteamLaunchUri } from "./gameDetection";
import { applyBoosters, revertBoosters, raiseCs2ProcessPriority } from "./boosters";

let cachedSettings: AppSettings | null = null;

function broadcastGameStatus(win: BrowserWindow, event: GameStatusEvent): void {
  win.webContents.send(IPC.GAME_STATUS_EVENT, event);
}

export function registerIpcHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC.SETTINGS_GET, async () => {
    if (!cachedSettings) cachedSettings = await loadSettings();
    return cachedSettings;
  });

  ipcMain.handle(IPC.SETTINGS_SET, async (_event, nextSettings: unknown) => {
    // Never trust renderer input blindly: re-merge through loadSettings'
    // defaulting path by round-tripping through JSON, so unexpected shapes
    // from a compromised/old renderer can't write arbitrary keys to disk.
    if (typeof nextSettings !== "object" || nextSettings === null) {
      throw new Error("Invalid settings payload");
    }
    cachedSettings = nextSettings as AppSettings;
    await saveSettings(cachedSettings);
    return cachedSettings;
  });

  ipcMain.handle(IPC.GAME_DETECT, async () => {
    const settings = cachedSettings ?? (await loadSettings());
    return detectCs2Installation(settings.cs2InstallPathOverride);
  });

  ipcMain.handle(IPC.GAME_LAUNCH, async () => {
    const win = getMainWindow();
    const settings = cachedSettings ?? (await loadSettings());
    const detection = await detectCs2Installation(settings.cs2InstallPathOverride);

    if (!detection.found) {
      if (win) broadcastGameStatus(win, { status: "error", message: detection.reason });
      return { ok: false, reason: detection.reason };
    }

    const args: string[] = [];
    if (settings.launchOptions.skipIntro) args.push("-novid");
    if (settings.launchOptions.highPriority) args.push("-high");
    if (settings.launchOptions.uncapFps) args.push("+fps_max 0");
    if (settings.launchOptions.customArgs.trim()) {
      args.push(settings.launchOptions.customArgs.trim());
    }

    try {
      if (win) broadcastGameStatus(win, { status: "launching" });
      await applyBoosters(settings.boosters);
      await shell.openExternal(buildSteamLaunchUri(args));

      if (settings.boosters.processPriority) {
        // Give Steam a moment to actually spawn cs2.exe before we look for it.
        setTimeout(() => {
          raiseCs2ProcessPriority().then((raised) => {
            if (win) {
              broadcastGameStatus(win, {
                status: "running",
                message: raised ? "Priority boosted" : "Launched (priority boost skipped: process not found yet)",
              });
            }
          });
        }, 8000);
      } else if (win) {
        broadcastGameStatus(win, { status: "running" });
      }

      return { ok: true };
    } catch (err) {
      await revertBoosters();
      const message = err instanceof Error ? err.message : "Unknown launch error";
      if (win) broadcastGameStatus(win, { status: "error", message });
      return { ok: false, reason: message };
    }
  });

  ipcMain.handle(IPC.APP_GET_VERSION, () => {
    // app.getVersion() reads the packaged app's real version (from
    // package.json via electron-builder), unlike process.env.npm_package_version
    // which is only ever set when a script is run through `npm run ...` and
    // would silently be undefined in the installed, double-clicked app.
    return app.getVersion();
  });

  // Window chrome controls — needed because the main window is created with
  // frame: false and the title bar is drawn by the renderer.
  ipcMain.on(IPC.WINDOW_MINIMIZE, () => getMainWindow()?.minimize());
  ipcMain.on(IPC.WINDOW_MAXIMIZE_TOGGLE, () => {
    const win = getMainWindow();
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on(IPC.WINDOW_CLOSE, () => getMainWindow()?.close());
}

/** Call when the game window / process is confirmed gone, to restore OS state. */
export async function onGameSessionEnded(): Promise<void> {
  await revertBoosters();
}
