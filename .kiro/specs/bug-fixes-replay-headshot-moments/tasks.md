# Implementation Plan: Bug Fixes — Race Replay, Headshot Mismatch, Notable Moments

## Overview

Three independent bug fixes. Each can be implemented and tested in isolation. The tasks below are
grouped by bug. All three bugs are in existing Java/JavaFX files; no new source files are required
except optional test classes.

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "4", "6"]
    },
    {
      "wave": 2,
      "tasks": ["2", "5", "7"]
    },
    {
      "wave": 3,
      "tasks": ["3"]
    }
  ]
}
```

Bugs 1, 2, and 3 are fully independent. Tasks within each bug group must be done in order (the
implementation task before its test sub-tasks). Tasks across bug groups have no dependencies.

---

## Tasks

### Bug 1 — Race Replay: Per-Driver Telemetry Fetching

- [x] 1. Refactor `TelemetryService.loadReplayData` to fetch location data per driver
  - File: `src/main/java/com/gridscope/service/TelemetryService.java`
  - Add a `Consumer<String> progressCallback` parameter to `loadReplayData(int sessionKey)`
    (new signature: `loadReplayData(int sessionKey, Consumer<String> progressCallback)`)
  - At the top of the cache-miss path, call `openF1Client.fetchDrivers(sessionKey)` to obtain
    the list of drivers; if the list is empty, return `Collections.emptyMap()` immediately
  - Replace the single `openF1Client.fetchLocation(sessionKey, null)` call with a sequential
    loop over each driver's `permanentNumber`, calling
    `openF1Client.fetchLocation(sessionKey, driverNumber)` per iteration
  - After each per-driver fetch, invoke `progressCallback.accept("Loading " + (i+1) + "/" + n + " drivers...")`
  - Sort each driver's point list by timestamp (preserve existing sort logic)
  - After the loop, write the merged `Map<Integer, List<TelemetryPoint>>` to the cache file
    (same path and format as today)
  - Import `java.util.function.Consumer`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [-]* 1.1 Write property test — per-driver fetch completeness (Property 1)
    - Test file: `src/test/java/com/gridscope/service/TelemetryServiceTest.java`
    - Mock `OpenF1Client`; stub `fetchDrivers` to return a generated list of N drivers (vary N)
    - Stub each `fetchLocation(sessionKey, driverNumber)` to return a small list of points
    - Assert the returned map has exactly N keys matching the driver numbers
    - Assert no entry value is null
    - **Property 1: Per-driver fetch completeness**
    - **Validates: Requirements 1.1, 1.2**

  - [x]* 1.2 Write property test — progress callback invocation count (Property 2)
    - Test file: `src/test/java/com/gridscope/service/TelemetryServiceTest.java`
    - For a generated list of N drivers, collect all callback messages into a list
    - Assert the list has exactly N entries
    - Assert the i-th entry equals `"Loading " + (i+1) + "/" + N + " drivers..."`
    - **Property 2: Progress callback invocation count**
    - **Validates: Requirements 1.3**

  - [-]* 1.3 Write property test — cache round-trip consistency (Property 3)
    - Test file: `src/test/java/com/gridscope/service/TelemetryServiceTest.java`
    - Use a temp directory as `locationCacheDir`; call `loadReplayData` twice with the same key
    - Assert both calls return structurally equal maps
    - Assert `fetchDrivers` and `fetchLocation` are each called 0 times on the second call
    - **Property 3: Cache round-trip consistency**
    - **Validates: Requirements 1.4**

  - [x]* 1.4 Write edge-case test — empty driver list guard (Property 4)
    - Test file: `src/test/java/com/gridscope/service/TelemetryServiceTest.java`
    - Stub `fetchDrivers` to return an empty list
    - Assert `loadReplayData` returns an empty map
    - Assert no exception is thrown and `fetchLocation` is never called
    - **Property 4: Empty driver list guard**
    - **Validates: Requirements 1.5**

- [x] 2. Update `RaceReplayView.loadReplay` to pass a progress callback
  - File: `src/main/java/com/gridscope/ui/screens/RaceReplayView.java`
  - Update the call site `appContext.getTelemetryService().loadReplayData(session.getSessionKey())`
    to pass a lambda: `msg -> Platform.runLater(() -> statusLabel.setText(msg))`
  - New call: `appContext.getTelemetryService().loadReplayData(session.getSessionKey(), msg -> Platform.runLater(() -> statusLabel.setText(msg)))`
  - No other logic changes required in this file
  - _Requirements: 1.3, 1.6_

- [x] 3. Checkpoint — Bug 1 complete
  - Ensure all tests pass, ask the user if questions arise.

---

### Bug 2 — Driver Headshots: Exact Number-Based Lookup

- [x] 4. Rewrite `DriverProfile.resolveHeadshot` to use permanent-number-first lookup
  - File: `src/main/java/com/gridscope/ui/screens/DriverProfile.java`
  - Replace `sessions.get(0)` with `sessions.get(sessions.size() - 1)` to select the last
    (highest session key) race session
  - After obtaining `sessionKey`, call `openF1Client.fetchDriverHeadshots(sessionKey)` to get
    `Map<Integer, String> headshots`
  - If `driver.getPermanentNumber()` is non-null, attempt `headshots.get(driver.getPermanentNumber())`
  - If the result is a non-null, non-blank URL, return it immediately
  - Otherwise fall through to the name-based fallback path
  - In the fallback path, call `openF1Client.fetchDrivers(sessionKey)` to get the full driver list
  - Replace the `.contains(lastName)` predicate with `.equalsIgnoreCase(lastName)` on
    `d.getFamilyName()`
  - Guard against null `familyName` on both sides of the comparison
  - Keep the existing early-return for `driver.getHeadshotUrl()` already populated
  - Keep the `try/catch (Exception ignored)` wrapper
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x]* 4.1 Write property test — permanent number lookup correctness (Property 5)
    - Test file: `src/test/java/com/gridscope/ui/screens/DriverProfileTest.java`
    - Mock `AppContext` and `OpenF1Client`
    - Build a headshots map with several driver numbers mapping to distinct URLs
    - For each driver number in the map, assert `resolveHeadshot` returns the URL for that exact
      number and not any other driver's URL
    - **Property 5: Permanent number lookup correctness**
    - **Validates: Requirements 2.1, 2.2**

  - [-]* 4.2 Write property test — name fallback exact-match safety (Property 6)
    - Test file: `src/test/java/com/gridscope/ui/screens/DriverProfileTest.java`
    - Construct a scenario where driver A has familyName `"Nor"` and driver B has `"Norris"`;
      pass `permanentNumber = null` (to force fallback)
    - Searching for family name `"Nor"` must return driver A's URL, not driver B's
    - Searching for family name `"Norris"` must return driver B's URL, not driver A's
    - **Property 6: Name fallback exact-match safety**
    - **Validates: Requirements 2.3**

  - [-]* 4.3 Write edge-case test — empty sessions list returns null
    - Test file: `src/test/java/com/gridscope/ui/screens/DriverProfileTest.java`
    - Stub `fetchSessions` to return an empty list
    - Assert `resolveHeadshot` returns `null` without throwing
    - _Requirements: 2.5_

- [x] 5. Checkpoint — Bug 2 complete
  - Ensure all tests pass, ask the user if questions arise.

---

### Bug 3 — Notable Moments: Fully Visible Wrapped Text

- [x] 6. Replace `ListView<String>` with `ScrollPane` + `VBox` in `NotableMomentsPanel`
  - File: `src/main/java/com/gridscope/ui/screens/NotableMomentsPanel.java`
  - Remove the `ListView<String> incidentList` field
  - Add a `VBox incidentBox` field and a `ScrollPane incidentScrollPane` field
  - In the constructor, initialise:
    ```java
    incidentBox = new VBox(4);
    incidentBox.setPadding(new Insets(4));
    incidentScrollPane = new ScrollPane(incidentBox);
    incidentScrollPane.setFitToWidth(true);
    incidentScrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
    incidentScrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);
    ```
  - Add the private helper `setIncidents(List<String> lines)`:
    - Clear `incidentBox.getChildren()`
    - For each line, create a `Label(line)` with `setWrapText(true)`, `setMaxWidth(Double.MAX_VALUE)`,
      `setTextFill(Color.WHITE)`
    - Add the label to `incidentBox`; between items (not after the last), add a `new Separator()`
  - Replace all `incidentList.getItems().setAll(lines)` call sites in `loadIncidents` with
    `Platform.runLater(() -> setIncidents(lines))`
  - Replace `incidentList.getItems().setAll("No curated incidents...")` with
    `setIncidents(List.of("No curated incidents for this race yet."))`
  - Replace the `incidentList` node in the `center` VBox with `incidentScrollPane`
  - Remove unused imports (`ListCell`, `ListView`)
  - Add imports: `ScrollPane`, `Separator`, `Priority`, `VBox` (already present)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [-]* 6.1 Write property test — incident label wrap configuration (Property 7)
    - Test file: `src/test/java/com/gridscope/ui/screens/NotableMomentsPanelTest.java`
    - For a generated list of N non-empty strings, call `setIncidents` (make it package-private or
      extract to a testable helper)
    - Assert every `Label` child of `incidentBox` has `isWrapText() == true`
    - Assert every `Label` child has `getMaxWidth() == Double.MAX_VALUE`
    - **Property 7: Incident label wrap configuration**
    - **Validates: Requirements 3.1, 3.3**

  - [-]* 6.2 Write property test — incident count preservation (Property 8)
    - Test file: `src/test/java/com/gridscope/ui/screens/NotableMomentsPanelTest.java`
    - For a generated list of N strings (including N=0), call `setIncidents`
    - Count `Label` children in `incidentBox` (filter by type) and assert the count equals N
    - **Property 8: Incident count preservation**
    - **Validates: Requirements 3.2**

  - [ ]* 6.3 Write example test — placeholder shown when no incidents
    - Test file: `src/test/java/com/gridscope/ui/screens/NotableMomentsPanelTest.java`
    - Call `setIncidents` with the placeholder list
    - Assert exactly one Label child exists with text `"No curated incidents for this race yet."`
    - _Requirements: 3.5_

  - [ ]* 6.4 Write example test — scroll pane configuration
    - Test file: `src/test/java/com/gridscope/ui/screens/NotableMomentsPanelTest.java`
    - Assert `incidentScrollPane.isFitToWidth() == true`
    - Assert `incidentScrollPane.getHbarPolicy() == ScrollBarPolicy.NEVER`
    - Assert `incidentScrollPane.getVbarPolicy() == ScrollBarPolicy.AS_NEEDED`
    - _Requirements: 3.3, 3.4_

- [ ] 7. Final checkpoint — all three bugs fixed
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster fix
- Bugs 1, 2, and 3 are fully independent — they touch different files and can be fixed in any order
- The `loadReplayData` signature change in Bug 1 requires updating exactly one call site in
  `RaceReplayView`; no other callers exist in the current codebase
- For Bug 2, Java 21's `List.getLast()` can be used if the project targets Java 21+; otherwise
  use `sessions.get(sessions.size() - 1)`
- For Bug 3 tests, `setIncidents` must be accessible from the test (consider package-private access
  or extract to a non-UI helper class if the team prefers strict encapsulation)
