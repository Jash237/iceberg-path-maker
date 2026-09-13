---
name: run-iceberg-tracker
description: Build, run, and drive the Iceberg Tracker web app. Use when asked to start the app, run its tests, build it, take a screenshot of the UI, or interact with the running application.
---

Iceberg Tracker is a React + Vite web application for Antarctic navigation, featuring interactive map-based iceberg tracking, route planning, and trajectory prediction. Start the Vite dev server then drive it via the Playwright-based driver script at `.claude/skills/run-iceberg-tracker/driver.mjs`.

All paths below are relative to `iceberg-tracker/`.

## Prerequisites

Node.js runtime (already available in this environment).

Playwright with Chromium browser (installed in devDependencies):

```bash
npm install
```

## Setup

Install dependencies:

```bash
npm install
```

## Build

Development mode (start dev server):

```bash
npm run dev
```

The dev server runs on `http://localhost:5173` by default.

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Run (agent path)

**Start the dev server in the background:**

```bash
npm run dev &
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
```

**Run the driver script to interact with the app:**

```bash
node .claude/skills/run-iceberg-tracker/driver.mjs
```

The driver launches a headless Chromium browser via Playwright and executes a complete test flow:
1. Navigates to the app and verifies the main UI loads (title, map, sidebar)
2. Selects a destination preset (Port Lockroy)
3. Clicks an iceberg card in the sidebar to view detailed predictions
4. Selects an alternative route from the Route Planning panel
5. Tests "Add Iceberg" mode by clicking the toolbar button and placing a new iceberg on the map
6. Triggers the "Refresh Live Data" button in the Data Feed Manager
7. Captures console errors (if any)

**Screenshots are saved to:**

`.claude/skills/run-iceberg-tracker/screenshots/`

- `01-initial-view.png` - App loaded with map and icebergs
- `02-port-lockroy-destination.png` - Destination selected with route displayed
- `03-iceberg-detail.png` - Iceberg detail panel with prediction table
- `04-new-iceberg-added.png` - New iceberg added to map
- `latest.png` - Symlink/copy of the most recent screenshot

**Stop the dev server:**

On Linux/macOS:
```bash
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill
```

On Windows:
```bash
powershell -Command "Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }"
```

## Run (human path)

```bash
npm run dev   # Opens dev server at http://localhost:5173
```

Open `http://localhost:5173` in a browser. Press `Ctrl+C` to stop.

## Test

No test suite is configured. The driver script serves as a smoke test.

```bash
npm run lint   # Run oxlint linter
```

---

## Gotchas

- **Sidebar scroll issues in Playwright**: The `.sidebar` has `overflow-y: auto`, and Playwright's auto-scroll doesn't always work reliably for elements inside scrollable containers. The driver uses `page.evaluate()` to directly call `.click()` on elements in the sidebar (iceberg cards, route cards, refresh button) rather than Playwright's `.click()` method. This avoids "element is outside of the viewport" errors.

- **Duplicate button selectors**: Some buttons (like "Port Lockroy") appear in multiple sections (Quick Destinations grid and Route Planning presets). Use more specific selectors like `.btn-preset-small` vs `.btn-preset` to target the correct one.

- **Map click coordinates**: When adding an iceberg via "Add Iceberg" mode, clicking the `.tracker-map` element's bounding box center works reliably. The Leaflet map converts browser coordinates to geographic coordinates automatically.

- **Route recalculation on state change**: The app recalculates routes whenever the ship position, destination, or icebergs change. This happens automatically via useEffect hooks in the AppContext. Wait briefly after clicking elements to allow React state updates to complete.

## Troubleshooting

- **Dev server fails to start with `EADDRINUSE`**: Port 5173 is already in use. Kill the existing process with `lsof -ti:5173 -sTCP:LISTEN | xargs -r kill` before restarting.

- **Playwright "Browser closed unexpectedly"**: This can happen if Chromium runs out of memory or crashes. The driver launches with `--no-sandbox --disable-setuid-sandbox` flags which work on most systems. On Windows, ensure no antivirus is blocking the Chromium process.

- **Screenshots show blank map tiles**: The app uses OpenStreetMap tiles from `https://tile.openstreetmap.org/`. If running in an offline environment, tiles won't load (but the app UI will still render). This doesn't affect functionality, only the map background.

- **"Cannot find module 'playwright'"**: Run `npm install` to install Playwright as a devDependency. Then run `npx playwright install chromium` to download the Chromium browser binary.
