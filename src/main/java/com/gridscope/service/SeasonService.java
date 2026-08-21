package com.gridscope.service;

import com.gridscope.model.Constructor;
import com.gridscope.model.Driver;
import com.gridscope.model.Race;
import com.gridscope.model.SeasonSnapshot;
import com.gridscope.model.StandingEntry;
import com.gridscope.repository.ConstructorRepository;
import com.gridscope.repository.ConstructorStandingRepository;
import com.gridscope.repository.DatabaseConnectionProvider;
import com.gridscope.repository.DriverRepository;
import com.gridscope.repository.DriverStandingRepository;
import com.gridscope.repository.RaceRepository;
import com.gridscope.repository.SeasonRepository;

import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class SeasonService {

    private final DataSyncService dataSyncService;
    private final SeasonRepository seasonRepository;
    private final RaceRepository raceRepository;
    private final DriverStandingRepository driverStandingRepository;
    private final ConstructorStandingRepository constructorStandingRepository;
    private final DriverRepository driverRepository;
    private final ConstructorRepository constructorRepository;

    public SeasonService(DatabaseConnectionProvider connectionProvider) {
        this.dataSyncService = new DataSyncService(connectionProvider);
        this.seasonRepository = new SeasonRepository(connectionProvider);
        this.raceRepository = new RaceRepository(connectionProvider);
        this.driverStandingRepository = new DriverStandingRepository(connectionProvider);
        this.constructorStandingRepository = new ConstructorStandingRepository(connectionProvider);
        this.driverRepository = new DriverRepository(connectionProvider);
        this.constructorRepository = new ConstructorRepository(connectionProvider);
    }

    public List<Integer> getAvailableYears() {
        List<Integer> cachedYears = seasonRepository.getAll().stream()
                .map(season -> season.getYear())
                .sorted(Comparator.reverseOrder())
                .toList();

        if (!cachedYears.isEmpty()) {
            return cachedYears;
        }

        int currentYear = Year.now().getValue();
        List<Integer> years = new ArrayList<>();
        for (int year = currentYear; year >= 1950; year--) {
            years.add(year);
        }
        return years;
    }

    public SeasonSnapshot loadSeason(int year) {
        ensureSeasonCached(year);

        SeasonSnapshot snapshot = new SeasonSnapshot();
        snapshot.setYear(year);
        snapshot.setRaces(raceRepository.getByYear(year));
        snapshot.setDriverStandings(driverStandingRepository.getAllBySeasonYear(year));
        snapshot.setConstructorStandings(constructorStandingRepository.getAllBySeasonYear(year));
        return snapshot;
    }

    public List<Driver> getDriversForSeason(int year) {
        ensureSeasonCached(year);
        return driverRepository.getDriversForSeason(year);
    }

    public List<Constructor> getConstructorsForSeason(int year) {
        ensureSeasonCached(year);
        return constructorRepository.getConstructorsForSeason(year);
    }

    public Driver getDriver(String driverId) {
        return driverRepository.getById(driverId);
    }

    public Constructor getConstructor(String constructorId) {
        return constructorRepository.getById(constructorId);
    }

    public StandingEntry getDriverStanding(int year, String driverId) {
        ensureSeasonCached(year);
        return driverStandingRepository.getAllBySeasonYear(year).stream()
                .filter(entry -> entry.getDriver() != null && driverId.equals(entry.getDriver().getDriverId()))
                .findFirst()
                .orElse(null);
    }

    public StandingEntry getConstructorStanding(int year, String constructorId) {
        ensureSeasonCached(year);
        return constructorStandingRepository.getAllBySeasonYear(year).stream()
                .filter(entry -> entry.getConstructors() != null
                        && !entry.getConstructors().isEmpty()
                        && constructorId.equals(entry.getConstructors().get(0).getConstructorId()))
                .findFirst()
                .orElse(null);
    }

    public List<Race> getRacesForSeason(int year) {
        ensureSeasonCached(year);
        return raceRepository.getByYear(year);
    }

    private void ensureSeasonCached(int year) {
        if (raceRepository.countByYear(year) < 10
                || driverStandingRepository.countBySeasonYear(year) == 0) {
            dataSyncService.syncYear(year);
        }
    }
}
