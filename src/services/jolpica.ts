import { Driver, Constructor, DriverStanding, ConstructorStanding, Race, RaceResult, SeasonMetrics } from '../types';
import { CONSTRUCTORS, DRIVERS, SAMPLE_2026_CONSTRUCTOR_STANDINGS, SAMPLE_2026_RACES, SAMPLE_2026_STANDINGS, SAMPLE_RACE_RESULTS } from '../data/fallbackF1Data';
import { F1_STANDINGS } from '../data/categories/f1Standings';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';
const CACHE = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 mins

type ApiSyncListener = (status: { isSyncing: boolean; lastSynced: Date | null; error: string | null }) => void;
const listeners = new Set<ApiSyncListener>();
const syncErrors = new Set<string>();
let lastSyncedTime: Date | null = new Date();
let isCurrentlySyncing = false;
let lastSyncError: string | null = null;

function notifySyncListeners() {
  listeners.forEach(fn => fn({ isSyncing: isCurrentlySyncing, lastSynced: lastSyncedTime, error: lastSyncError }));
}

async function fetchFromOfficialApi<T>(endpoint: string, fallback: T, force = false): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  if (!force) {
    const cached = CACHE.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    CACHE.set(url, { timestamp: Date.now(), data });
    syncErrors.delete(url);
    lastSyncedTime = new Date();
    lastSyncError = null;
    return data;
  } catch (error: any) {
    console.warn(`[Jolpica/Ergast API] Fallback used for ${url}:`, error?.message || error);
    lastSyncError = error?.message || 'API connection fallback active';
    syncErrors.add(url);
    return fallback;
  }
}

export const JolpicaService = {
  subscribeSyncStatus(listener: ApiSyncListener) {
    listeners.add(listener);
    listener({ isSyncing: isCurrentlySyncing, lastSynced: lastSyncedTime, error: lastSyncError });
    return () => {
      listeners.delete(listener);
    };
  },

  async forceSyncOfficialApi(year = 2026): Promise<{ success: boolean; error?: string }> {
    isCurrentlySyncing = true;
    notifySyncListeners();
    try {
      CACHE.clear();
      syncErrors.clear();
      await Promise.all([
        this.getDriverStandings(year, true),
        this.getConstructorStandings(year, true),
        this.getRacesForSeason(year, true),
      ]);
      if (syncErrors.size > 0) {
        throw new Error(`Official API refresh failed for ${syncErrors.size} request(s)`);
      }
      isCurrentlySyncing = false;
      lastSyncedTime = new Date();
      lastSyncError = null;
      notifySyncListeners();
      return { success: true };
    } catch (err: any) {
      isCurrentlySyncing = false;
      lastSyncError = err?.message || 'Failed to sync with official API';
      notifySyncListeners();
      return { success: false, error: lastSyncError ?? undefined };
    }
  },

  getAvailableYears(): number[] {
    const latestYear = 2026;
    const years: number[] = [];
    for (let y = latestYear; y >= 1990; y--) {
      years.push(y);
    }
    return years;
  },

  async getRacesForSeason(year: number, force = false): Promise<Race[]> {
    const fallbackRaces = F1_STANDINGS[year]?.races || SAMPLE_2026_RACES;
    if (year === 2026) {
      // 2026 championship calendar is officially calibrated in F1_STANDINGS
      return fallbackRaces;
    }

    const endpoint = `/${year}.json?limit=100`;
    const fallback = { MRData: { RaceTable: { Races: [] } } };
    const raw: any = await fetchFromOfficialApi(endpoint, fallback, force);
    const racesRaw = raw?.MRData?.RaceTable?.Races;

    if (!racesRaw || racesRaw.length === 0) {
      return fallbackRaces;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    return racesRaw.map((r: any) => {
      const isCompleted = r.date < todayStr;
      return {
        season: parseInt(r.season, 10),
        round: parseInt(r.round, 10),
        url: r.url,
        raceName: r.raceName,
        circuitName: r.Circuit?.circuitName || 'Circuit',
        circuitId: r.Circuit?.circuitId || 'circuit',
        locality: r.Circuit?.Location?.locality,
        country: r.Circuit?.Location?.country,
        date: r.date,
        time: r.time,
        isCompleted,
        totalLaps: 55,
      };
    });
  },

  async getDriverStandings(year: number, force = false): Promise<DriverStanding[]> {
    const fallbackStandings = F1_STANDINGS[year]?.driverStandings || SAMPLE_2026_STANDINGS;
    const endpoint = year === 2026 ? `/current/driverStandings.json` : `/${year}/driverStandings.json`;
    const fallback = { MRData: { StandingsTable: { StandingsLists: [] } } };
    const raw: any = await fetchFromOfficialApi(endpoint, fallback, force);
    const standingsList = raw?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;

    if (!standingsList || standingsList.length === 0) {
      return fallbackStandings;
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
        driverNumber: parseInt(d.permanentNumber || entry.position, 10),
        permanentNumber: d.permanentNumber || entry.position,
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

  async getConstructorStandings(year: number, force = false): Promise<ConstructorStanding[]> {
    const fallbackStandings = F1_STANDINGS[year]?.constructorStandings || SAMPLE_2026_CONSTRUCTOR_STANDINGS;
    const endpoint = year === 2026 ? `/current/constructorStandings.json` : `/${year}/constructorStandings.json`;
    const fallback = { MRData: { StandingsTable: { StandingsLists: [] } } };
    const raw: any = await fetchFromOfficialApi(endpoint, fallback, force);
    const standingsList = raw?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;

    if (!standingsList || standingsList.length === 0) {
      return fallbackStandings;
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

  async getRaceResults(year: number, round: number, force = false): Promise<RaceResult[]> {
    const endpoint = year === 2026 ? `/current/${round}/results.json` : `/${year}/${round}/results.json`;
    const fallback = { MRData: { RaceTable: { Races: [] } } };
    const raw: any = await fetchFromOfficialApi(endpoint, fallback, force);
    const raceNode = raw?.MRData?.RaceTable?.Races?.[0];
    const resultsRaw = raceNode?.Results;

    if (!resultsRaw || resultsRaw.length === 0) {
      const knownRace = F1_STANDINGS[year]?.races.find((r) => r.round === round);
      if (knownRace && knownRace.winner) {
        const winnerId = knownRace.winner.driverId;
        const winnerDriver = DRIVERS[winnerId] || {
          driverId: winnerId,
          code: winnerId.substring(0, 3).toUpperCase(),
          driverNumber: 12,
          permanentNumber: '12',
          givenName: knownRace.winner.fullName.split(' ')[0],
          familyName: knownRace.winner.fullName.split(' ').slice(1).join(' '),
          fullName: knownRace.winner.fullName,
          nationality: 'International',
          teamColor: '#27F4D2',
          constructorName: knownRace.winner.constructorName,
        };
        const winnerConstructor = Object.values(CONSTRUCTORS).find((c) => c.name === knownRace.winner?.constructorName) || CONSTRUCTORS.mercedes;

        return [
          {
            number: winnerDriver.driverNumber || 12,
            position: 1,
            positionText: '1',
            points: 25,
            driver: winnerDriver,
            constructor: winnerConstructor,
            grid: 1,
            laps: knownRace.totalLaps || 66,
            status: 'Finished',
            time: { time: knownRace.winner.time || '1:31:14.225' },
          },
          ...SAMPLE_RACE_RESULTS.filter((r) => r.driver.driverId !== winnerId).slice(0, 9).map((r, idx) => ({
            ...r,
            position: idx + 2,
            positionText: String(idx + 2),
            laps: knownRace.totalLaps || 66,
          })),
        ];
      }
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
    const [driverStandings, constructorStandings, races] = await Promise.all([
      this.getDriverStandings(year),
      this.getConstructorStandings(year),
      this.getRacesForSeason(year),
    ]);

    const champDriver = driverStandings[0]?.driver.fullName || 'TBD';
    const champConstructor = constructorStandings[0]?.constructor.name || 'TBD';
    
    let topWinDriver = { name: champDriver, count: driverStandings[0]?.wins || 0 };
    for (const d of driverStandings) {
      if (d.wins > topWinDriver.count) {
        topWinDriver = { name: d.driver.fullName, count: d.wins };
      }
    }

    return {
      year,
      totalRaces: races.length || 23,
      completedRaces: races.filter(r => r.isCompleted).length || 11,
      championDriver: champDriver,
      championConstructor: champConstructor,
      mostWinsDriver: topWinDriver,
      leadingTeam: champConstructor,
    };
  },
};
