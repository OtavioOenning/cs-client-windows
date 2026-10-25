# Feature inventory — reference vs. this build

Research method: `web_fetch` of the reference's public, unauthenticated pages
(`/`, `/plans`) on 2026-10-24. I did not create an account, so anything
behind `/login` (the actual app UI, account dashboard, skin-raffle flow,
Steam-config import) was **not** inspected — only the marketing site's
description of those features was available. Nothing below is invented
beyond what those two pages state or strongly imply.

## What the reference (csclient.app) publicly shows

| Area | What the site says |
|---|---|
| FPS+ | "Boosters tied to CS Client, only active while CS2 is launched through it, fully reverted on exit/uninstall." Also benchmarking before/after FPS comparison, performance "profiles" (Current / Performance / Competitive). |
| PRO Config | Crosshair / viewmodel / video / HUD / radar / binds editor, importable from 600+ pro players and 120+ teams, multiple saved profiles, drag-and-drop config loading. |
| News | CS2 patch-note style articles. |
| Matches | Live scores, upcoming matches, per-map results, mini player, streaming widget. |
| Ranking | Valve/HLTV-style team ranking table with rosters. |
| Teams | Team pages. |
| Accounts | Sign in/up, one active session per account, Steam Trade URL linking for raffles, monthly skin raffle (Plus plan only), $10/mo or $8/mo-annual pricing. |
| Compatibility | States compatibility with FACEIT and Gamers Club matchmaking, and a "tweaks permitted by Valve's guidelines" / VAC-safe claim. |

## Implemented in this milestone

| Feature | Status | Notes |
|---|---|---|
| App shell: title bar, sidebar (Features/Resources grouping), routing | ✅ Implemented | Matches the reference's navigation grouping; original visual styling (not a pixel copy). |
| Settings persistence (theme, window bounds, prefs) | ✅ Implemented | JSON file in `userData`, atomic write, corruption-safe fallback. |
| CS2 install detection | ✅ Implemented, **untested on a real Windows machine** | Checks default Steam paths + `libraryfolders.vdf` + registry `SteamPath`. Needs validation on actual hardware. |
| FPS+ → launch options | ✅ Implemented | `-novid`, `-high`, `+fps_max 0`, custom args — all standard, documented Steam/CS2 launch options. |
| FPS+ → boosters | ✅ Implemented, **untested** | Process-priority bump via PowerShell, power-plan switch via `powercfg`, both reverted on exit. No benchmarking UI yet (the "before/after FPS" comparison from the reference is not built). |
| PRO Config → crosshair & viewmodel editor | ✅ Implemented | Generates a real, loadable `autoexec.cfg` using documented client-side convars. |
| PRO Config → pro-player config import (600+ players, 120+ teams) | ❌ Not implemented | **Requires private infrastructure.** The reference's pro-config library is proprietary data csclient.app curates; there's no public, documented API for it. Would need either a licensed data source or manually curated, attributed config data. |
| PRO Config → video/HUD/radar/binds tabs | ⏳ Partial | Only crosshair + viewmodel built this milestone; same pattern extends to the rest. |
| News | ❌ Not implemented | **Requires an external service.** No real CS2 news API is wired up; page is an honest empty state rather than fabricated articles. |
| Matches / live scores / mini player / streaming | ❌ Not implemented | **Requires an external service.** Live esports data (e.g. an HLTV-equivalent) isn't publicly/freely available with a documented API; would need a licensed data provider. |
| Ranking | ❌ Not implemented | Same blocker as Matches — needs a real ranking data source. |
| Teams | ❌ Not implemented | Same blocker. |
| Accounts / sign-in / subscriptions / skin raffles | ❌ Not implemented, **intentionally** | No real backend exists for this independent build. Per the brief: never fake login, payments, or raffles without a real backend. |
| Windows installer | ⏳ Config + CI pipeline ready, **not yet built or tested by me** | `electron-builder.yml`, `build/icon.ico`, `.github/workflows/build-windows.yml`, and `scripts/build-windows.ps1/.bat` are all in place. Actually producing and testing the `.exe` needs a real Windows machine with network access (confirmed absent here — see README), so it has to run on GitHub Actions or the user's own Windows PC. |

## Categorization

- **Independently implementable (done or in progress):** app shell, settings, CS2 detection, launch options, OS-level boosters, crosshair/viewmodel config export.
- **Requires an external service (not implemented, no fake data shown):** News, Matches, Ranking, Teams, benchmarking telemetry.
- **Requires the original app's private infrastructure (not implementable independently without a new data source):** the curated pro-player/team config library, skin raffles, cross-device account sessions.
