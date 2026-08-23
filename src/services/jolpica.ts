import { Driver, Constructor, DriverStanding, ConstructorStanding, Race, RaceResult, SeasonMetrics } from '../types';
import { CONSTRUCTORS, DRIVERS, SAMPLE_2026_CONSTRUCTOR_STANDINGS, SAMPLE_2026_RACES, SAMPLE_2026_STANDINGS, SAMPLE_RACE_RESULTS } from '../data/fallbackF1Data';
import { F1_STANDINGS } from '../data/categories/f1Standings';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';
const CACHE = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 mins

async function fetchWithCache<T>(url: string, fallback: T): Promise<T> {
  const cached = CACHE.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    CACHE.set(url, { timestamp: Date.now(), data });
    return data;
  } catch (error) {
    console.warn(`[JolpicaClient] Network fetch fallback for ${url}:`, error);
    return fallback;
  }
}

export const JolpicaService = {
  getAvailableYears(): number[] {
    const latestYear = 2026;
    const years: number[] = [];
    for (let y = latestYear; y >= 1990; y--) {
      years.push(y);
    }
    return years;
  },

  async getRacesForSeason(year: number): Promise<Race[]> {
    if (F1_STANDINGS[year]?.races) {
      return F1_STANDINGS[year].races;
    }
    if (year >= 2026) {
      return SAMPLE_2026_RACES;
    }

    const url = `${BASE_URL}/${year}.json?limit=100`;
    const fallback: any = { MRData: { RaceTable: { Races: [] } } };
    const raw: any = await fetchWithCache(url, fallback);
    const racesRaw = raw?.MRData?.RaceTable?.Races;

    if (!racesRaw || racesRaw.length === 0) {
      return SAMPLE_2026_RACES.map(r => ({
        ...r,
        season: year,
        date: r.date.replace('2026', String(year)),
      }));
    }

    return racesRaw.map((r: any) => ({
      season: r.season,
      round: parseInt(r.round, 10),
      url: r.url,
      raceName: r.raceName,
      circuitName: r.Circuit?.circuitName || 'Circuit',
      circuitId: r.Circuit?.circuitId || 'circuit',
      locality: r.Circuit?.Location?.locality,
      country: r.Circuit?.Location?.country,
      date: r.date,
      time: r.time,
      isCompleted: new Date(r.date) < new Date(),
    }));
  },

  async getDriverStandings(year: number): Promise<DriverStanding[]> {
    if (F1_STANDINGS[year]?.driverStandings) {
      return F1_STANDINGS[year].driverStandings;
    }
    if (year >= 2026) {
      return SAMPLE_2026_STANDINGS;
    }

    const url = `${BASE_URL}/${year}/driverStandings.json`;
    const fallback: any = { MRData: { StandingsTable: { StandingsLists: [] } } };
    const raw: any = await fetchWithCache(url, fallback);
    const standingsList = raw?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;

    if (!standingsList || standingsList.length === 0) {
      return SAMPLE_2026_STANDINGS;
    }

    return standingsList.map((entry: any) => {
      const d = entry.Driver;
      const c = entry.Constructors?.[0] || {};
      const knownConstructor = CONSTRUCTORS[c.constructorId] || {
        constructorId: c.constructorId || 'unknown',
        name: c.name || 'Privateer',
        nationality: c.nationality || 'International',
        color: '#666688',
      };

      const knownDriver = DRIVERS[d.driverId] || {
        driverId: d.driverId,
        code: d.code || d.familyName?.substring(0, 3)?.toUpperCase(),
        driverNumber: d.permanentNumber || entry.position,
        permanentNumber: d.permanentNumber,
        givenName: d.givenName,
        familyName: d.familyName,
        fullName: `${d.givenName} ${d.familyName}`,
        nationality: d.nationality,
        constructorId: knownConstructor.constructorId,
        constructorName: knownConstructor.name,
        teamColor: knownConstructor.color,
        headshotUrl: undefined,
      };

      return {
        position: parseInt(entry.position, 10),
        positionText: entry.positionText,
        points: parseFloat(entry.points),
        wins: parseInt(entry.wins, 10),
        driver: knownDriver,
        constructors: [knownConstructor],
      };
    });
  },

  async getConstructorStandings(year: number): Promise<ConstructorStanding[]> {
    if (F1_STANDINGS[year]?.constructorStandings) {
      return F1_STANDINGS[year].constructorStandings;
    }
    if (year >= 2026) {
      return SAMPLE_2026_CONSTRUCTOR_STANDINGS;
    }

    const url = `${BASE_URL}/${year}/constructorStandings.json`;
    const fallback: any = { MRData: { StandingsTable: { StandingsLists: [] } } };
    const raw: any = await fetchWithCache(url, fallback);
    const standingsList = raw?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;

    if (!standingsList || standingsList.length === 0) {
      return SAMPLE_2026_CONSTRUCTOR_STANDINGS;
    }

    return standingsList.map((entry: any) => {
      const c = entry.Constructor;
      const known = CONSTRUCTORS[c.constructorId] || {
        constructorId: c.constructorId,
        name: c.name,
        nationality: c.nationality,
        color: '#666688',
      };

      return {
        position: parseInt(entry.position, 10),
        positionText: entry.positionText,
        points: parseFloat(entry.points),
        wins: parseInt(entry.wins, 10),
        constructor: known,
      };
    });
  },

  async getRaceResults(year: number, round: number): Promise<RaceResult[]> {
    const url = `${BASE_URL}/${year}/${round}/results.json`;
    const fallback: any = { MRData: { RaceTable: { Races: [] } } };
    const raw: any = await fetchWithCache(url, fallback);
    const raceNode = raw?.MRData?.RaceTable?.Races?.[0];
    const resultsRaw = raceNode?.Results;

    if (!resultsRaw || resultsRaw.length === 0) {
      return SAMPLE_RACE_RESULTS;
    }

    return resultsRaw.map((res: any) => {
      const d = res.Driver;
      const c = res.Constructor;
      const knownConstructor = CONSTRUCTORS[c?.constructorId] || {
        constructorId: c?.constructorId || 'unknown',
        name: c?.name || 'Unknown Team',
        nationality: c?.nationality || '',
        color: '#888888',
      };

      const knownDriver = DRIVERS[d?.driverId] || {
        driverId: d?.driverId || 'driver',
        code: d?.code,
        driverNumber: res.number,
        givenName: d?.givenName || '',
        familyName: d?.familyName || '',
        fullName: `${d?.givenName || ''} ${d?.familyName || ''}`.trim(),
        nationality: d?.nationality || '',
        teamColor: knownConstructor.color,
        constructorName: knownConstructor.name,
      };

      return {
        number: res.number,
        position: isNaN(parseInt(res.position, 10)) ? res.position : parseInt(res.position, 10),
        positionText: res.positionText,
        points: parseFloat(res.points || '0'),
        driver: knownDriver,
        constructor: knownConstructor,
        grid: parseInt(res.grid, 10) || 0,
        laps: parseInt(res.laps, 10) || 0,
        status: res.status || 'Finished',
        time: res.Time ? { millis: res.Time.millis, time: res.Time.time } : undefined,
        fastestLap: res.FastestLap
          ? {
              rank: res.FastestLap.rank,
              lap: res.FastestLap.lap,
              time: { time: res.FastestLap.Time?.time },
              averageSpeed: res.FastestLap.AverageSpeed
                ? { units: res.FastestLap.AverageSpeed.units, speed: res.FastestLap.AverageSpeed.speed }
                : undefined,
            }
          : undefined,
      };
    });
  },

  async getDriversForSeason(year: number): Promise<Driver[]> {
    const standings = await this.getDriverStandings(year);
    if (standings.length > 0) {
      return standings.map(s => s.driver);
    }
    return Object.values(DRIVERS);
  },

  async getConstructorsForSeason(year: number): Promise<Constructor[]> {
    const standings = await this.getConstructorStandings(year);
    if (standings.length > 0) {
      return standings.map(s => s.constructor);
    }
    return Object.values(CONSTRUCTORS);
  },

  async getSeasonMetrics(year: number): Promise<SeasonMetrics> {
    if (F1_STANDINGS[year]?.metrics) {
      return F1_STANDINGS[year].metrics;
    }

    const [driverStandings, constructorStandings, races] = await Promise.all([
      this.getDriverStandings(year),
      this.getConstructorStandings(year),
      this.getRacesForSeason(year),
    ]);

    const champDriver = driverStandings[0]?.driver.fullName || 'TBD';
    const champConstructor = constructorStandings[0]?.constructor.name || 'TBD';
    
    // Find driver with most wins
    let topWinDriver = { name: champDriver, count: driverStandings[0]?.wins || 0 };
    for (const d of driverStandings) {
      if (d.wins > topWinDriver.count) {
        topWinDriver = { name: d.driver.fullName, count: d.wins };
      }
    }

    return {
      year,
      totalRaces: races.length || 24,
      completedRaces: races.filter(r => r.isCompleted).length || races.length,
      championDriver: champDriver,
      championConstructor: champConstructor,
      mostWinsDriver: topWinDriver,
      leadingTeam: champConstructor,
    };
  },
};
