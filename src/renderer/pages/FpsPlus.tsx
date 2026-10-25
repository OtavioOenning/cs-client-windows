import { useEffect, useState } from "react";
import type { AppSettings } from "@shared/types";
import { Card } from "../components/ui";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 border-b border-surface-border last:border-0 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-zinc-100">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="app-no-drag mt-1 h-4 w-4 accent-accent"
      />
    </label>
  );
}

export function FpsPlus() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.csCompanion.settings.get().then(setSettings);
  }, []);

  async function persist(next: AppSettings) {
    setSettings(next);
    setSaving(true);
    await window.csCompanion.settings.set(next);
    setSaving(false);
  }

  if (!settings) return <div className="p-6 text-zinc-400">Loading…</div>;

  return (
    <div className="p-6 flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">FPS+</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Launch options and OS-level tweaks only — no process injection, no memory access, no
          anti-cheat interaction. Everything here is reverted automatically when CS2 closes or
          CS Companion exits.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-zinc-200 mb-1">Launch options</h2>
        <p className="text-xs text-zinc-500 mb-2">
          Applied when you launch through CS Companion. These map to standard, documented Steam
          launch options.
        </p>
        <Toggle
          label="Skip intro video (-novid)"
          description="Boots straight past the Valve splash video."
          checked={settings.launchOptions.skipIntro}
          onChange={(v) =>
            persist({ ...settings, launchOptions: { ...settings.launchOptions, skipIntro: v } })
          }
        />
        <Toggle
          label="High process priority (-high)"
          description="Asks Windows to schedule cs2.exe with a higher priority class."
          checked={settings.launchOptions.highPriority}
          onChange={(v) =>
            persist({
              ...settings,
              launchOptions: { ...settings.launchOptions, highPriority: v },
            })
          }
        />
        <Toggle
          label="Uncap FPS (+fps_max 0)"
          description="Removes the client-side frame-rate limiter."
          checked={settings.launchOptions.uncapFps}
          onChange={(v) =>
            persist({ ...settings, launchOptions: { ...settings.launchOptions, uncapFps: v } })
          }
        />
        <div className="mt-3">
          <label className="text-xs text-zinc-500 block mb-1">Custom launch arguments</label>
          <input
            className="app-no-drag w-full bg-surface-2 border border-surface-border rounded-lg px-3 py-2 text-sm font-mono text-zinc-100"
            placeholder="e.g. -w 1920 -h 1080"
            value={settings.launchOptions.customArgs}
            onChange={(e) =>
              persist({
                ...settings,
                launchOptions: { ...settings.launchOptions, customArgs: e.target.value },
              })
            }
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-zinc-200 mb-1">Boosters</h2>
        <p className="text-xs text-zinc-500 mb-2">
          System-level only. Reverted automatically — nothing here persists after you stop
          playing or close CS Companion.
        </p>
        <Toggle
          label="Boost cs2.exe priority while playing"
          description="Raises process priority shortly after launch, restored to normal on exit."
          checked={settings.boosters.processPriority}
          onChange={(v) =>
            persist({ ...settings, boosters: { ...settings.boosters, processPriority: v } })
          }
        />
        <Toggle
          label="Switch to High performance power plan"
          description="Temporarily activates Windows' High performance power plan; restores your previous plan afterward."
          checked={settings.boosters.highPerformancePowerPlan}
          onChange={(v) =>
            persist({
              ...settings,
              boosters: { ...settings.boosters, highPerformancePowerPlan: v },
            })
          }
        />
      </Card>

      {saving && <p className="text-xs text-zinc-500">Saving…</p>}
    </div>
  );
}
