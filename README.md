# Apex Motorsports

Apex Motorsports is an enterprise-grade racing intelligence and telemetry hub covering 10 premier motorsport championships worldwide: **Formula 1, MotoGP, WorldSBK, FIA World Endurance Championship (WEC), FIA World Rally Championship (WRC), NTT IndyCar Series, Repco Supercars Championship, Deutsche Tourenwagen Masters (DTM), Fanatec GT World Challenge, and Formula DRIFT**.

Built with React 18, TypeScript, Tailwind CSS, Vite, and an Express proxy/cache backend, Apex Motorsports delivers synchronized race classifications, championship standings with strict mathematical invariants, dynamic telemetry tracking, and comprehensive driver/constructor profiles.

---

## Key Features

- **Multi-Championship Coverage**: Native integration for 10 distinct motorsport categories across open-wheel, prototype endurance, production GT3, touring car, rally, motorcycle, and drift disciplines.
- **Accurate Season Calendars**: Race calendars calibrated against official governing body calendars (FIA, FIM, Dorna Sports, INDYCAR LLC, SRO, ADAC, Supercars Australia).
- **Sequential Championship Metrics**: Real-time leaderboards, driver standings, constructor standings, and scheduled vs. completed round verification.
- **Interactive Telemetry & Track Replay**: 2D circuit telemetry viewer featuring apex tracking, sector times, telemetry curves, speed traps, and lap telemetry playback.
- **Driver & Constructor Profiles**: Detailed competitor biographies, career statistics, championship records, vehicle specifications, and engine power unit specifications.
- **Head-to-Head Comparison Engine**: Direct driver telemetry comparison highlighting head-to-head qualifying deltas, race pace, podium percentages, and career win rates.
- **Automated Data Reconciliation**: Server-side sync engine with scheduled daily polling at 00:00 UTC and caching layer (`server_cache/`) ensuring zero disruption or rate limiting.
- **Restful API Gateway**: Express proxy caching official feed results and telemetry data with 5-minute memory TTL.

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
   - Executes daily reconciliation across official championship feeds.
   - Maintains persistence in `server_cache/unified_motorsport_data.json`.
   - Exposes REST endpoints at `/api/sync/status` and `/api/sync/run-nightly`.

2. **Client Collector (`src/services/motorsportDailyLiveCollector.ts`)**:
   - Manages client-side cache hydration with versioned localStorage keys.
   - Dispatches `motorsport_data_updated` custom events to re-render active dashboards seamlessly without page reloads.

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