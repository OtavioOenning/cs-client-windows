import { useEffect, useState } from "react";
import type { GameDetectionResult, GameStatus } from "@shared/types";
import { Card, Button, Badge } from "../components/ui";

export function Home() {
  const [detection, setDetection] = useState<GameDetectionResult | null>(null);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    window.csCompanion.game.detect().then((result) => {
      if (!cancelled) {
        setDetection(result);
        setChecking(false);
      }
    });
    const unsubscribe = window.csCompanion.game.onStatus((event) => {
      setStatus(event.status);
      setStatusMessage(event.message);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  async function handleLaunch() {
    setStatus("launching");
    const result = await window.csCompanion.game.launch();
    if (!result.ok) {
      setStatus("error");
      setStatusMessage(result.reason);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-4 max-w-3xl">
      <h1 className="text-2xl font-semibold text-zinc-100">Home</h1>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-zinc-100">Counter-Strike 2</h2>
            {checking && <p className="text-sm text-zinc-400 mt-1">Checking installation…</p>}
            {!checking && detection?.found && (
              <p className="text-sm text-zinc-400 mt-1 font-mono truncate max-w-md">
                {detection.installPath}
              </p>
            )}
            {!checking && detection && !detection.found && (
              <p className="text-sm text-zinc-400 mt-1">{detection.reason}</p>
            )}
          </div>
          <Badge tone={detection?.found ? "success" : "warning"}>
            {checking ? "Checking" : detection?.found ? "Detected" : "Not found"}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleLaunch} disabled={!detection?.found || status === "launching"}>
            {status === "launching" ? "Launching…" : "Launch CS2"}
          </Button>
          {status === "error" && statusMessage && (
            <span className="text-sm text-state-danger">{statusMessage}</span>
          )}
          {status === "running" && statusMessage && (
            <span className="text-sm text-state-success">{statusMessage}</span>
          )}
        </div>

        {!detection?.found && !checking && (
          <p className="text-xs text-zinc-500 mt-3">
            If CS2 is installed somewhere non-default, set a manual install path in Settings.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="font-medium text-zinc-100 mb-1">About this build</h2>
        <p className="text-sm text-zinc-400">
          This is an early, independently implemented milestone inspired by csclient.app's
          layout and feature set. News, Matches, Ranking and Teams are not wired to a live data
          source yet — see Settings → About for the full status.
        </p>
      </Card>
    </div>
  );
}
