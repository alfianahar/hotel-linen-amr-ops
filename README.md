# Hotel Linen Ops

A sanitized portfolio project: interactive fleet management dashboard for hotel laundry logistics. AMR robots transport clean/soiled linen trolleys across multiple floors.

**Built from sanitized source** — originally a production Fleet Management System. All proprietary data, brand references, and backend code replaced.

## Stack

- **React 19** + TypeScript
- **Vite 8** (esbuild/rolldown)
- **Tailwind CSS 3** + CSS custom properties
- **shadcn/ui** components (Button, Card, Badge, Sheet, Select, Tabs, Toast, Dialog)
- **Bun** runtime & package manager

## Architecture

**Frontend only — no backend.** All state is persisted in `localStorage`. Move and queue operations include simulated delays so the UI feels alive.

### Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Full-screen interactive warehouse map with zoom/pan, floor selector, station boxes, trolley assignments, and move/queue controls |
| **Library** | Task library filtered by type |
| **Tasks** | Task queue per robot — run sequential, cancel, clear |
| **Automation** | Automation rules with manual trigger |
| **Lift** | Simulated elevator call panel |

### Key Feature: Interactive Map

- Zoom/pan/pinch on a 1200×420px SVG-style station layout
- 20+ parking stations (APs), charging points (CPs), elevators, dirty linen rooms, and dispatch zones
- Each station shows assigned trolley type (colored indicator)
- Click a station → detail panel: assign/remove trolley, execute move (2.5s simulated), queue move
- Trolley states update visually after execution
- Floor selector switches between basement + 8 floors

## Quick Start

```bash
bun install
bun run dev
```

Open http://localhost:3000

## Build & Deploy

```bash
bun run build      # outputs to dist/
bun run preview    # preview build
```

Static site. Deploy to Cloudflare Pages, Netlify, or GitHub Pages.

## License

MIT — portfolio use only. Not affiliated with any real logistics system.
