# F1 GridScope — Technical Specification & Build Framework

> Hand this whole file to Copilot / paste sections into chat as you go. It's written so each section can be built and tested independently.

---

## 1. What this project actually is

A Java desktop app (JavaFX) that shows F1 season data, grid/driver/team info, race results, **and** a 2D animated circuit map that can play back a race lap-by-lap using real GPS telemetry, plus a live mode during an actual race weekend.

This is genuinely buildable. The live map is not vaporware — it's built on real, documented telemetry data. But there are hard limits you need to accept up front so you don't design yourself into a corner.

### Non-negotiable facts about the data (read before designing anything)

| Claim | Reality |
|---|---|
| "Everything live and free" | Mostly true. No API key or signup is required for OpenF1, and the free tier (3 req/s, 30 req/min) is enough for a student project. |
| "2D replay of any race, any year" | **Only 2023 onward.** Telemetry/location data simply doesn't exist before that in any free source. Pre-2023 seasons = stats and results only, no circuit animation. |
| "Live during the race" | Live-window behavior (30 min before session start to 30 min after) has reportedly gotten stricter — one recent build log said live access now wants a supporter key while historical stays free. Check the current docs immediately before you build the live feature; don't assume today's answer holds. |
| "Every penalty, every crash, for 6 seasons" | No API gives this cleanly for historical seasons. This part stays manually curated in your own DB — that's a feature, not a shortcut. |

Design the app in three tiers so a partial build still demos well:

- **Tier 1 — Core (must work, no exceptions):** season browser, grid, standings, race results, driver/team pages. Works for any season, powered by Jolpica.
- **Tier 2 — Replay (works for 2023+ only):** 2D circuit map animating stored GPS points from a finished session. Powered by OpenF1 historical data.
- **Tier 3 — Live (best-effort, only during an actual live session):** same map, polling OpenF1 every few seconds instead of replaying a static file.

Build and demo Tier 1 first. Tier 2 is the impressive part. Tier 3 is a bonus — only a live race weekend lets you show it, so don't let your grade depend on one being scheduled that day.

---

## 2. Data sources

### 2.1 Jolpica F1 API — season/results/standings backbone
- Base: `https://api.jolpi.ca/ergast/f1/`
- Same shape as the old Ergast API (it's the maintained drop-in successor covering 1950–present including 2025-2026), so any Ergast tutorial/schema you find online still applies.
- Use for: season list, race calendar, driver/constructor lists, race results, qualifying results, standings, fastest laps, finishing status (this doubles as your DNF/retirement reason field).
- No auth, no key.

Example endpoints:
```
GET /2024.json                          -> season races
GET /2024/drivers.json                  -> driver list for season
GET /2024/constructors.json             -> constructor list
GET /2024/results.json                  -> all results
GET /2024/5/results.json                -> race 5 results
GET /2024/driverStandings.json
GET /2024/constructorStandings.json
GET /2024/qualifying.json
```

### 2.2 OpenF1 API — telemetry, live data, driver photos
- Base: `https://api.openf1.org/v1/`
- No API key for historical data; live-session behavior may require checking current terms (see table above).
- Endpoints you'll actually use:
  - `/sessions` — get a `session_key` for a given year/circuit/session type (Race, Qualifying, Practice)
  - `/meetings` — event/circuit metadata, including a circuit image URL
  - `/drivers` — includes `headshot_url` for driver photos, team, driver number
  - `/location` — **this is the one that makes the circuit map possible.** Returns x/y/z GPS coordinates per car, ~3.7Hz
  - `/position` — position-in-race over time (log of changes, not current state — you must reconstruct "current" by taking the latest entry per driver)
  - `/laps`, `/pit`, `/stints`, `/weather`, `/race_control` — supporting detail
- **Important pattern (do this in Java, not on the fly per widget):** OpenF1 returns raw event logs, not current state. For any "what's happening right now" query, fetch the relevant endpoint and reduce to the latest record per driver yourself, in a service layer, before it ever reaches the UI. Building the map straight off raw responses in the UI thread is the #1 way people over-complicate this.

### 2.3 What NOT to try to automate
- Penalties, stewards' decisions, and "notable incident" writeups: store these yourself in a `race_incidents` table you fill in manually for the marquee races (crashes, DSQs, controversial penalties). Frame this as intentional curation in your report — it is genuinely the correct engineering call, not a cop-out.

---

## 3. Tech stack

- **Java 21 + JavaFX** for the UI (Swing will fight you on the animated canvas — use JavaFX `Canvas` + `GraphicsContext` + `AnimationTimer` instead).
- **MySQL** (or SQLite if you want zero-config for a demo laptop) via JDBC for cached API data + your manual curation tables.
- **HttpClient** (built into Java 11+, `java.net.http.HttpClient`) for API calls — no extra library needed.
- **Jackson** or **org.json** for JSON parsing.
- **A background scheduler** (`ScheduledExecutorService` or a simple JavaFX `Timeline`) for: (a) periodic sync of season data, (b) polling OpenF1 every 2-5 seconds during live mode.

Architecture in one line: **UI (JavaFX) → Service layer (reduces raw API logs to clean state objects) → Repository layer (DB cache + manual tables) → API client layer (Jolpica + OpenF1 HTTP calls).** Keep these as separate packages so Copilot (and you) can work on one without breaking another.

---

## 4. The 2D circuit map (the hard, cool part)

This is the piece worth being precise about, since it's also the piece most likely to get over-engineered.

**Step 1 — Get a track outline.** Pull `/location` for a full race session for one driver on one clean lap (no pit stops, no incidents). Plot every (x, y) point — that traced path *is* your circuit outline. Store it once per circuit as a normalized point list (scale x/y to fit a fixed canvas size, e.g. 800x500), so you're not refetching it every time.

**Step 2 — Replay mode (2023+ races only).** For a finished session:
1. Fetch `/location` for every driver for the session (this can be a lot of rows — filter by time range or paginate).
2. Group by driver, sort by timestamp.
3. On a JavaFX `AnimationTimer`, step through timestamps at whatever playback speed you choose (e.g. 1 real second = 10 race seconds), drawing each driver's icon (colored circle/logo + number) at their interpolated (x,y) for that tick, on top of the static circuit outline from Step 1.
4. That's your "highlights" — not a video, literally a 2D dot-race, which is exactly what you described wanting.

**Step 3 — Live mode (only usable during an actual session, subject to the access-window caveat above).**
Same rendering code as replay, except instead of reading pre-fetched points, your scheduler polls `/location?session_key=X&date>{last_timestamp}` every few seconds and appends new points as they arrive. Reuse the exact same drawing function — live vs replay should only differ in *where the points come from*, never in how they're drawn.

**Practical note:** don't try to render true telemetry-accurate racing lines with slip angles, etc. A dot moving smoothly along real coordinates, correctly labeled with driver number/color, already reads as "wow" in a demo. Resist scope creep here.

---

## 5. Database schema (starting point)

```sql
-- Tier 1: core season data (from Jolpica, cached)
CREATE TABLE seasons (year INT PRIMARY KEY, champion_driver VARCHAR(100), champion_constructor VARCHAR(100));
CREATE TABLE drivers (driver_id VARCHAR(50) PRIMARY KEY, full_name VARCHAR(100), nationality VARCHAR(50),
                       driver_number INT, headshot_url VARCHAR(255));
CREATE TABLE constructors (constructor_id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), nationality VARCHAR(50));
CREATE TABLE races (race_id INT AUTO_INCREMENT PRIMARY KEY, season_year INT, round INT, race_name VARCHAR(100),
                     circuit_name VARCHAR(100), race_date DATE, FOREIGN KEY (season_year) REFERENCES seasons(year));
CREATE TABLE race_results (id INT AUTO_INCREMENT PRIMARY KEY, race_id INT, driver_id VARCHAR(50),
                            constructor_id VARCHAR(50), grid_position INT, finish_position INT,
                            points DECIMAL(5,1), status VARCHAR(50), fastest_lap BOOLEAN);
CREATE TABLE standings_driver (season_year INT, driver_id VARCHAR(50), points DECIMAL(6,1), position INT);
CREATE TABLE standings_constructor (season_year INT, constructor_id VARCHAR(50), points DECIMAL(6,1), position INT);

-- Tier 2/3: telemetry cache (from OpenF1)
CREATE TABLE sessions (session_key INT PRIMARY KEY, race_id INT, session_type VARCHAR(20), circuit_key INT);
CREATE TABLE circuit_outlines (circuit_key INT PRIMARY KEY, points_json TEXT); -- the traced (x,y) path from Step 1

-- Manual curation
CREATE TABLE race_incidents (id INT AUTO_INCREMENT PRIMARY KEY, race_id INT, description TEXT, type VARCHAR(30));
CREATE TABLE penalties (id INT AUTO_INCREMENT PRIMARY KEY, race_id INT, driver_id VARCHAR(50), description TEXT);
```

Note: raw per-tick location points for replay are large — don't put them in MySQL row-by-row. Cache them as a single JSON blob per (session, driver) on disk or in one TEXT column, fetched once and reused.

---

## 6. Suggested folder structure

```
f1-gridscope/
  src/main/java/com/gridscope/
    api/          -> JolpicaClient.java, OpenF1Client.java (raw HTTP + JSON parsing only)
    service/       -> SeasonService, RaceService, TelemetryService (reduces raw API data to clean objects)
    repository/    -> DB access (JDBC), one class per table group
    model/         -> Driver, Constructor, Race, RaceResult, TelemetryPoint, CircuitOutline...
    ui/
      screens/     -> SeasonDashboard, GridView, RaceDetail, DriverProfile, ConstructorProfile
      map/         -> CircuitMapCanvas.java, ReplayController.java, LiveController.java
    sync/          -> ScheduledSyncJob.java (season refresh), LivePoller.java
  src/main/resources/
    circuits/      -> cached circuit outline JSON per circuit_key
    images/        -> local fallback images/logos
  db/schema.sql
```

---

## 7. Build order (do it in this sequence, not all at once)

1. **Jolpica client + `seasons`/`drivers`/`races`/`race_results` tables.** Get one season fully working end to end: pick 2024, list races, click a race, see results. This alone is a passable submission if time runs out.
2. **Season Dashboard + Grid View + Driver/Constructor profile screens** — pure UI over the data from step 1.
3. **OpenF1 `/drivers` for headshot photos** — swap in real photos, low effort, high visual payoff.
4. **Circuit outline tracer (Step 1 from Section 4)** for 2-3 circuits, hardcoded to start (Bahrain, Monaco, Silverstone are good demo choices).
5. **Replay mode** for one finished 2023+ race on one of those circuits. Get this rock solid before touching live mode.
6. **Manual incident/penalty tables + a "Notable Moments" panel** — cheap to build, makes the app look complete.
7. **Live polling mode** — only after everything above works, and only if you can test it against an actual session (practice sessions are lower-stakes than a live race for testing since they run more often).

---

## 8. Feasibility caveats to state in your report (so you don't overpromise to your instructor)

- Full telemetry/replay is only possible for 2023–present; earlier seasons are stats-only. This is a data availability limit, not a bug.
- Live mode depends on OpenF1's live-access terms at the time you demo it — confirm this close to your presentation date, since it's a detail that can change between now and then.
- Penalties/crashes/incidents are manually curated by design for anything before the OpenF1 era, and are supplemented by `/race_control` messages for 2023+ sessions.
- Rate limits (3 req/s free tier) mean you should cache aggressively rather than re-fetching on every screen visit.

---

## 9. What to paste into Copilot first

Start with a narrow, concrete prompt rather than the whole spec at once:

> "Using Java 21 and JavaFX, create a `JolpicaClient` class that fetches `https://api.jolpi.ca/ergast/f1/{year}/results.json` using `java.net.http.HttpClient`, parses the JSON with Jackson into a `List<RaceResult>` model class, and handles network errors gracefully."

Then move file-by-file down the build order in Section 7. Feeding the whole architecture at once tends to produce boilerplate that doesn't fit together — one module at a time, tested before the next, works much better with Copilot.
