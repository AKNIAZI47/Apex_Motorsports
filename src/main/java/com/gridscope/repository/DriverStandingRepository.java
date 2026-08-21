package com.gridscope.repository;

import com.gridscope.model.Constructor;
import com.gridscope.model.Driver;
import com.gridscope.model.StandingEntry;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DriverStandingRepository {

    private final DatabaseConnectionProvider connectionProvider;

    public DriverStandingRepository(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public void upsert(int seasonYear, StandingEntry standingEntry) {
        String sql = """
                INSERT INTO standings_driver (season_year, driver_id, points, position)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    points = VALUES(points),
                    position = VALUES(position)
                """;

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, seasonYear);
            statement.setString(2, standingEntry.getDriver() == null ? null : standingEntry.getDriver().getDriverId());
            setNullableDouble(statement, 3, standingEntry.getPoints());
            setNullableInteger(statement, 4, standingEntry.getPosition());
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to upsert driver standing", exception);
        }
    }

    public List<StandingEntry> getAllBySeasonYear(int seasonYear) {
        String sql = """
                SELECT sd.position, sd.points, d.driver_id, d.full_name, d.nationality, d.driver_number,
                       c.constructor_id, c.name AS constructor_name
                FROM standings_driver sd
                JOIN drivers d ON d.driver_id = sd.driver_id
                LEFT JOIN (
                    SELECT rr.driver_id, rr.constructor_id
                    FROM race_results rr
                    JOIN races r ON r.race_id = rr.race_id
                    WHERE r.season_year = ?
                    GROUP BY rr.driver_id, rr.constructor_id
                ) latest ON latest.driver_id = sd.driver_id
                LEFT JOIN constructors c ON c.constructor_id = latest.constructor_id
                WHERE sd.season_year = ?
                ORDER BY sd.position
                """;
        List<StandingEntry> entries = new ArrayList<>();

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, seasonYear);
            statement.setInt(2, seasonYear);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    entries.add(mapStandingEntry(resultSet));
                }
                return entries;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load driver standings for year " + seasonYear, exception);
        }
    }

    public int countBySeasonYear(int seasonYear) {
        String sql = "SELECT COUNT(*) FROM standings_driver WHERE season_year = ?";
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, seasonYear);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getInt(1);
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to count driver standings for year " + seasonYear, exception);
        }
    }

    private StandingEntry mapStandingEntry(ResultSet resultSet) throws SQLException {
        StandingEntry standingEntry = new StandingEntry();
        standingEntry.setPoints(readNullableDouble(resultSet, "points"));
        standingEntry.setPosition(readNullableInteger(resultSet, "position"));

        Driver driver = new Driver();
        driver.setDriverId(resultSet.getString("driver_id"));
        driver.setGivenName(resultSet.getString("full_name"));
        driver.setNationality(resultSet.getString("nationality"));
        int number = resultSet.getInt("driver_number");
        if (!resultSet.wasNull()) {
            driver.setPermanentNumber(number);
        }
        standingEntry.setDriver(driver);

        String constructorId = resultSet.getString("constructor_id");
        if (constructorId != null) {
            Constructor constructor = new Constructor();
            constructor.setConstructorId(constructorId);
            constructor.setName(resultSet.getString("constructor_name"));
            standingEntry.setConstructors(List.of(constructor));
        }
        return standingEntry;
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

    private Double readNullableDouble(ResultSet resultSet, String column) throws SQLException {
        double value = resultSet.getDouble(column);
        return resultSet.wasNull() ? null : value;
    }

    private void setNullableDouble(PreparedStatement statement, int index, Double value) throws SQLException {
        if (value == null) {
            statement.setNull(index, java.sql.Types.DECIMAL);
        } else {
            statement.setDouble(index, value);
        }
    }
}