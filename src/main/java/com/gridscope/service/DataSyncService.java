package com.gridscope.service;

import com.gridscope.api.JolpicaClient;
import com.gridscope.model.Constructor;
import com.gridscope.model.Driver;
import com.gridscope.model.Race;
import com.gridscope.model.RaceResult;
import com.gridscope.model.Season;
import com.gridscope.model.StandingEntry;
import com.gridscope.repository.ConstructorRepository;
import com.gridscope.repository.ConstructorStandingRepository;
import com.gridscope.repository.DatabaseConnectionProvider;
import com.gridscope.repository.DriverRepository;
import com.gridscope.repository.DriverStandingRepository;
import com.gridscope.repository.RaceRepository;
import com.gridscope.repository.RaceResultRepository;
import com.gridscope.repository.SeasonRepository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

public class DataSyncService {

    private final JolpicaClient jolpicaClient;
    private final DatabaseConnectionProvider connectionProvider;
    private final SeasonRepository seasonRepository;
    private final DriverRepository driverRepository;
    private final ConstructorRepository constructorRepository;
    private final RaceRepository raceRepository;
    private final RaceResultRepository raceResultRepository;
    private final DriverStandingRepository driverStandingRepository;
    private final ConstructorStandingRepository constructorStandingRepository;

    public DataSyncService(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
        this.jolpicaClient = new JolpicaClient();
        this.seasonRepository = new SeasonRepository(connectionProvider);
        this.driverRepository = new DriverRepository(connectionProvider);
        this.constructorRepository = new ConstructorRepository(connectionProvider);
        this.raceRepository = new RaceRepository(connectionProvider);
        this.raceResultRepository = new RaceResultRepository(connectionProvider);
        this.driverStandingRepository = new DriverStandingRepository(connectionProvider);
        this.constructorStandingRepository = new ConstructorStandingRepository(connectionProvider);
    }

    public void syncYear(int year) {
        System.out.println("Syncing year: " + year);

        // Upsert season
        Season season = new Season();
        season.setYear(year);
        seasonRepository.upsert(season);

        // Sync drivers
        List<Driver> drivers = jolpicaClient.fetchDrivers(year);
        for (Driver driver : drivers) {
            driverRepository.upsert(driver);
        }
        sleep(400);

        // Sync constructors
        List<Constructor> constructors = jolpicaClient.fetchConstructors(year);
        for (Constructor constructor : constructors) {
            constructorRepository.upsert(constructor);
        }
        sleep(400);

        // Sync race calendar first (ensures all races exist before results)
        List<Race> races = jolpicaClient.fetchRaces(year);
        for (Race race : races) {
            raceRepository.upsert(race);
        }
        sleep(400);

        // Sync race results (also contains race info)
        List<RaceResult> results = jolpicaClient.fetchResults(year);
        for (RaceResult result : results) {
            Race race = result.getRace();
            if (race == null) continue;

            raceRepository.upsert(race);
            int raceId = lookupRaceId(year, race.getRound());
            if (raceId < 0) continue;

            if (result.getDriver() != null) {
                driverRepository.upsert(result.getDriver());
            }
            if (result.getConstructor() != null) {
                constructorRepository.upsert(result.getConstructor());
            }
            raceResultRepository.upsert(raceId, result);
        }
        sleep(400);

        // Sync driver standings
        List<StandingEntry> driverStandings = jolpicaClient.fetchDriverStandings(year);
        for (StandingEntry entry : driverStandings) {
            driverStandingRepository.upsert(year, entry);
        }
        sleep(400);

        // Sync constructor standings
        List<StandingEntry> constructorStandings = jolpicaClient.fetchConstructorStandings(year);
        for (StandingEntry entry : constructorStandings) {
            if (entry.getConstructors() != null && !entry.getConstructors().isEmpty()) {
                constructorRepository.upsert(entry.getConstructors().get(0));
            }
            constructorStandingRepository.upsert(year, entry);
        }

        System.out.println("Sync complete for year: " + year);
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private int lookupRaceId(int year, Integer round) {
        if (round == null) return -1;
        String sql = "SELECT race_id FROM races WHERE season_year = ? AND round = ?";
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, year);
            statement.setInt(2, round);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return resultSet.getInt("race_id");
                }
            }
        } catch (SQLException exception) {
            System.err.println("Failed to lookup race id: " + exception.getMessage());
        }
        return -1;
    }
}
