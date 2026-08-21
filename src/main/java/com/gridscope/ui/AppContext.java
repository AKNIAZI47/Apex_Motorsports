package com.gridscope.ui;

import com.gridscope.repository.DatabaseConnectionProvider;
import com.gridscope.repository.RaceIncidentRepository;
import com.gridscope.service.SeasonService;

public class AppContext {

    private final DatabaseConnectionProvider connectionProvider;
    private final SeasonService seasonService;
    private final RaceIncidentRepository raceIncidentRepository;

    public AppContext(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
        this.seasonService = new SeasonService(connectionProvider);
        this.raceIncidentRepository = new RaceIncidentRepository(connectionProvider);
    }

    public DatabaseConnectionProvider getConnectionProvider() {
        return connectionProvider;
    }

    public SeasonService getSeasonService() {
        return seasonService;
    }

    public RaceIncidentRepository getRaceIncidentRepository() {
        return raceIncidentRepository;
    }
}
