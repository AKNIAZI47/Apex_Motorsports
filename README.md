# F1 GridScope

F1 GridScope is a Java 21 desktop application built with JavaFX. It uses Jolpica/Ergast-style F1 API data, Jackson for JSON parsing, and MySQL for local caching and season data storage.

## Tech Stack

- Java 21
- JavaFX 21
- Maven
- Jackson
- MySQL Connector/J

## Project Layout

- `src/main/java/com/gridscope/api` - API clients
- `src/main/java/com/gridscope/model` - data models
- `src/main/java/com/gridscope/repository` - JDBC repositories
- `src/main/java/com/gridscope/service` - service layer
- `src/main/java/com/gridscope/ui` - JavaFX screens and map UI
- `src/main/java/com/gridscope/sync` - sync jobs and polling
- `db/schema.sql` - single-source database schema

## Prerequisites

- Java 21 installed
- Maven installed, or the extracted Maven folder available locally
- MySQL running locally or on a reachable server

## Build

If Maven is not on your PATH, you can run it directly from the extracted folder, for example:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot'
$env:Path = "$env:JAVA_HOME\bin;C:\Users\Anas Computer\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin;$env:Path"
& "C:\Users\Anas Computer\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd" -q -DskipTests compile
```

If Maven is already on PATH, you can also run:

```powershell
mvn -q -DskipTests compile
```

## Run

Use the JavaFX Maven plugin:

```powershell
mvn javafx:run
```

## Database Setup

Run `db/schema.sql` against a fresh MySQL database to create all tables and constraints.

The schema includes:

- `seasons`
- `drivers`
- `constructors`
- `races`
- `race_results`
- `standings_driver`
- `standings_constructor`
- `sessions`
- `circuit_outlines`
- `race_incidents`
- `penalties`

## Notes

- The unique constraints on `race_results`, `standings_driver`, and `standings_constructor` are included in the schema so re-syncing does not create duplicates.
- The current UI entry point is `com.gridscope.ui.screens.F1GridScopeApp`.