@echo off
REM Double-click this file to build the Windows installer.
REM Requires Node.js 20.x installed (https://nodejs.org).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-windows.ps1"
pause
