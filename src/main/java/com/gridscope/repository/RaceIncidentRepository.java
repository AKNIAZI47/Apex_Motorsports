package com.gridscope.repository;

import com.gridscope.model.Penalty;
import com.gridscope.model.RaceIncident;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class RaceIncidentRepository {

    private final DatabaseConnectionProvider connectionProvider;

    public RaceIncidentRepository(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public List<RaceIncident> getIncidentsByRaceId(int raceId) {
        String sql = "SELECT id, race_id, description, type FROM race_incidents WHERE race_id = ? ORDER BY id";
        List<RaceIncident> incidents = new ArrayList<>();
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, raceId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    RaceIncident incident = new RaceIncident();
                    incident.setId(resultSet.getInt("id"));
                    incident.setRaceId(resultSet.getInt("race_id"));
                    incident.setDescription(resultSet.getString("description"));
                    incident.setType(resultSet.getString("type"));
                    incidents.add(incident);
                }
                return incidents;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load incidents for race " + raceId, exception);
        }
    }

    public List<Penalty> getPenaltiesByRaceId(int raceId) {
        String sql = "SELECT id, race_id, driver_id, description FROM penalties WHERE race_id = ? ORDER BY id";
        List<Penalty> penalties = new ArrayList<>();
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, raceId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    Penalty penalty = new Penalty();
                    penalty.setId(resultSet.getInt("id"));
                    penalty.setRaceId(resultSet.getInt("race_id"));
                    penalty.setDriverId(resultSet.getString("driver_id"));
                    penalty.setDescription(resultSet.getString("description"));
                    penalties.add(penalty);
                }
                return penalties;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load penalties for race " + raceId, exception);
        }
    }
}
