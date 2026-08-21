package com.gridscope.repository;

import com.gridscope.model.Season;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class SeasonRepository {

    private final DatabaseConnectionProvider connectionProvider;

    public SeasonRepository(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public void upsert(Season season) {
        String sql = """
                INSERT INTO seasons (year, champion_driver, champion_constructor)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    champion_driver = VALUES(champion_driver),
                    champion_constructor = VALUES(champion_constructor)
                """;

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, requireNonNull(season.getYear(), "season.year"));
            statement.setString(2, null);
            statement.setString(3, null);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to upsert season", exception);
        }
    }

    public List<Season> getAll() {
        String sql = "SELECT year, champion_driver, champion_constructor FROM seasons ORDER BY year";
        List<Season> seasons = new ArrayList<>();

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Season season = new Season();
                season.setYear(resultSet.getInt("year"));
                seasons.add(season);
            }
            return seasons;
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load seasons", exception);
        }
    }

    public Season getByYear(int year) {
        String sql = "SELECT year, champion_driver, champion_constructor FROM seasons WHERE year = ?";

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, year);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }
                Season season = new Season();
                season.setYear(resultSet.getInt("year"));
                return season;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load season " + year, exception);
        }
    }

    private int requireNonNull(Integer value, String fieldName) {
        if (value == null) {
            throw new DatabaseException(fieldName + " is required");
        }
        return value;
    }
}