package com.gridscope.repository;

import com.gridscope.model.Race;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class RaceRepository {

    private final DatabaseConnectionProvider connectionProvider;

    public RaceRepository(DatabaseConnectionProvider connectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public void upsert(Race race) {
        String sql = """
                INSERT INTO races (season_year, round, race_name, circuit_name, race_date)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    race_name = VALUES(race_name),
                    circuit_name = VALUES(circuit_name),
                    race_date = VALUES(race_date)
                """;

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            setNullableInteger(statement, 1, race.getSeason());
            setNullableInteger(statement, 2, race.getRound());
            statement.setString(3, race.getRaceName());
            statement.setString(4, race.getCircuitName());
            statement.setString(5, race.getDate());
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to upsert race", exception);
        }
    }

    public List<Race> getAll() {
        String sql = "SELECT season_year, round, race_name, circuit_name, race_date FROM races ORDER BY season_year, round";
        List<Race> races = new ArrayList<>();

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                races.add(mapRace(resultSet));
            }
            return races;
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load races", exception);
        }
    }

    public List<Race> getByYear(int year) {
        String sql = """
                SELECT race_id, season_year, round, race_name, circuit_name, race_date
                FROM races
                WHERE season_year = ?
                  AND race_id IN (
                      SELECT MIN(race_id) FROM races WHERE season_year = ? GROUP BY round
                  )
                ORDER BY round
                """;
        List<Race> races = new ArrayList<>();

        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, year);
            statement.setInt(2, year);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    races.add(mapRace(resultSet));
                }
                return races;
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load races for year " + year, exception);
        }
    }

    public Race getByYearAndRound(int year, int round) {
        String sql = "SELECT race_id, season_year, round, race_name, circuit_name, race_date FROM races WHERE season_year = ? AND round = ?";
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, year);
            statement.setInt(2, round);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }
                return mapRace(resultSet);
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to load race for year " + year + " round " + round, exception);
        }
    }

    public int countByYear(int year) {
        String sql = "SELECT COUNT(DISTINCT round) FROM races WHERE season_year = ?";
        try (Connection connection = connectionProvider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, year);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getInt(1);
            }
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to count races for year " + year, exception);
        }
    }

    private Race mapRace(ResultSet resultSet) throws SQLException {
        Race race = new Race();
        race.setRaceId(resultSet.getInt("race_id"));
        race.setSeason(resultSet.getInt("season_year"));
        int round = resultSet.getInt("round");
        if (!resultSet.wasNull()) {
            race.setRound(round);
        }
        race.setRaceName(resultSet.getString("race_name"));
        race.setCircuitName(resultSet.getString("circuit_name"));
        race.setDate(resultSet.getString("race_date"));
        return race;
    }

    private void setNullableInteger(PreparedStatement statement, int index, Integer value) throws SQLException {
        if (value == null) {
            statement.setNull(index, java.sql.Types.INTEGER);
        } else {
            statement.setInt(index, value);
        }
    }
}