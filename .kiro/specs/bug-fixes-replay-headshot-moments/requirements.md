# Requirements Document

## Introduction

This document captures the requirements for three targeted bug fixes in the F1 GridScope JavaFX
desktop application:

1. **Bug 1** — Race Replay fails to load because `TelemetryService.loadReplayData()` issues a
   single HTTP request for all GPS data across all drivers, reliably timing out at 30 seconds.
2. **Bug 2** — Driver headshots show the wrong photo (e.g. Verstappen/Norris mismatch) because
   `DriverProfile.resolveHeadshot()` selects the earliest-indexed session and matches drivers by
   fuzzy substring on last name.
3. **Bug 3** — The Notable Moments list clips long incident descriptions to a single line; text
   appears to expand only when the row is selected, making most content invisible.

---

## Glossary

- **TelemetryService** — Service class (`TelemetryService.java`) responsible for fetching,
  normalising, and caching GPS telemetry data from the OpenF1 API.
- **RaceReplayView** — JavaFX screen (`RaceReplayView.java`) that lets users load and play back
  race replay data on a circuit map canvas.
- **OpenF1Client** — HTTP client (`OpenF1Client.java`) wrapping the public OpenF1 REST API.
- **DriverProfile** — JavaFX screen (`DriverProfile.java`) that displays per-driver statistics and
  headshot photos.
- **NotableMomentsPanel** — JavaFX screen (`NotableMomentsPanel.java`) that lists curated race
  incidents and penalties.
- **LocationCache** — The on-disk JSON cache stored at
  `~/.f1-gridscope/location-cache/session-{key}.json` that persists per-driver telemetry points.
- **ProgressCallback** — A `Consumer<String>` supplied by `RaceReplayView` to `TelemetryService`
  so that load progress can be surfaced in the UI status label.
- **PermanentNumber** — The car racing number permanently assigned to a driver
  (`Driver.permanentNumber`), used as the unambiguous lookup key against the OpenF1 drivers
  endpoint.

---

## Requirements

### Requirement 1: Race Replay Per-Driver Telemetry Fetching

**User Story:** As a user, I want race replay to load successfully, so that I can watch driver
positions replay on the circuit map without the app timing out.

#### Acceptance Criteria

1. WHEN `loadReplayData` is called with a valid session key and no cache exists, THE
   TelemetryService SHALL fetch the driver list from the OpenF1 `/drivers` endpoint for that
   session key before fetching any location data.

2. WHEN the driver list has been fetched, THE TelemetryService SHALL call
   `fetchLocation(sessionKey, driverNumber)` individually for each driver number in the list,
   rather than issuing a single bulk request with no driver filter.

3. WHEN each driver's location data has been fetched, THE TelemetryService SHALL invoke the
   ProgressCallback with a message of the form `"Loading {i}/{n} drivers..."` where `{i}` is the
   1-based index of the driver just fetched and `{n}` is the total driver count.

4. WHEN all per-driver location data has been collected, THE TelemetryService SHALL write the
   merged result to the LocationCache file in the existing JSON format
   (`Map<Integer, List<TelemetryPoint>>`), and on subsequent calls for the same session key THE
   TelemetryService SHALL return the cached data without making any HTTP requests.

5. IF `fetchDrivers` returns an empty list for the given session key, THEN THE TelemetryService
   SHALL return an empty map and SHALL NOT throw an exception.

6. WHEN `RaceReplayView` calls `loadReplayData`, THE RaceReplayView SHALL pass a ProgressCallback
   lambda that calls `Platform.runLater` to update `statusLabel` with each progress message on the
   JavaFX Application Thread.

---

### Requirement 2: Driver Headshots Exact Number-Based Lookup

**User Story:** As a user, I want to see the correct driver headshot photo on the Driver Profile
screen, so that I can identify drivers without being misled by mismatched photos.

#### Acceptance Criteria

1. WHEN resolving a headshot for a driver whose `permanentNumber` is non-null, THE DriverProfile
   SHALL look up the headshot URL by calling `fetchDriverHeadshots(sessionKey)` and retrieving the
   entry keyed by `driver.getPermanentNumber()`, without performing any name-based string matching.

2. IF the exact permanent-number lookup returns a non-null, non-blank URL, THEN THE DriverProfile
   SHALL use that URL as the headshot and SHALL NOT attempt any further name-based matching.

3. IF the driver's `permanentNumber` is null, OR if the permanent-number lookup returns null, THEN
   THE DriverProfile SHALL fall back to name-based matching by calling `fetchDrivers(sessionKey)`
   and finding the first driver whose `familyName` matches the target family name using
   case-insensitive exact equality (`equalsIgnoreCase`), not substring matching (`contains`).

4. WHEN selecting the session to query for headshots, THE DriverProfile SHALL use the
   last element of the session list returned by `fetchSessions(year, "Race")` (i.e. the entry with
   the highest session key), so that the most recently indexed race session — which has the most
   complete driver list — is used.

5. IF `fetchSessions` returns an empty list, THEN THE DriverProfile SHALL return `null` for the
   headshot URL and SHALL NOT throw an exception.

---

### Requirement 3: Notable Moments Fully Visible Wrapped Text

**User Story:** As a user, I want to read the full text of every notable moment and penalty in the
Notable Moments panel, so that I can understand the complete incident description without having to
click or scroll horizontally.

#### Acceptance Criteria

1. THE NotableMomentsPanel SHALL display each incident and penalty description as fully wrapped,
   multi-line text so that all characters of each description are visible within the panel's width
   without horizontal scrolling.

2. WHEN `loadIncidents` produces a list of N items (N ≥ 0), THE NotableMomentsPanel SHALL display
   exactly N incident entries — no items may be dropped, duplicated, or collapsed.

3. WHEN the NotableMomentsPanel is resized horizontally, THE incident display area SHALL reflow
   each incident's text to fit the new width, without requiring user interaction.

4. THE NotableMomentsPanel SHALL provide vertical scrolling so that users can scroll through
   incident entries that extend beyond the visible panel height.

5. WHEN there are no incidents for the selected race, THE NotableMomentsPanel SHALL display the
   placeholder message `"No curated incidents for this race yet."` as a single wrapped label in
   the incident display area.
