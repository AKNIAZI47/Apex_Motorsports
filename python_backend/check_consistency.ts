import { ALL_CATEGORY_STANDINGS, CURRENT_YEAR } from '../src/data/allMotorsportStandings';

console.log(`Checking standings and race consistency for year ${CURRENT_YEAR} across all 9 disciplines...\n`);

for (const [catKey, seasons] of Object.entries(ALL_CATEGORY_STANDINGS)) {
  const season = seasons[CURRENT_YEAR] || Object.values(seasons)[0];
  console.log(`=== [${catKey}] (Year: ${season.year}) ===`);
  
  // 1. Check completed races and winners
  const completedRaces = season.races.filter(r => r.isCompleted);
  console.log(`Races: total=${season.races.length}, completed=${completedRaces.length}`);
  
  const raceWinsByDriver: Record<string, number> = {};
  completedRaces.forEach(r => {
    if (!r.winner) {
      console.warn(`  WARNING: Completed race "${r.raceName}" (Round ${r.round}) has NO winner!`);
    } else {
      raceWinsByDriver[r.winner.driverId] = (raceWinsByDriver[r.winner.driverId] || 0) + 1;
    }
  });

  // 2. Check driver standings wins vs race wins
  season.driverStandings.forEach(ds => {
    const expectedWins = raceWinsByDriver[ds.driver.driverId] || 0;
    if (ds.wins !== expectedWins) {
      console.warn(`  MISMATCH in driver "${ds.driver.fullName}" (${ds.driver.driverId}): standings.wins=${ds.wins} vs raceWins=${expectedWins}`);
    }
  });

  // Check if any race winner is not in driverStandings
  Object.keys(raceWinsByDriver).forEach(driverId => {
    const found = season.driverStandings.find(ds => ds.driver.driverId === driverId);
    if (!found) {
      console.warn(`  ERROR: Race winner driverId "${driverId}" not found in driverStandings!`);
    }
  });

  // 3. Check constructor standings vs driver points/wins
  const constructorPoints: Record<string, number> = {};
  const constructorWins: Record<string, number> = {};

  season.driverStandings.forEach(ds => {
    const ctorId = ds.constructors[0]?.constructorId || ds.driver.constructorName;
    constructorPoints[ctorId] = (constructorPoints[ctorId] || 0) + ds.points;
    constructorWins[ctorId] = (constructorWins[ctorId] || 0) + ds.wins;
  });

  season.constructorStandings.forEach(cs => {
    const ctorId = cs.constructor.constructorId;
    const calcPts = constructorPoints[ctorId];
    const calcWins = constructorWins[ctorId];
    
    if (calcPts !== undefined && cs.points !== calcPts) {
      console.warn(`  CTOR POINTS MISMATCH "${cs.constructor.name}" (${ctorId}): standings.points=${cs.points} vs sum(driverPoints)=${calcPts}`);
    }
    if (calcWins !== undefined && cs.wins !== calcWins) {
      console.warn(`  CTOR WINS MISMATCH "${cs.constructor.name}" (${ctorId}): standings.wins=${cs.wins} vs sum(driverWins)=${calcWins}`);
    }
  });

  // 4. Check sorting
  for (let i = 0; i < season.driverStandings.length - 1; i++) {
    if (season.driverStandings[i].points < season.driverStandings[i + 1].points) {
      console.warn(`  SORTING ERROR in driverStandings: pos ${i+1} (${season.driverStandings[i].points} pts) < pos ${i+2} (${season.driverStandings[i+1].points} pts)`);
    }
  }

  for (let i = 0; i < season.constructorStandings.length - 1; i++) {
    if (season.constructorStandings[i].points < season.constructorStandings[i + 1].points) {
      console.warn(`  SORTING ERROR in constructorStandings: pos ${i+1} (${season.constructorStandings[i].points} pts) < pos ${i+2} (${season.constructorStandings[i+1].points} pts)`);
    }
  }

  console.log(`Top Driver: ${season.driverStandings[0]?.driver.fullName} (${season.driverStandings[0]?.points} pts, ${season.driverStandings[0]?.wins} wins)`);
  console.log(`Top Constructor: ${season.constructorStandings[0]?.constructor.name} (${season.constructorStandings[0]?.points} pts, ${season.constructorStandings[0]?.wins} wins)`);
  console.log('');
}
