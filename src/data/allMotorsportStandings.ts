import { Driver, Constructor, DriverStanding, ConstructorStanding, Race, MotorsportCategory, SeasonMetrics } from '../types';
import { F1_STANDINGS } from './categories/f1Standings';
import { MOTOGP_STANDINGS } from './categories/motogpStandings';
import { WSBK_STANDINGS } from './categories/wsbkStandings';
import { WEC_STANDINGS } from './categories/wecStandings';
import { WRC_STANDINGS } from './categories/wrcStandings';
import { INDYCAR_STANDINGS } from './categories/indycarStandings';
import { SUPERCARS_STANDINGS } from './categories/supercarsStandings';
import { DTM_STANDINGS } from './categories/dtmStandings';
import { DRIFT_STANDINGS } from './categories/driftStandings';
import { GTWORLD_STANDINGS } from './categories/gtWorldStandings';

export const CURRENT_YEAR = 2026;

export interface CategorySeasonData {
  category: MotorsportCategory;
  year: number;
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  races: Race[];
  metrics: SeasonMetrics;
}

export const ALL_CATEGORY_STANDINGS: Record<MotorsportCategory, Record<number, CategorySeasonData>> = {
  F1: F1_STANDINGS,
  GTWORLD: GTWORLD_STANDINGS,
  MOTOGP: MOTOGP_STANDINGS,
  WSBK: WSBK_STANDINGS,
  WEC: WEC_STANDINGS,
  WRC: WRC_STANDINGS,
  INDYCAR: INDYCAR_STANDINGS,
  SUPERCARS: SUPERCARS_STANDINGS,
  DTM: DTM_STANDINGS,
  DRIFT: DRIFT_STANDINGS,
};

// Purge any corrupted legacy cache from previous turns
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    localStorage.removeItem('gridscope_standings_MOTOGP_2026');
    localStorage.removeItem('gridscope_motorsport_standings_cache_v2');
    localStorage.removeItem('gridscope_motorsport_daily_sync_v2');
    const legacyCats = ['F1', 'MOTOGP', 'WSBK', 'WEC', 'WRC', 'INDYCAR', 'SUPERCARS', 'DTM', 'GTWORLD', 'DRIFT'];
    legacyCats.forEach((c) => {
      localStorage.removeItem(`gridscope_official_standings_v5_${c}_2026`);
      localStorage.removeItem(`gridscope_official_standings_v6_${c}_2026`);
      localStorage.removeItem(`gridscope_official_standings_v7_${c}_2026`);
      localStorage.removeItem(`gridscope_official_standings_v8_${c}_2026`);
    });
  } catch {
    // ignore
  }
}

/**
 * Universal Data Fetcher for active championship motorsport category standings
 */
export function getCategoryStandings(category: MotorsportCategory, year: number = CURRENT_YEAR): CategorySeasonData {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const key = `gridscope_official_standings_v9_${category}_${year}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.driverStandings) && parsed.driverStandings.length > 1) {
          // Mathematical sanity: position 1 must have >= points than position 2
          const p1 = parsed.driverStandings[0]?.points || 0;
          const p2 = parsed.driverStandings[1]?.points || 0;
          // Ensure F1 round 14 & 15 have their verified winners
          const r14 = parsed.races?.find((r: any) => r.round === 14);
          const r15 = parsed.races?.find((r: any) => r.round === 15);
          const isF1Valid = category !== 'F1' || (r14?.winner?.driverId === 'antonelli' && r15?.winner?.driverId === 'russell');

          if (p1 >= p2 && isF1Valid) {
            return parsed;
          } else {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {
      // fallback
    }
  }

  const catData = ALL_CATEGORY_STANDINGS[category];
  let result: CategorySeasonData;

  if (catData && catData[year]) {
    result = catData[year];
  } else if (catData) {
    const availableYears = Object.keys(catData).map(Number);
    const target = availableYears.includes(CURRENT_YEAR) ? CURRENT_YEAR : availableYears[0];
    result = catData[target] || catData[2026];
  } else {
    result = ALL_CATEGORY_STANDINGS.F1[CURRENT_YEAR];
  }

  // Ensure strict descending points invariant and sequential positions
  if (result && Array.isArray(result.driverStandings)) {
    result.driverStandings.sort((a, b) => b.points - a.points);
    result.driverStandings.forEach((st, idx) => {
      st.position = idx + 1;
      st.positionText = String(idx + 1);
    });
  }

  return result;
}

/**
 * Return all drivers across all 9 disciplines for universal driver profiles
 */
export function getAllMotorsportDrivers(): Driver[] {
  const drivers: Driver[] = [];
  const seen = new Set<string>();

  Object.values(ALL_CATEGORY_STANDINGS).forEach((yearsObj) => {
    Object.values(yearsObj).forEach((seasonData) => {
      seasonData.driverStandings.forEach((st) => {
        if (!seen.has(st.driver.driverId)) {
          seen.add(st.driver.driverId);
          drivers.push({ ...st.driver, category: seasonData.category });
        }
      });
    });
  });

  return drivers;
}

/**
 * Return all constructors across all disciplines
 */
export function getAllMotorsportConstructors(): Constructor[] {
  const constructors: Constructor[] = [];
  const seen = new Set<string>();

  Object.values(ALL_CATEGORY_STANDINGS).forEach((yearsObj) => {
    Object.values(yearsObj).forEach((seasonData) => {
      seasonData.constructorStandings.forEach((st) => {
        if (!seen.has(st.constructor.constructorId)) {
          seen.add(st.constructor.constructorId);
          constructors.push({ ...st.constructor, category: seasonData.category });
        }
      });
    });
  });

  return constructors;
}

/**
 * Live announcement addition: Updates active season standings dynamically when new race results arrive
 */
export function announceRaceResult(
  category: MotorsportCategory,
  roundNumber: number,
  winnerDriverId: string,
  winningTime: string
): CategorySeasonData {
  const seasonData = getCategoryStandings(category, CURRENT_YEAR);
  const targetRace = seasonData.races.find((r) => r.round === roundNumber);
  const driverStanding = seasonData.driverStandings.find((s) => s.driver.driverId === winnerDriverId);

  if (targetRace && driverStanding) {
    targetRace.isCompleted = true;
    targetRace.winner = {
      driverId: driverStanding.driver.driverId,
      fullName: driverStanding.driver.fullName,
      constructorName: driverStanding.driver.constructorName || 'Factory Team',
      time: winningTime,
    };
    driverStanding.wins += 1;
    driverStanding.points += 25;
    driverStanding.driver.podiums = (driverStanding.driver.podiums || 0) + 1;
    driverStanding.driver.careerWins = (driverStanding.driver.careerWins || 0) + 1;

    // Recalculate constructor points
    const ctorStanding = seasonData.constructorStandings.find(
      (c) => c.constructor.name === driverStanding.driver.constructorName ||
             c.constructor.constructorId === driverStanding.constructors[0]?.constructorId
    );
    if (ctorStanding) {
      ctorStanding.points += 25;
      ctorStanding.wins += 1;
    }

    // Re-sort standings
    seasonData.driverStandings.sort((a, b) => b.points - a.points);
    seasonData.driverStandings.forEach((s, idx) => {
      s.position = idx + 1;
      s.positionText = String(idx + 1);
    });

    seasonData.constructorStandings.sort((a, b) => b.points - a.points);
    seasonData.constructorStandings.forEach((c, idx) => {
      c.position = idx + 1;
      c.positionText = String(idx + 1);
    });

    seasonData.metrics.completedRaces = seasonData.races.filter((r) => r.isCompleted).length;
    if (seasonData.driverStandings[0]) {
      seasonData.metrics.championDriver = `${seasonData.driverStandings[0].driver.fullName} (${seasonData.driverStandings[0].driver.constructorName})`;
    }
  }

  return seasonData;
}
