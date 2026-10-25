import { useEffect, useState } from "react";
import type { AppSettings } from "@shared/types";
import { Card, Button } from "../components/ui";

export function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [version, setVersion] = useState("");
  const [pathInput, setPathInput] = useState("");

  useEffect(() => {
    window.csCompanion.settings.get().then((s) => {
      setSettings(s);
      setPathInput(s.cs2InstallPathOverride ?? "");
    });
    window.csCompanion.app.getVersion().then(setVersion);
  }, []);

  async function savePathOverride() {
    if (!settings) return;
    const next = { ...settings, cs2InstallPathOverride: pathInput.trim() || null };
    setSettings(next);
    await window.csCompanion.settings.set(next);
  }

  if (!settings) return <div className="p-6 text-zinc-400">Loading…</div>;

  return (
    <div className="p-6 flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-100">Settings</h1>

      <Card>
        <h2 className="text-sm font-semibold text-zinc-200 mb-2">CS2 installation</h2>
        <p className="text-xs text-zinc-500 mb-2">
          Only needed if automatic detection (default Steam paths + libraryfolders.vdf) can't
          find your install.
        </p>
        <div className="flex gap-2">
          <input
            className="app-no-drag flex-1 bg-surface-2 border border-surface-border rounded-lg px-3 py-2 text-sm font-mono text-zinc-100"
            placeholder="D:\SteamLibrary\steamapps\common\Counter-Strike Global Offensive"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
          />
          <Button variant="secondary" onClick={savePathOverride}>
            Save
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-zinc-200 mb-2">About &amp; current limitations</h2>
        <p className="text-xs text-zinc-500 mb-2">CS Companion v{version || "0.1.0"}</p>
        <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
          <li>News, Matches, Ranking and Teams need a live esports data integration — not connected in this build.</li>
          <li>FPS+ boosters are OS-level (priority class, power plan) only — no process memory access.</li>
          <li>PRO Config exports a real autoexec.cfg; it does not sync pro-player configs from any external source yet.</li>
          <li>Accounts, cloud sync, and skin raffles are not implemented — there is no backend for them.</li>
        </ul>
      </Card>

      <p className="text-[11px] text-zinc-600">
        Independently implemented. Not affiliated with Valve Corp. or csclient.app.
      </p>
    </div>
  );
}
