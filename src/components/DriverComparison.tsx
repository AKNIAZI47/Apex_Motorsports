import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Award, Zap, Flag, Shield, Gauge, Activity, Compass, Flame } from 'lucide-react';
import { Driver, DriverStanding, MotorsportCategory } from '../types';
import { getAllMotorsportDrivers, ALL_CATEGORY_STANDINGS } from '../data/allMotorsportStandings';
import { JolpicaService } from '../services/jolpica';

const LEGENDS: Driver[] = [
  {
    driverId: 'michael_schumacher',
    permanentNumber: '7',
    code: 'MSC',
    givenName: 'Michael',
    familyName: 'Schumacher',
    fullName: 'Michael Schumacher',
    dateOfBirth: '1969-01-03',
    nationality: 'German',
    constructorName: 'Scuderia Ferrari / Benetton',
    teamColor: '#E8002D',
    championships: 7,
    podiums: 155,
    careerWins: 91,
    category: 'F1',
    biography: '7-time World Drivers Champion with 91 Grand Prix victories. Defined an era of dominant precision and tactical supremacy.',
  },
  {
    driverId: 'ayrton_senna',
    permanentNumber: '1',
    code: 'SEN',
    givenName: 'Ayrton',
    familyName: 'Senna',
    fullName: 'Ayrton Senna',
    dateOfBirth: '1960-03-21',
    nationality: 'Brazilian',
    constructorName: 'McLaren / Lotus / Williams',
    teamColor: '#FF8000',
    championships: 3,
    podiums: 80,
    careerWins: 41,
    category: 'F1',
    biography: 'Legendary 3-time World Champion renowned for qualifying mastery and wet-weather driving brilliance.',
  },
  {
    driverId: 'alain_prost',
    permanentNumber: '2',
    code: 'PRO',
    givenName: 'Alain',
    familyName: 'Prost',
    fullName: 'Alain Prost',
    dateOfBirth: '1955-02-24',
    nationality: 'French',
    constructorName: 'McLaren / Williams / Ferrari / Renault',
    teamColor: '#0093CC',
    championships: 4,
    podiums: 106,
    careerWins: 51,
    category: 'F1',
    biography: '4-time World Champion known as "The Professor" for smooth calculated race management.',
  },
  {
    driverId: 'sebastian_vettel',
    permanentNumber: '5',
    code: 'VET',
    givenName: 'Sebastian',
    familyName: 'Vettel',
    fullName: 'Sebastian Vettel',
    dateOfBirth: '1987-07-03',
    nationality: 'German',
    constructorName: 'Red Bull Racing / Ferrari / Aston Martin',
    teamColor: '#3671C6',
    championships: 4,
    podiums: 122,
    careerWins: 53,
    category: 'F1',
    biography: '4 consecutive World Championships (2010–2013) with Red Bull Racing and 53 career race victories.',
  },
];

interface Props {
  category?: MotorsportCategory;
  onSelectCategory?: (category: MotorsportCategory) => void;
}

export const DriverComparison: React.FC<Props> = ({ 
  category: propCategory,
  onSelectCategory 
}) => {
  const allDrivers = useMemo(() => {
    try {
      const motorsportDrivers = getAllMotorsportDrivers();
      const combined = [...motorsportDrivers];
      LEGENDS.forEach((legend) => {
        if (!combined.some((d) => d.driverId === legend.driverId)) {
          combined.push(legend);
        }
      });
      return combined;
    } catch {
      return LEGENDS;
    }
  }, []);

  const [filterCategory, setFilterCategory] = useState<string>(propCategory || 'F1');
  const [liveF1Standings, setLiveF1Standings] = useState<DriverStanding[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    JolpicaService.getCurrentF1Standings().then((snapshot) => {
      if (!cancelled && snapshot.live) setLiveF1Standings(snapshot.driverStandings);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (propCategory) {
      setFilterCategory(propCategory);
    }
  }, [propCategory]);
  
  const filteredDrivers = useMemo(() => {
    if (filterCategory === 'ALL') return allDrivers;
    return allDrivers.filter((d) => d.category === filterCategory);
  }, [allDrivers, filterCategory]);

  const [driverAId, setDriverAId] = useState<string>('antonelli');
  const [driverBId, setDriverBId] = useState<string>('max_verstappen');

  useEffect(() => {
    if (filteredDrivers.length >= 2) {
      const aInList = filteredDrivers.some((d) => d.driverId === driverAId);
      const bInList = filteredDrivers.some((d) => d.driverId === driverBId);
      if (!aInList || !bInList) {
        setDriverAId(filteredDrivers[0].driverId);
        setDriverBId(filteredDrivers[1].driverId);
      }
    }
  }, [filteredDrivers]);

  // Fallback safe resolution
  const driverA = useMemo(() => {
    return (
      filteredDrivers.find((d) => d.driverId === driverAId) ||
      filteredDrivers[0] ||
      allDrivers.find((d) => d.driverId === driverAId) ||
      allDrivers[0] ||
      LEGENDS[0]
    );
  }, [filteredDrivers, allDrivers, driverAId]);

  const driverB = useMemo(() => {
    return (
      filteredDrivers.find((d) => d.driverId === driverBId && d.driverId !== driverA.driverId) ||
      filteredDrivers.find((d) => d.driverId === driverBId) ||
      filteredDrivers[1] ||
      filteredDrivers[0] ||
      allDrivers.find((d) => d.driverId === driverBId) ||
      allDrivers[1] ||
      LEGENDS[1]
    );
  }, [filteredDrivers, allDrivers, driverBId, driverA.driverId]);

  // Compute stats safely for both drivers across all categories
  const getDriverStats = (driver: Driver) => {
    let seasonPoints = 0;
    let seasonWins = 0;
    let position = 0;

    const targetCat = (driver.category || filterCategory) as MotorsportCategory;
    const liveStanding = targetCat === 'F1'
      ? liveF1Standings?.find((s) => s.driver.driverId === driver.driverId)
      : undefined;
    const catData = ALL_CATEGORY_STANDINGS[targetCat]?.[2026] || ALL_CATEGORY_STANDINGS[targetCat]?.[2025];

    if (liveStanding) {
      seasonPoints = liveStanding.points || 0;
      seasonWins = liveStanding.wins || 0;
      position = liveStanding.position || 0;
    }
    
    if (!liveStanding && catData) {
      const standing = catData.driverStandings.find((s) => s.driver.driverId === driver.driverId);
      if (standing) {
        seasonPoints = standing.points || 0;
        seasonWins = standing.wins || 0;
        position = standing.position || 0;
      }
    } else {
      for (const catKey of Object.keys(ALL_CATEGORY_STANDINGS) as MotorsportCategory[]) {
        const data = ALL_CATEGORY_STANDINGS[catKey]?.[2026] || ALL_CATEGORY_STANDINGS[catKey]?.[2025];
        const standing = data?.driverStandings?.find((s) => s.driver.driverId === driver.driverId);
        if (standing) {
          seasonPoints = standing.points || 0;
          seasonWins = standing.wins || 0;
          position = standing.position || 0;
          break;
        }
      }
    }

    const careerTitles = driver.championships ?? 0;
    const careerPodiums = driver.podiums ?? (driver.careerWins ? driver.careerWins * 2 : (seasonWins * 2));
    const careerWins = driver.careerWins ?? seasonWins;

    return {
      titles: careerTitles,
      podiums: careerPodiums,
      careerWins,
      seasonPoints,
      seasonWins,
      position: position > 0 ? `#${position}` : '—',
    };
  };

  const statsA = useMemo(() => getDriverStats(driverA), [driverA, liveF1Standings]);
  const statsB = useMemo(() => getDriverStats(driverB), [driverB, liveF1Standings]);

  // Derived telemetry metrics for head-to-head radar comparisons
  const calculateAttributeScore = (driver: Driver, attr: string): number => {
    const wins = driver.careerWins || (driver.championships ? driver.championships * 10 : 2);
    const titles = driver.championships || 0;
    
    if (attr === 'Qualifying Pace') {
      if (driver.driverId === 'antonelli') return 96;
      if (driver.driverId === 'ayrton_senna') return 99;
      if (driver.driverId === 'max_verstappen') return 98;
      if (driver.driverId === 'hamilton') return 98;
      if (driver.driverId === 'leclerc') return 97;
      if (driver.driverId === 'norris') return 95;
      return Math.min(99, 84 + (wins % 14) + (titles * 3));
    }
    if (attr === 'Racecraft & Overtaking') {
      if (driver.driverId === 'antonelli') return 95;
      if (driver.driverId === 'michael_schumacher') return 99;
      if (driver.driverId === 'max_verstappen') return 99;
      if (driver.driverId === 'hamilton') return 98;
      if (driver.driverId === 'alonso') return 98;
      return Math.min(99, 85 + (wins % 12) + (titles * 3));
    }
    if (attr === 'Wet Weather Mastery') {
      if (driver.driverId === 'ayrton_senna') return 100;
      if (driver.driverId === 'michael_schumacher') return 99;
      if (driver.driverId === 'max_verstappen') return 98;
      if (driver.driverId === 'hamilton') return 98;
      if (driver.driverId === 'antonelli') return 94;
      return Math.min(99, 82 + (wins % 15) + (titles * 3));
    }
    if (attr === 'Tire & Energy Management') {
      if (driver.driverId === 'alain_prost') return 99;
      if (driver.driverId === 'perez') return 96;
      if (driver.driverId === 'hamilton') return 97;
      if (driver.driverId === 'max_verstappen') return 97;
      if (driver.driverId === 'antonelli') return 93;
      return Math.min(99, 83 + (wins % 13) + (titles * 3));
    }
    if (attr === 'Championship Consistency') {
      if (driver.driverId === 'alain_prost') return 99;
      if (driver.driverId === 'michael_schumacher') return 99;
      if (driver.driverId === 'max_verstappen') return 98;
      if (driver.driverId === 'antonelli') return 95;
      if (driver.driverId === 'hamilton') return 98;
      return Math.min(99, 80 + (titles * 4) + (wins % 10));
    }
    return 90;
  };

  const attributes = [
    'Qualifying Pace',
    'Racecraft & Overtaking',
    'Wet Weather Mastery',
    'Tire & Energy Management',
    'Championship Consistency',
  ];

  const primaryStats = [
    {
      label: 'World Championships',
      valA: statsA.titles,
      valB: statsB.titles,
      format: (v: number) => `${v} Titles`,
      icon: Trophy,
    },
    {
      label: 'Grand Prix / Race Wins',
      valA: statsA.careerWins,
      valB: statsB.careerWins,
      format: (v: number) => `${v} Wins`,
      icon: Flag,
    },
    {
      label: 'Career Podiums',
      valA: statsA.podiums,
      valB: statsB.podiums,
      format: (v: number) => `${v} Podiums`,
      icon: Award,
    },
    {
      label: 'Championship Points',
      valA: statsA.seasonPoints,
      valB: statsB.seasonPoints,
      format: (v: number) => `${v} PTS`,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Head-to-Head Driver & Champion Telemetry
            </h2>
          </div>

          {/* Discipline Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#18181b] p-1.5 rounded-xl border border-white/10">
            {(['ALL', 'F1', 'GTWORLD', 'MOTOGP', 'WSBK', 'WEC', 'WRC', 'INDYCAR', 'SUPERCARS', 'DTM', 'DRIFT'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  filterCategory === cat
                    ? 'bg-[#e8002d] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'GTWORLD' ? 'GT WORLD' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver A Selector */}
        <div className="bg-[#121215] border border-[#ff1744]/30 rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded bg-[#ff1744]/20 border border-[#ff1744]/40 text-[#ff4d6d] text-xs font-mono font-black uppercase">
              Driver 1
            </span>
          </div>
          <select
            value={driverA.driverId}
            onChange={(e) => setDriverAId(e.target.value)}
            className="flex-1 bg-[#18181b] text-white font-bold text-sm py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#ff1744] cursor-pointer truncate"
          >
            {filteredDrivers.map((d) => (
              <option key={`a-${d.category || 'all'}-${d.driverId}`} value={d.driverId} className="bg-[#18181b]">
                {d.permanentNumber || d.driverNumber ? `#${d.permanentNumber || d.driverNumber} ` : ''}{d.fullName} ({d.nationality}) — {d.constructorName || d.category || 'Motorsport'}
              </option>
            ))}
          </select>
        </div>

        {/* Driver B Selector */}
        <div className="bg-[#121215] border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-black uppercase">
              Driver 2
            </span>
          </div>
          <select
            value={driverB.driverId}
            onChange={(e) => setDriverBId(e.target.value)}
            className="flex-1 bg-[#18181b] text-white font-bold text-sm py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-400 cursor-pointer truncate"
          >
            {filteredDrivers.map((d) => (
              <option key={`b-${d.category || 'all'}-${d.driverId}`} value={d.driverId} className="bg-[#18181b]">
                {d.permanentNumber || d.driverNumber ? `#${d.permanentNumber || d.driverNumber} ` : ''}{d.fullName} ({d.nationality}) — {d.constructorName || d.category || 'Motorsport'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Driver Face-Off Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver A Card */}
        <div className="relative bg-[#121215] border border-[#ff1744]/20 rounded-2xl p-6 overflow-hidden shadow-xl">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: driverA.teamColor || '#e8002d' }}
          />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="px-2.5 py-1 rounded bg-[#ff1744]/20 border border-[#ff1744]/50 text-[#ff4d6d] text-xs font-mono font-black tracking-wider uppercase">
              DRIVER 1
            </span>
            {driverA.category && (
              <span className="text-xs font-mono text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded">
                {driverA.category === 'GTWORLD' ? 'GT WORLD' : driverA.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-black text-xl text-white shadow-lg border border-white/10"
              style={{ backgroundColor: driverA.teamColor || '#e8002d' }}
            >
              {driverA.code || driverA.familyName?.substring(0, 3).toUpperCase() || 'DRV'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/10 text-[#ff4d6d]">
                  #{driverA.permanentNumber || driverA.driverNumber || '—'}
                </span>
                <span className="text-xs text-slate-400 font-medium">{driverA.nationality}</span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{driverA.fullName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{driverA.constructorName || 'Professional Racing Driver'}</p>
            </div>
          </div>

          {driverA.biography && (
            <p className="text-xs text-slate-300 mt-4 line-clamp-2 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
              {driverA.biography}
            </p>
          )}
        </div>

        {/* Driver B Card */}
        <div className="relative bg-[#121215] border border-cyan-500/20 rounded-2xl p-6 overflow-hidden shadow-xl">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: driverB.teamColor || '#27f4d2' }}
          />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-black tracking-wider uppercase">
              DRIVER 2
            </span>
            {driverB.category && (
              <span className="text-xs font-mono text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded">
                {driverB.category === 'GTWORLD' ? 'GT WORLD' : driverB.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-black text-xl text-white shadow-lg border border-white/10"
              style={{ backgroundColor: driverB.teamColor || '#27f4d2' }}
            >
              {driverB.code || driverB.familyName?.substring(0, 3).toUpperCase() || 'DRV'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/10 text-cyan-300">
                  #{driverB.permanentNumber || driverB.driverNumber || '—'}
                </span>
                <span className="text-xs text-slate-400 font-medium">{driverB.nationality}</span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{driverB.fullName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{driverB.constructorName || 'Professional Racing Driver'}</p>
            </div>
          </div>

          {driverB.biography && (
            <p className="text-xs text-slate-300 mt-4 line-clamp-2 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
              {driverB.biography}
            </p>
          )}
        </div>
      </div>

      {/* Point-to-Point Numerical Statistics */}
      <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
          Honors & Championship Metrics
        </h3>

        {primaryStats.map((stat, i) => {
          const isAWinner = (stat.valA || 0) > (stat.valB || 0);
          const isBWinner = (stat.valB || 0) > (stat.valA || 0);
          const total = Math.max(1, (stat.valA || 0) + (stat.valB || 0));
          const percentA = Math.min(100, Math.max(0, Math.round(((stat.valA || 0) / total) * 100)));

          return (
            <div key={i} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className={`font-mono font-bold text-sm ${isAWinner ? 'text-[#ff4d6d]' : 'text-slate-300'}`}>
                  {stat.format(stat.valA || 0)}
                  {isAWinner && ' ★'}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                  <stat.icon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{stat.label}</span>
                </div>

                <div className={`font-mono font-bold text-sm ${isBWinner ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {isBWinner && '★ '}
                  {stat.format(stat.valB || 0)}
                </div>
              </div>

              {/* Progress Bar Distribution */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-[#e8002d] to-[#ff4d6d] transition-all duration-300"
                  style={{ width: `${percentA}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${100 - percentA}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Skill & Telemetry Attribute Benchmarks */}
      <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Telemetry Attribute Index (0 - 100)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Calibrated Pace Radar</span>
        </div>

        <div className="space-y-3">
          {attributes.map((attr) => {
            const scoreA = calculateAttributeScore(driverA, attr);
            const scoreB = calculateAttributeScore(driverB, attr);
            const isAWinner = scoreA > scoreB;
            const isBWinner = scoreB > scoreA;

            return (
              <div key={attr} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-mono font-bold ${isAWinner ? 'text-[#ff4d6d]' : 'text-slate-400'}`}>
                    {scoreA} / 100
                  </span>
                  <span className="text-xs font-semibold text-slate-300 uppercase">{attr}</span>
                  <span className={`font-mono font-bold ${isBWinner ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {scoreB} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex justify-end">
                    <div
                      className="h-full bg-[#ff1744] rounded-full transition-all duration-300"
                      style={{ width: `${scoreA}%` }}
                    />
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${scoreB}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
