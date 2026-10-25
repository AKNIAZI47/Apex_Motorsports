# Apex Motorsports

Apex Motorsports is a React and Express application for browsing motorsport calendars, standings, driver and constructor profiles, news, and simulated circuit telemetry across ten series.

Formula 1 data can be refreshed from the Jolpica/Ergast-compatible API through the Express proxy. The other series currently use checked-in season data; the server sync engine records source checks and does not claim to import classifications from portals that do not expose a configured data feed.

---

## Key Features

- **Multi-Championship Coverage**: Native integration for 10 distinct motorsport categories across open-wheel, prototype endurance, production GT3, touring car, rally, motorcycle, and drift disciplines.
- **Season Calendars**: Checked-in calendars and standings for the supported series, with F1 refresh support through Jolpica.
- **Championship Metrics**: Leaderboards, driver standings, constructor standings, and scheduled versus classified rounds.
- **Interactive Telemetry & Track Replay**: 2D circuit telemetry viewer featuring apex tracking, sector times, telemetry curves, speed traps, and lap telemetry playback.
- **Driver & Constructor Profiles**: Detailed competitor biographies, career statistics, championship records, vehicle specifications, and engine power unit specifications.
- **Head-to-Head Comparison Engine**: Direct driver telemetry comparison highlighting head-to-head qualifying deltas, race pace, podium percentages, and career win rates.
- **Source Checks**: Server-side sync engine checks configured feeds on a daily timer and persists its audit state in `server_cache/`.
- **REST API Gateway**: Express proxy for Jolpica and optional Blacktop requests with a five-minute in-memory cache.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 (Functional components, Hooks, Context, Memoization) |
| **Language** | TypeScript 5.7 (Strict type-checking) |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Animations** | Motion (Framer Motion v12) |
| **Server Runtime** | Node.js with Express 5 |
| **Development Tooling** | Vite 6, TSX, esbuild |

---

## Directory Structure

```text
├── docs/
│   └── DOCUMENTATION.md       # Full architectural documentation & API specifications
├── public/                    # Static assets and images
├── server/
│   └── unifiedSyncEngine.ts   # Server-side unified sync engine & cache persistence
├── server_cache/              # Cached championship snapshots and records
├── src/
│   ├── assets/                # Local discipline media and hero artwork
│   ├── components/            # UI components (Dashboard, Hub, Telemetry, Profiles)
│   ├── data/
│   │   ├── categories/        # Standings and calendar data per championship
│   │   ├── allMotorsportStandings.ts # Standings aggregation and queries
│   │   ├── motorsportCategories.ts   # Championship configurations
│   │   └── circuitData.ts     # Circuit geometries, coordinates, and telemetry records
│   ├── services/              # Client-side collectors and storage persistence
│   ├── types.ts               # Universal domain types and telemetry schemas
│   ├── App.tsx                # Main portal routing and tab orchestration
│   └── main.tsx               # Entry point
├── server.ts                  # Production Express backend & Vite middleware
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript compiler configuration
```

---

## Getting Started

### Prerequisites

- Node.js (v18.0 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd f1-gridscope
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

Compile both the frontend bundle and backend server:

```bash
npm run build
npm start
```

---

## Automated Sync Pipeline

The sync architecture operates on two coordinated layers:

1. **Server Synchronization (`server/unifiedSyncEngine.ts`)**:
   - Checks the configured F1 feed and probes the listed series portals.
   - Persists sync status and audit logs in `server_cache/unified_motorsport_data.json`.
   - Exposes REST endpoints at `/api/sync/status` and `/api/sync/run-nightly`.

2. **Client Collector (`src/services/motorsportDailyLiveCollector.ts`)**:
   - Manages client-side cache hydration with versioned localStorage keys.
   - Dispatches `motorsport_data_updated` custom events to re-render active dashboards seamlessly without page reloads.

### Data freshness and publication limits

- `SYNCED` means a structured feed was fetched and parsed. At present this is implemented for F1 through Jolpica.
- `AUDITED` means the configured source was checked, but no structured result feed was imported. The existing checked-in standings remain unchanged.
- A successful HTTP response from an official website is not evidence that its standings were collected.
- The application does not push commits to GitHub from the running server. Automatic GitHub publication should only be enabled after each series has a licensed, structured adapter and validation tests. Committing unverified portal snapshots would make stale or incorrect data look authoritative.

---

## Code Quality & Verification

Run the TypeScript validator:

```bash
npm run lint
```

Ensure production compilation passes:

```bash
npm run build
```

---

## License

MIT License. Copyright (c) 2026 Apex Motorsports Engineering Team.