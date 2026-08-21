package com.gridscope.repository;

import com.gridscope.model.Driver;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DriverRepository {

    private final DatabaseConnectionProvider connectionProvider;

    public DriverRepository(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public void upsert(Driver driver) {
        String sql = """
                INSERT INTO drivers (driver_id, full_name, nationality, driver_number, headshot_url)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    full_name = VALUES(full_name),
                    nationality = VALUES(nationality),
                    driver_number = VALUES(driver_number),
                    headshot_url = VALUES(headshot_url)
                """;

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, driver.getDriverId());
            statement.setString(2, fullName(driver));
            statement.setString(3, driver.getNationality());
            if (driver.getPermanentNumber() == null) {
                statement.setNull(4, java.sql.Types.INTEGER);
            } else {
                statement.setInt(4, driver.getPermanentNumber());
            }
            statement.setString(5, driver.getHeadshotUrl());
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to upsert driver", exception);
        }
    }

    public List<Driver> getAll() {
        String sql = "SELECT driver_id, full_name, nationality, driver_number, headshot_url FROM drivers ORDER BY full_name";
        List<Driver> drivers = new ArrayList<>();

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                drivers.add(mapDriver(resultSet));
            }
            return drivers;
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load drivers", exception);
        }
    }

    public void updateHeadshotUrl(String driverId, String headshotUrl) {
        String sql = "UPDATE drivers SET headshot_url = ? WHERE driver_id = ?";
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, headshotUrl);
            statement.setString(2, driverId);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to update headshot for driver " + driverId, exception);
        }
    }

    public List<Driver> getDriversForSeason(int seasonYear) {
        String sql = """
                SELECT d.driver_id, d.full_name, d.nationality, d.driver_number, d.headshot_url,
                       c.name AS team_name
                FROM drivers d
                JOIN (
                    SELECT rr.driver_id, rr.constructor_id
                    FROM race_results rr
                    JOIN races r ON r.race_id = rr.race_id
                    WHERE r.season_year = ?
                    GROUP BY rr.driver_id, rr.constructor_id
                    ORDER BY MAX(r.round) DESC
                ) latest ON latest.driver_id = d.driver_id
                LEFT JOIN constructors c ON c.constructor_id = latest.constructor_id
                GROUP BY d.driver_id, d.full_name, d.nationality, d.driver_number, d.headshot_url, c.name
                ORDER BY d.full_name
                """;
        List<Driver> drivers = new ArrayList<>();
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, seasonYear);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    Driver driver = mapDriver(resultSet);
                    driver.setTeamName(resultSet.getString("team_name"));
                    drivers.add(driver);
                }
                return drivers;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load drivers for season " + seasonYear, exception);
        }
    }

    public Driver getById(String driverId) {
        String sql = "SELECT driver_id, full_name, nationality, driver_number, headshot_url FROM drivers WHERE driver_id = ?";

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, driverId);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }
                return mapDriver(resultSet);
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load driver " + driverId, exception);
        }
    }

    private Driver mapDriver(ResultSet resultSet) throws SQLException {
        Driver driver = new Driver();
        driver.setDriverId(resultSet.getString("driver_id"));
        driver.setGivenName(resultSet.getString("full_name"));
        driver.setNationality(resultSet.getString("nationality"));
        driver.setHeadshotUrl(resultSet.getString("headshot_url"));
        int number = resultSet.getInt("driver_number");
        if (!resultSet.wasNull()) {
            driver.setPermanentNumber(number);
        }
        return driver;
    }

    private String fullName(Driver driver) {
        String givenName = driver.getGivenName();
        String familyName = driver.getFamilyName();
        if (givenName == null && familyName == null) {
            return null;
        }
        if (familyName == null || familyName.isBlank()) {
            return givenName;
        }
        if (givenName == null || givenName.isBlank()) {
            return familyName;
        }
        return givenName + " " + familyName;
    }
}