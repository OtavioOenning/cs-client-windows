import { useEffect, useState } from "react";
import type { AppSettings, ProConfigProfile } from "@shared/types";
import { Card, Button } from "../components/ui";
import { createEmptyProfile, generateAutoexecCfg, sanitizeCrosshair, sanitizeViewmodel } from "../lib/cs2Config";

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="app-no-drag w-full accent-accent"
      />
    </div>
  );
}

export function ProConfig() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeProfile, setActiveProfile] = useState<ProConfigProfile | null>(null);
  const [exportResult, setExportResult] = useState<string | null>(null);

  useEffect(() => {
    window.csCompanion.settings.get().then((s) => {
      setSettings(s);
      const active = s.proConfigProfiles.find((p) => p.id === s.activeProfileId);
      if (active) {
        setActiveProfile(active);
      } else {
        const fresh = createEmptyProfile("My Config");
        setActiveProfile(fresh);
      }
    });
  }, []);

  async function persistProfile(next: ProConfigProfile) {
    if (!settings) return;
    const nextProfile = { ...next, updatedAt: new Date().toISOString() };
    setActiveProfile(nextProfile);
    const others = settings.proConfigProfiles.filter((p) => p.id !== nextProfile.id);
    const nextSettings: AppSettings = {
      ...settings,
      proConfigProfiles: [...others, nextProfile],
      activeProfileId: nextProfile.id,
    };
    setSettings(nextSettings);
    await window.csCompanion.settings.set(nextSettings);
  }

  function handleCopyConfig() {
    if (!activeProfile) return;
    const cfg = generateAutoexecCfg(activeProfile);
    navigator.clipboard.writeText(cfg).then(() => {
      setExportResult("Copied autoexec.cfg to clipboard.");
      setTimeout(() => setExportResult(null), 3000);
    });
  }

  if (!settings || !activeProfile) return <div className="p-6 text-zinc-400">Loading…</div>;

  const x = sanitizeCrosshair(activeProfile.crosshair);
  const v = sanitizeViewmodel(activeProfile.viewmodel);

  return (
    <div className="p-6 flex flex-col gap-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">PRO Config</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Build a crosshair and viewmodel profile, then export a real CS2{" "}
            <code className="font-mono text-xs bg-surface-2 px-1 py-0.5 rounded">
              autoexec.cfg
            </code>
            .
          </p>
        </div>
        <Button onClick={handleCopyConfig}>Copy config</Button>
      </div>

      {exportResult && <p className="text-xs text-state-success">{exportResult}</p>}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">Crosshair</h2>
          <Slider
            label="Style (cl_crosshairstyle)"
            value={x.style}
            min={0}
            max={5}
            onChange={(val) =>
              persistProfile({
                ...activeProfile,
                crosshair: { ...x, style: val as typeof x.style },
              })
            }
          />
          <Slider
            label="Size"
            value={x.size}
            min={0}
            max={10}
            step={0.1}
            onChange={(val) => persistProfile({ ...activeProfile, crosshair: { ...x, size: val } })}
          />
          <Slider
            label="Thickness"
            value={x.thickness}
            min={0}
            max={3}
            step={0.1}
            onChange={(val) =>
              persistProfile({ ...activeProfile, crosshair: { ...x, thickness: val } })
            }
          />
          <Slider
            label="Gap"
            value={x.gap}
            min={-5}
            max={10}
            step={0.1}
            onChange={(val) => persistProfile({ ...activeProfile, crosshair: { ...x, gap: val } })}
          />
          <div className="flex gap-3 mt-2">
            {(["colorR", "colorG", "colorB"] as const).map((channel) => (
              <div key={channel} className="flex-1">
                <Slider
                  label={channel.replace("color", "")}
                  value={x[channel]}
                  min={0}
                  max={255}
                  onChange={(val) =>
                    persistProfile({ ...activeProfile, crosshair: { ...x, [channel]: val } })
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">Viewmodel</h2>
          <Slider
            label="FOV (viewmodel_fov)"
            value={v.fov}
            min={54}
            max={90}
            onChange={(val) => persistProfile({ ...activeProfile, viewmodel: { ...v, fov: val } })}
          />
          <Slider
            label="Offset X"
            value={v.offsetX}
            min={-2}
            max={2.5}
            step={0.1}
            onChange={(val) =>
              persistProfile({ ...activeProfile, viewmodel: { ...v, offsetX: val } })
            }
          />
          <Slider
            label="Offset Y"
            value={v.offsetY}
            min={-2}
            max={2}
            step={0.1}
            onChange={(val) =>
              persistProfile({ ...activeProfile, viewmodel: { ...v, offsetY: val } })
            }
          />
          <Slider
            label="Offset Z"
            value={v.offsetZ}
            min={-2}
            max={2}
            step={0.1}
            onChange={(val) =>
              persistProfile({ ...activeProfile, viewmodel: { ...v, offsetZ: val } })
            }
          />
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-zinc-200 mb-2">Preview (autoexec.cfg)</h2>
        <pre className="bg-surface-2 border border-surface-border rounded-lg p-3 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre">
          {generateAutoexecCfg(activeProfile)}
        </pre>
      </Card>
    </div>
  );
}
