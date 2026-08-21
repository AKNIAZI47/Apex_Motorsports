package com.gridscope.model;

import java.util.ArrayList;
import java.util.List;

public class SeasonSnapshot {

    private int year;
    private List<Race> races = new ArrayList<>();
    private List<StandingEntry> driverStandings = new ArrayList<>();
    private List<StandingEntry> constructorStandings = new ArrayList<>();

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public List<Race> getRaces() {
        return races;
    }

    public void setRaces(List<Race> races) {
        this.races = races;
    }

    public List<StandingEntry> getDriverStandings() {
        return driverStandings;
    }

    public void setDriverStandings(List<StandingEntry> driverStandings) {
        this.driverStandings = driverStandings;
    }

    public List<StandingEntry> getConstructorStandings() {
        return constructorStandings;
    }

    public void setConstructorStandings(List<StandingEntry> constructorStandings) {
        this.constructorStandings = constructorStandings;
    }
}
