package com.gridscope.repository;

import com.gridscope.model.Constructor;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ConstructorRepository {

    private final DatabaseConnectionProvider connectionProvider;

    public ConstructorRepository(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public void upsert(Constructor constructor) {
        String sql = """
                INSERT INTO constructors (constructor_id, name, nationality)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    nationality = VALUES(nationality)
                """;
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, constructor.getConstructorId());
            statement.setString(2, constructor.getName());
            statement.setString(3, constructor.getNationality());
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to upsert constructor", exception);
        }
    }

    public Constructor getById(String constructorId) {
        String sql = "SELECT constructor_id, name, nationality FROM constructors WHERE constructor_id = ?";
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, constructorId);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }
                return mapConstructor(resultSet);
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load constructor " + constructorId, exception);
        }
    }

    public List<Constructor> getConstructorsForSeason(int seasonYear) {
        String sql = """
                SELECT DISTINCT c.constructor_id, c.name, c.nationality
                FROM constructors c
                JOIN race_results rr ON rr.constructor_id = c.constructor_id
                JOIN races r ON r.race_id = rr.race_id
                WHERE r.season_year = ?
                ORDER BY c.name
                """;
        List<Constructor> constructors = new ArrayList<>();
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, seasonYear);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    constructors.add(mapConstructor(resultSet));
                }
                return constructors;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load constructors for season " + seasonYear, exception);
        }
    }

    public List<Constructor> getAll() {
        String sql = "SELECT constructor_id, name, nationality FROM constructors ORDER BY name";
        List<Constructor> constructors = new ArrayList<>();
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                constructors.add(mapConstructor(resultSet));
            }
            return constructors;
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load constructors", exception);
        }
    }

    private Constructor mapConstructor(ResultSet resultSet) throws SQLException {
        Constructor c = new Constructor();
        c.setConstructorId(resultSet.getString("constructor_id"));
        c.setName(resultSet.getString("name"));
        c.setNationality(resultSet.getString("nationality"));
        return c;
    }
}
