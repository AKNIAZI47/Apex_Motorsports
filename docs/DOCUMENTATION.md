# Apex Motorsports — Technical Documentation & Architecture Reference

## Overview

Apex Motorsports is a React and Express application providing a single interface for calendars, standings, profiles, news, and simulated circuit telemetry across ten motorsport categories.

---

## 1. System Architecture

```
+-------------------------------------------------------------+
|                      React 18 SPA                           |
|  (SeasonDashboard, CircuitMapReplay, DriverProfile, Hub)    |
+-------------------------------------------------------------+
                              |
                     REST / Local Bus
                              |
+-------------------------------------------------------------+
|                 Express 5 Backend Server                    |
|       - Official API Proxy (/api/f1/*, /api/circuits/*)     |
|       - 5-Minute In-Memory TTL Node Cache                   |
|       - Unified Sync Engine (/api/sync/*)                   |
|       - Disk Cache Persistence (server_cache/)              |
+-------------------------------------------------------------+
                              |
                     External Feeds
                              |
+-------------------------------------------------------------+
|       Jolpica / Ergast MRData API, Official Timing Portals   |
+-------------------------------------------------------------+
```

### 1.1 Client Layer
- **State Management**: Built on React 18 hooks (`useState`, `useMemo`, `useEffect`) with declarative data flow.
- **Standings Resolution**: Centralized via `getCategoryStandings(category, year)` in `src/data/allMotorsportStandings.ts`.
- **Event Bus**: System broadcasts `motorsport_data_updated` custom events when new standings or race results are recorded, notifying all mounted components to re-evaluate their memoized state without requiring page reloads.

### 1.2 Server & Caching Layer
- **Memory Caching**: 300-second TTL cache for Jolpica and external feed queries prevents redundant remote calls.
- **Disk Persistence**: `server_cache/unified_motorsport_data.json` stores sync status, source metadata, leader values, record counts, and audit logs. Portal checks do not import classification data.
- **Manual Results Override**: `server_cache/manual_results.json` allows direct administrative recording of non-API results (DTM, Supercars, Formula Drift) via `/api/manual/result`.

---

## 2. Motorsport Championships

Apex Motorsports models ten distinct racing categories:

1. **Formula 1 (F1)**: FIA Formula One World Championship (22-round hybrid turbo era).
2. **MotoGP (MOTOGP)**: FIM MotoGP World Championship (premier 1000cc prototype motorcycle racing).
3. **WorldSBK (WSBK)**: FIM Superbike World Championship (production-derived 1000cc superbikes).
4. **WEC (WEC)**: FIA World Endurance Championship (Hypercar & LMGT3 categories, including the 24 Hours of Le Mans).
5. **WRC (WRC)**: FIA World Rally Championship (Rally1 hybrid 4WD gravel, tarmac, and snow stages).
6. **NTT IndyCar Series (INDYCAR)**: North American open-wheel championship featuring road, street, and oval courses (Indianapolis 500).
7. **Repco Supercars (SUPERCARS)**: Supercars Championship featuring Gen3 Chevrolet Camaro and Ford Mustang V8 touring cars (Bathurst 1000).
8. **DTM (DTM)**: Deutsche Tourenwagen Masters featuring GT3 machinery across European circuits.
9. **Fanatec GT World Challenge (GTWORLD)**: SRO GT3 sprint and endurance cups across iconic circuits (24 Hours of Spa).
10. **Formula DRIFT (DRIFT)**: Formula DRIFT Pro Championship judged tandem drift competition.

---

## 3. Data Integrity & Invariants

Championship data models enforce strict relational rules:

1. **Monotonic Points Invariant**: Standings are sorted in non-increasing points order (`position[i].points >= position[i+1].points`). The application does not implement a complete countback resolver.
2. **Result-backed Completion**: A scheduled date alone does not mark a race completed. Completed races should carry classification data such as `winner.driverId`, `winner.fullName`, `winner.constructorName`, and `winner.time`.
3. **Round State Separation**: Upcoming rounds (`isCompleted: false`) display scheduled lap counts and date targets. Completed rounds display winning classification, lap count, and elapsed winning time.
4. **Storage Key Versioning**: Local storage caches use the `gridscope_official_standings_v9_*` prefix, with selected legacy keys removed during initialization.

---

## 4. API Endpoints

### 4.1 System & Sync
- `GET /api/health` — Service heartbeat and current server ISO timestamp.
- `GET /api/sync/status` — Returns sync engine status, last daily check date, monitored feed count, and recent sync audit logs.
- `POST /api/sync/run-nightly` — Triggers an immediate scheduled audit cycle across all championships.
- `POST /api/sync/run-official-sync` — Runs the server sync engine immediately and returns its audit status.

### 4.2 Formula 1 & Jolpica Gateway
- `GET /api/f1/current` — Proxies the current Jolpica schedule.
- `GET /api/f1/schedule/:year` — Proxies a season schedule.
- `GET /api/f1/standings/drivers/:year` — Proxies driver standings.
- `GET /api/f1/standings/constructors/:year` — Proxies constructor standings.
- `GET /api/f1/results/:year/:round` — Proxies a round classification.

### 4.3 Results Ingestion
- `POST /api/manual/result` — Records or updates manual race classifications for non-REST categories (DTM, Formula DRIFT, Supercars).
  - Body: `{ series: string, year: number, round: number, event_name: string, p1: string, p2?: string, p3?: string, notes?: string }`

### 4.4 Feed status semantics

- `SYNCED`: a configured structured feed returned data that was parsed successfully.
- `AUDITED`: the source was checked or a refresh failed, so the last known snapshot was retained and standings were not changed.
- `VERIFIED_OFFICIAL`: legacy cache value; it is not assigned by the current non-F1 portal audit path.

The current non-F1 implementation performs source availability checks only. It does not extract standings from MotoGP, WEC, WorldSBK, WRC, IndyCar, Supercars, DTM, or GT World Challenge pages. GitHub commits are not performed by the runtime; a future scheduled publisher must be gated by structured-feed validation before it can commit generated data.

### 4.5 Structured adapter contract

Each non-F1 adapter is configured with a server-side `APEX_<SERIES>_FEED_URL` environment variable. The endpoint must return JSON in this shape:

```json
{
  "series": "DTM",
  "season": 2026,
  "standings": [
    { "id": "driver-id", "name": "Driver Name", "team": "Team", "points": 100, "wins": 2, "position": 1 }
  ],
  "races": [
    { "round": 1, "name": "Event", "date": "2026-01-01", "completed": true, "winner": "driver-id" }
  ]
}
```

The server rejects missing series identifiers, invalid seasons, empty standings, duplicate competitor IDs, non-numeric points, and malformed races. A successful HTTP response from an HTML results page is not accepted as a structured feed. Provider-specific adapters may transform an official API response into this contract, but the raw provider credentials and endpoint must be supplied outside the repository.

---

## 5. Circuit Telemetry Engine

The circuit telemetry module (`src/components/CircuitMapReplay.tsx`) provides a visual replay using checked-in circuit geometry and generated telemetry values:

- **SVG Coordinate Trajectories**: Track outlines stored in the application data set.
- **Sector Boundaries**: Visual sector markers with micro-sector speed traps.
- **Braking & Throttle Profiles**: Color-coded telemetry segments showing heavy braking zones (red), neutral coasting (amber), and full throttle apex exit (green).
- **Driver Position Simulation**: Real-time car position markers interpolating lap progress with speed, gear selection, and throttle percentage indicators.

---

## 6. Build and Deployment

```bash
# Clean install
npm install

# Type-check
npm run lint

# Production build (creates dist/ and dist/server.cjs)
npm run build

# Start production server
npm start
```
