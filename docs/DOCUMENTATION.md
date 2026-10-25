# Apex Motorsports — Technical Documentation & Architecture Reference

## Overview

Apex Motorsports is an integrated racing intelligence platform providing unified access to telemetry, championship standings, driver profiles, team rosters, and race schedules across ten premier global motorsport categories.

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
- **Disk Persistence**: `server_cache/unified_motorsport_data.json` stores daily snapshots of verified standings, leader points, and record counts across all championships.
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

1. **Monotonic Points Invariant**: Standings are sorted in strictly descending order (`position[i].points >= position[i+1].points`). Tied points are resolved by race wins and countback criteria.
2. **Sequential Completion Invariant**: Races are marked completed chronologically. Completed races (`isCompleted: true`) store full classification data including `winner.driverId`, `winner.fullName`, `winner.constructorName`, and `winner.time`.
3. **Round State Separation**: Upcoming rounds (`isCompleted: false`) display scheduled lap counts and date targets. Completed rounds display winning classification, lap count, and elapsed winning time.
4. **Storage Key Versioning**: Local storage caches use version prefixes (`gridscope_official_standings_v7_*`) with automatic legacy invalidation routines on initialization.

---

## 4. API Endpoints

### 4.1 System & Sync
- `GET /api/health` — Service heartbeat and current server ISO timestamp.
- `GET /api/sync/status` — Returns sync engine status, last daily check date, monitored feed count, and recent sync audit logs.
- `POST /api/sync/run-nightly` — Triggers an immediate scheduled audit cycle across all championships.
- `POST /api/sync/run-official-sync` — Forces immediate verification and disk snapshot sync.

### 4.2 Formula 1 & Jolpica Gateway
- `GET /api/f1/current/driverStandings.json` — Returns official driver championship standings.
- `GET /api/f1/current/constructorStandings.json` — Returns official constructor championship standings.
- `GET /api/f1/current.json` — Returns active championship race schedule and circuit locations.
- `GET /api/f1/current/results/1.json` — Returns official race winners and classification times.

### 4.3 Results Ingestion
- `POST /api/manual/result` — Records or updates manual race classifications for non-REST categories (DTM, Formula DRIFT, Supercars).
  - Body: `{ series: string, year: number, round: number, event_name: string, p1: string, p2?: string, p3?: string, notes?: string }`

---

## 5. Circuit Telemetry Engine

The circuit telemetry module (`src/components/CircuitMapReplay.tsx`) provides high-fidelity track visualization:

- **SVG Coordinate Trajectories**: Real track outlines mapped from surveyed GPS geometries.
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
