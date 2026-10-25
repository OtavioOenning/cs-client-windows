import { app, BrowserWindow, session, shell } from "electron";
import path from "node:path";
import { loadSettings, saveSettings } from "./settingsStore";
import { registerIpcHandlers, onGameSessionEnded } from "./ipc";

const isDev = process.argv.includes("--dev");

// Single-instance lock MUST be requested before any other app setup: if this
// is a second launch, we quit immediately rather than racing to create a
// second window and apply a second set of (conflicting) boosters.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

async function createMainWindow(): Promise<void> {
  const settings = await loadSettings();

  mainWindow = new BrowserWindow({
    width: settings.windowBounds.width,
    height: settings.windowBounds.height,
    x: settings.windowBounds.x,
    y: settings.windowBounds.y,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#09090b",
    frame: false, // custom title bar is drawn in the renderer
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
    },
  });

  // Enforce a strict CSP at the session level too (belt-and-suspenders with
  // the <meta> tag in index.html), and block any navigation away from our
  // own bundled renderer.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';",
        ],
      },
    });
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Any target="_blank" / window.open from the renderer opens in the
    // user's default browser instead of a new, less-restricted Electron
    // window.
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const isOwnApp = url.startsWith("file://") || url.startsWith("http://localhost:5173");
    if (!isOwnApp) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (isDev) {
    await mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    await mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  let saveBoundsTimeout: NodeJS.Timeout | null = null;
  const persistBounds = () => {
    if (!mainWindow) return;
    if (saveBoundsTimeout) clearTimeout(saveBoundsTimeout);
    saveBoundsTimeout = setTimeout(async () => {
      const bounds = mainWindow?.getBounds();
      if (!bounds) return;
      const current = await loadSettings();
      await saveSettings({ ...current, windowBounds: bounds });
    }, 400); // debounce resize/move spam
  };
  mainWindow.on("resize", persistBounds);
  mainWindow.on("move", persistBounds);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

if (gotLock) {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerIpcHandlers(getMainWindow);
    void createMainWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) void createMainWindow();
    });
  });

  app.on("window-all-closed", () => {
    void onGameSessionEnded();
    if (process.platform !== "darwin") app.quit();
  });

  app.on("before-quit", () => {
    void onGameSessionEnded();
  });
}
