package com.gridscope.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RaceResult {

    private Race race;
    private Integer number;
    private Integer position;
    private String positionText;
    private Integer points;
    private Integer grid;
    private String laps;
    private String status;
    private Driver driver;
    private Constructor constructor;
    private String time;
    private String fastestLapRank;
    private String fastestLapLap;
    private String fastestLapTime;
    private AverageSpeed averageSpeed;

    public RaceResult() {
    }

    public Race getRace() {
        return race;
    }

    public void setRace(Race race) {
        this.race = race;
    }

    public Integer getNumber() {
        return number;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public String getPositionText() {
        return positionText;
    }

    public void setPositionText(String positionText) {
        this.positionText = positionText;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getGrid() {
        return grid;
    }

    public void setGrid(Integer grid) {
        this.grid = grid;
    }

    public String getLaps() {
        return laps;
    }

    public void setLaps(String laps) {
        this.laps = laps;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public Constructor getConstructor() {
        return constructor;
    }

    public void setConstructor(Constructor constructor) {
        this.constructor = constructor;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getFastestLapRank() {
        return fastestLapRank;
    }

    public void setFastestLapRank(String fastestLapRank) {
        this.fastestLapRank = fastestLapRank;
    }

    public String getFastestLapLap() {
        return fastestLapLap;
    }

    public void setFastestLapLap(String fastestLapLap) {
        this.fastestLapLap = fastestLapLap;
    }

    public String getFastestLapTime() {
        return fastestLapTime;
    }

    public void setFastestLapTime(String fastestLapTime) {
        this.fastestLapTime = fastestLapTime;
    }

    public AverageSpeed getAverageSpeed() {
        return averageSpeed;
    }

    public void setAverageSpeed(AverageSpeed averageSpeed) {
        this.averageSpeed = averageSpeed;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AverageSpeed {

        private String units;
        private String speed;

        public AverageSpeed() {
        }

        public String getUnits() {
            return units;
        }

        public void setUnits(String units) {
            this.units = units;
        }

        public String getSpeed() {
            return speed;
        }

        public void setSpeed(String speed) {
            this.speed = speed;
        }
    }
}