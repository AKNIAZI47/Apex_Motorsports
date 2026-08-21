package com.gridscope.repository;

import com.gridscope.model.RaceResult;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class RaceResultRepository {

    private final DatabaseConnectionProvider connectionProvider;

    public RaceResultRepository(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public void upsert(int raceId, RaceResult result) {
        String sql = """
                INSERT INTO race_results (race_id, driver_id, constructor_id, grid_position, finish_position, points, status, fastest_lap)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    race_id = VALUES(race_id),
                    driver_id = VALUES(driver_id),
                    constructor_id = VALUES(constructor_id),
                    grid_position = VALUES(grid_position),
                    finish_position = VALUES(finish_position),
                    points = VALUES(points),
                    status = VALUES(status),
                    fastest_lap = VALUES(fastest_lap)
                """;

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, raceId);
            statement.setString(2, result.getDriver() == null ? null : result.getDriver().getDriverId());
            statement.setString(3, result.getConstructor() == null ? null : result.getConstructor().getConstructorId());
            setNullableInteger(statement, 4, result.getGrid());
            setNullableInteger(statement, 5, result.getPosition());
            setNullableInteger(statement, 6, result.getPoints());
            statement.setString(7, result.getStatus());
            statement.setBoolean(8, result.getFastestLapRank() != null && "1".equals(result.getFastestLapRank()));
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to upsert race result", exception);
        }
    }

    public List<RaceResult> getAllByRaceId(int raceId) {
        String sql = "SELECT race_id, driver_id, constructor_id, grid_position, finish_position, points, status, fastest_lap FROM race_results WHERE race_id = ? ORDER BY finish_position";
        List<RaceResult> results = new ArrayList<>();

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, raceId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    results.add(mapRaceResult(resultSet));
                }
                return results;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load race results for race " + raceId, exception);
        }
    }

    private RaceResult mapRaceResult(ResultSet resultSet) throws SQLException {
        RaceResult result = new RaceResult();
        result.setGrid(readNullableInteger(resultSet, "grid_position"));
        result.setPosition(readNullableInteger(resultSet, "finish_position"));
        result.setPoints(readNullableInteger(resultSet, "points"));
        result.setStatus(resultSet.getString("status"));
        return result;
    }

    private Integer readNullableInteger(ResultSet resultSet, String column) throws SQLException {
        int value = resultSet.getInt(column);
        return resultSet.wasNull() ? null : value;
    }

    private void setNullableInteger(PreparedStatement statement, int index, Integer value) throws SQLException {
        if (value == null) {
            statement.setNull(index, java.sql.Types.INTEGER);
        } else {
            statement.setInt(index, value);
        }
    }
}