@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Voor lokaal starten is Node.js nodig. Spelers op de gepubliceerde website hebben dit niet nodig.
  pause
  exit /b 1
)
if not exist "dist\index.html" (
  echo De build ontbreekt. Voer eerst npm ci en npm run build uit.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:5175"
node scripts/serve.mjs
pause
