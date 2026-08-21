package com.gridscope.repository;

import com.gridscope.model.Constructor;
import com.gridscope.model.StandingEntry;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ConstructorStandingRepository {

    private final DatabaseConnectionProvider connectionProvider;

    public ConstructorStandingRepository(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public void upsert(int seasonYear, StandingEntry standingEntry) {
        String sql = """
                INSERT INTO standings_constructor (season_year, constructor_id, points, position)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    points = VALUES(points),
                    position = VALUES(position)
                """;

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, seasonYear);
            statement.setString(2, standingEntry.getConstructors() == null || standingEntry.getConstructors().isEmpty()
                    ? null
                    : standingEntry.getConstructors().get(0).getConstructorId());
            setNullableDouble(statement, 3, standingEntry.getPoints());
            setNullableInteger(statement, 4, standingEntry.getPosition());
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to upsert constructor standing", exception);
        }
    }

    public List<StandingEntry> getAllBySeasonYear(int seasonYear) {
        String sql = """
                SELECT sc.position, sc.points, c.constructor_id, c.name, c.nationality
                FROM standings_constructor sc
                JOIN constructors c ON c.constructor_id = sc.constructor_id
                WHERE sc.season_year = ?
                ORDER BY sc.position
                """;
        List<StandingEntry> entries = new ArrayList<>();

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, seasonYear);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    entries.add(mapStandingEntry(resultSet));
                }
                return entries;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load constructor standings for year " + seasonYear, exception);
        }
    }

    public int countBySeasonYear(int seasonYear) {
        String sql = "SELECT COUNT(*) FROM standings_constructor WHERE season_year = ?";
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, seasonYear);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getInt(1);
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to count constructor standings for year " + seasonYear, exception);
        }
    }

    private StandingEntry mapStandingEntry(ResultSet resultSet) throws SQLException {
        StandingEntry standingEntry = new StandingEntry();
        standingEntry.setPoints(readNullableDouble(resultSet, "points"));
        standingEntry.setPosition(readNullableInteger(resultSet, "position"));

        Constructor constructor = new Constructor();
        constructor.setConstructorId(resultSet.getString("constructor_id"));
        constructor.setName(resultSet.getString("name"));
        constructor.setNationality(resultSet.getString("nationality"));
        standingEntry.setConstructors(List.of(constructor));
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