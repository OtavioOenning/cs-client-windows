# Builds the CS Companion Windows installer end-to-end.
# Run from an elevated or normal PowerShell prompt, from anywhere:
#   powershell -ExecutionPolicy Bypass -File scripts\build-windows.ps1
#
# Requires: Node.js 20.x (https://nodejs.org) installed on THIS machine.
# Nothing here is required on the machine that later installs/runs the
# packaged app — electron-builder produces a self-contained .exe.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Step($name, $scriptBlock) {
    Write-Host ""
    Write-Host "==> $name" -ForegroundColor Cyan
    & $scriptBlock
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
        Write-Host "FAILED: $name (exit code $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "Node.js was not found on PATH. Install Node 20.x from https://nodejs.org and re-run this script." -ForegroundColor Red
    exit 1
}
Write-Host "Using $(node -v) / npm $(npm -v)"

Step "Install dependencies (npm ci)" { npm ci }
Step "Type-check" { npm run typecheck }
Step "Unit tests" { npm test }
Step "Build renderer + main/preload" { npm run build }
Step "Package Windows installer (NSIS + portable)" { npm run build:win }

Write-Host ""
Write-Host "Done. Installer(s) should be in .\release\:" -ForegroundColor Green
Get-ChildItem -Path "$root\release" -Filter "*.exe" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  $($_.FullName)"
}
