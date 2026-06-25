# AGENTS.md — Hotel Linen Ops

## Quick Start

```bash
bun install
bun run dev       # dev server at localhost:3000
bun run build     # static build to dist/
```

## Architecture

**Frontend only** — all state persisted in localStorage. No backend, no database, no Docker.

```
frontend/
  App.tsx                    # Routes + StorageProvider wrapper
  main.tsx                   # React entry
  MapStage/
    MapStage.tsx             # Full-screen interactive map (zoom/pan/trolley boxes)
    types.ts                 # EBoxType, ITrolley, TMapBox, IMapStageProps
    constants.ts             # Colors, trolley registry, box configs
    utils.ts                 # Coordinate transforms
    basementMapData.ts       # Seed station positions
    doorPositions.ts         # Door area anchor positions
    floors/                  # Floor configs (basement + floor 1-8)
    components/
      APDetailPanel.tsx      # Side panel when clicking a station
      DoorPanel.tsx          # Door open/close panel
  components/
    navbar.tsx               # Top nav with tab routing
    FloorSelector.tsx        # Floor switch buttons
    ui/                      # shadcn-style components (Button, Card, Badge, etc.)
  contexts/
    StorageContext.tsx       # Central state: trolleys, robots, tasks, queues, doors
  hooks/
    useLocalStorage.ts       # Generic localStorage get/set with JSON
  data/
    seed.ts                  # Initial data: 36 trolleys, 6 robots, 7 tasks, door configs
  pages/
    dashboard.tsx            # Full-screen map + floor selector + overlays
    library.tsx              # Task library
    tasks.tsx                # Task queue with run/cancel
    automation.tsx           # Automation rules
    lift.tsx                 # Lift control panel
```

## Key Design Decisions

- **localStorage instead of backend**: All CRUD operations hit `StorageContext`, which writes to `localStorage`. The `executeMove` and `runTaskQueue` methods include simulated delays (2.5s / 2s per item) so the UI feels alive.
- **Full-screen map**: MapStage fills `calc(100vh - 56px)` via flexbox. Floor selector overlays top-left. Station detail panel slides in from the right.
- **No real robot integration**: Robot positions are static seed data. Move operations update stored positions optimistically.

## Commit Conventions

`feat:`, `chore:`, `docs:`, `delete:` — lower case, imperative mood.

## Build

```bash
bun run build    # outputs to dist/
bun run preview  # preview build
```

## Deploy

Static site. Output in `dist/`. Deploy to Cloudflare Pages, Netlify, or GitHub Pages.
