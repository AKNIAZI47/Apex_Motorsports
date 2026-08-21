package com.gridscope.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gridscope.model.Constructor;
import com.gridscope.model.Driver;
import com.gridscope.model.Race;
import com.gridscope.model.RaceResult;
import com.gridscope.model.StandingEntry;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class JolpicaClient {

    private static final String BASE_URL = "https://api.jolpi.ca/ergast/f1";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public JolpicaClient() {
        this(HttpClient.newBuilder()
                .connectTimeout(REQUEST_TIMEOUT)
                .build(),
                new ObjectMapper());
    }

    JolpicaClient(HttpClient httpClient, ObjectMapper objectMapper) {
        this.httpClient = Objects.requireNonNull(httpClient, "httpClient");
        this.objectMapper = Objects.requireNonNull(objectMapper, "objectMapper");
    }

    public List<Race> fetchRaces(int year) {
        try {
            JsonNode racesNode = readJson(endpoint(year, "races.json?limit=100"))
                    .path("MRData")
                    .path("RaceTable")
                    .path("Races");

            if (!racesNode.isArray()) {
                return Collections.emptyList();
            }

            List<Race> races = new ArrayList<>();
            for (JsonNode raceNode : racesNode) {
                races.add(toRace(raceNode));
            }
            return races;
        } catch (IOException | InterruptedException exception) {
            throw new JolpicaClientException("Failed to fetch races for year " + year, exception);
        }
    }

    public List<RaceResult> fetchResults(int year) {
        try {
            JsonNode resultsNode = readJson(endpoint(year, "results.json?limit=100"))
                    .path("MRData")
                    .path("RaceTable")
                    .path("Races");

            if (!resultsNode.isArray()) {
                return Collections.emptyList();
            }

            List<RaceResult> results = new ArrayList<>();
            for (JsonNode raceNode : resultsNode) {
                Race race = toRace(raceNode);
                JsonNode resultArray = raceNode.path("Results");
                if (!resultArray.isArray()) {
                    continue;
                }

                for (JsonNode resultNode : resultArray) {
                    RaceResult result = toRaceResult(resultNode);
                    result.setRace(race);
                    results.add(result);
                }
            }
            return results;
        } catch (IOException | InterruptedException exception) {
            throw new JolpicaClientException("Failed to fetch race results for year " + year, exception);
        }
    }

    public List<Driver> fetchDrivers(int year) {
        try {
            JsonNode driversNode = readJson(endpoint(year, "drivers.json?limit=100"))
                    .path("MRData")
                    .path("DriverTable")
                    .path("Drivers");

            if (!driversNode.isArray()) {
                return Collections.emptyList();
            }

            return objectMapper.readValue(driversNode.traverse(), new TypeReference<List<Driver>>() {
            });
        } catch (IOException | InterruptedException exception) {
            throw new JolpicaClientException("Failed to fetch drivers for year " + year, exception);
        }
    }

    public List<Constructor> fetchConstructors(int year) {
        try {
            JsonNode constructorsNode = readJson(endpoint(year, "constructors.json?limit=100"))
                    .path("MRData")
                    .path("ConstructorTable")
                    .path("Constructors");

            if (!constructorsNode.isArray()) {
                return Collections.emptyList();
            }

            return objectMapper.readValue(constructorsNode.traverse(), new TypeReference<List<Constructor>>() {
            });
        } catch (IOException | InterruptedException exception) {
            throw new JolpicaClientException("Failed to fetch constructors for year " + year, exception);
        }
    }

    public List<StandingEntry> fetchDriverStandings(int year) {
        try {
            JsonNode standingsListsNode = readJson(endpoint(year, "driverStandings.json"))
                    .path("MRData")
                    .path("StandingsTable")
                    .path("StandingsLists");

            if (!standingsListsNode.isArray() || standingsListsNode.isEmpty()) {
                return Collections.emptyList();
            }

            JsonNode driverStandingsNode = standingsListsNode.get(0).path("DriverStandings");
            if (!driverStandingsNode.isArray()) {
                return Collections.emptyList();
            }

            List<StandingEntry> standings = new ArrayList<>();
            for (JsonNode standingNode : driverStandingsNode) {
                standings.add(toStandingEntry(standingNode));
            }
            return standings;
        } catch (IOException | InterruptedException exception) {
            throw new JolpicaClientException("Failed to fetch driver standings for year " + year, exception);
        }
    }

    public List<StandingEntry> fetchConstructorStandings(int year) {
        try {
            JsonNode standingsListsNode = readJson(endpoint(year, "constructorStandings.json"))
                    .path("MRData")
                    .path("StandingsTable")
                    .path("StandingsLists");

            if (!standingsListsNode.isArray() || standingsListsNode.isEmpty()) {
                return Collections.emptyList();
            }

            JsonNode constructorStandingsNode = standingsListsNode.get(0).path("ConstructorStandings");
            if (!constructorStandingsNode.isArray()) {
                return Collections.emptyList();
            }

            List<StandingEntry> standings = new ArrayList<>();
            for (JsonNode standingNode : constructorStandingsNode) {
                StandingEntry entry = new StandingEntry();
                entry.setPosition(asInteger(standingNode.path("position").asText(null)));
                entry.setPositionText(textOrNull(standingNode.path("positionText")));
                entry.setPoints(asDouble(standingNode.path("points").asText(null)));
                entry.setWins(asInteger(standingNode.path("wins").asText(null)));
                Constructor constructor = objectMapper.convertValue(standingNode.path("Constructor"), Constructor.class);
                entry.setConstructors(List.of(constructor));
                standings.add(entry);
            }
            return standings;
        } catch (IOException | InterruptedException exception) {
            throw new JolpicaClientException("Failed to fetch constructor standings for year " + year, exception);
        }
    }

    private JsonNode readJson(URI uri) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(REQUEST_TIMEOUT)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new JolpicaClientException("Unexpected HTTP status " + response.statusCode() + " from " + uri);
        }

        try {
            return objectMapper.readTree(response.body());
        } catch (JsonProcessingException exception) {
            throw new JolpicaClientException("Failed to parse JSON from " + uri, exception);
        }
    }

    private URI endpoint(int year, String path) {
        return URI.create(BASE_URL + "/" + year + "/" + path);
    }

    private Race toRace(JsonNode raceNode) {
        Race race = new Race();
        race.setSeason(asInteger(raceNode.path("season").asText(null)));
        race.setRound(asInteger(raceNode.path("round").asText(null)));
        race.setUrl(textOrNull(raceNode.path("url")));
        race.setRaceName(textOrNull(raceNode.path("raceName")));
        race.setCircuitName(textOrNull(raceNode.path("Circuit").path("circuitName")));
        race.setDate(textOrNull(raceNode.path("date")));
        race.setTime(textOrNull(raceNode.path("time")));
        return race;
    }

    private RaceResult toRaceResult(JsonNode resultNode) {
        RaceResult result = new RaceResult();
        result.setNumber(asInteger(resultNode.path("number").asText(null)));
        result.setPosition(asInteger(resultNode.path("position").asText(null)));
        result.setPositionText(textOrNull(resultNode.path("positionText")));
        result.setPoints(asInteger(resultNode.path("points").asText(null)));
        result.setGrid(asInteger(resultNode.path("grid").asText(null)));
        result.setLaps(textOrNull(resultNode.path("laps")));
        result.setStatus(textOrNull(resultNode.path("status")));
        result.setDriver(objectMapper.convertValue(resultNode.path("Driver"), Driver.class));
        result.setConstructor(objectMapper.convertValue(resultNode.path("Constructor"), Constructor.class));
        result.setTime(textOrNull(resultNode.path("Time").path("time")));
        result.setFastestLapRank(textOrNull(resultNode.path("FastestLap").path("rank")));
        result.setFastestLapLap(textOrNull(resultNode.path("FastestLap").path("lap")));
        result.setFastestLapTime(textOrNull(resultNode.path("FastestLap").path("Time").path("time")));
        result.setAverageSpeed(objectMapper.convertValue(resultNode.path("FastestLap").path("AverageSpeed"), RaceResult.AverageSpeed.class));
        return result;
    }

    private StandingEntry toStandingEntry(JsonNode standingNode) {
        StandingEntry entry = new StandingEntry();
        entry.setPosition(asInteger(standingNode.path("position").asText(null)));
        entry.setPositionText(textOrNull(standingNode.path("positionText")));
        entry.setPoints(asDouble(standingNode.path("points").asText(null)));
        entry.setWins(asInteger(standingNode.path("wins").asText(null)));
        entry.setDriver(objectMapper.convertValue(standingNode.path("Driver"), Driver.class));
        entry.setConstructors(objectMapper.convertValue(standingNode.path("Constructors"), new TypeReference<List<Constructor>>() {
        }));
        return entry;
    }

    private Integer asInteger(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Integer.valueOf(value);
    }

    private Double asDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Double.valueOf(value);
    }

    private String textOrNull(JsonNode node) {
        return node == null || node.isMissingNode() || node.isNull() ? null : node.asText();
    }

    public static class JolpicaClientException extends RuntimeException {

        public JolpicaClientException(String message) {
            super(message);
        }

        public JolpicaClientException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}