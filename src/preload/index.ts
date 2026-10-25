import { contextBridge, ipcRenderer } from "electron";
import { IPC, AppSettings, GameStatusEvent, GameDetectionResult } from "../shared/types";

/**
 * This is the ONLY place Node/Electron APIs are reachable from. Everything
 * exposed here is a narrow, purpose-built function — never raw ipcRenderer,
 * never fs, never require(). contextIsolation + sandbox in main/index.ts
 * mean the renderer cannot reach any of this unless we deliberately expose
 * it here.
 */
const api = {
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.SETTINGS_GET),
    set: (next: AppSettings): Promise<AppSettings> => ipcRenderer.invoke(IPC.SETTINGS_SET, next),
  },
  game: {
    detect: (): Promise<GameDetectionResult> => ipcRenderer.invoke(IPC.GAME_DETECT),
    launch: (): Promise<{ ok: boolean; reason?: string }> => ipcRenderer.invoke(IPC.GAME_LAUNCH),
    onStatus: (callback: (event: GameStatusEvent) => void): (() => void) => {
      const listener = (_event: unknown, payload: GameStatusEvent) => callback(payload);
      ipcRenderer.on(IPC.GAME_STATUS_EVENT, listener);
      return () => ipcRenderer.removeListener(IPC.GAME_STATUS_EVENT, listener);
    },
  },
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke(IPC.APP_GET_VERSION),
  },
  windowControls: {
    minimize: (): void => ipcRenderer.send(IPC.WINDOW_MINIMIZE),
    maximizeToggle: (): void => ipcRenderer.send(IPC.WINDOW_MAXIMIZE_TOGGLE),
    close: (): void => ipcRenderer.send(IPC.WINDOW_CLOSE),
  },
};

export type CsCompanionApi = typeof api;

contextBridge.exposeInMainWorld("csCompanion", api);
