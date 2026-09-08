import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  ChevronRight, 
  Users, 
  Shield, 
  Clock,
} from 'lucide-react';
import { Race, MotorsportCategory, DriverStanding, ConstructorStanding, CategorySeasonData } from '../types';
import { RaceDetailModal } from './RaceDetailModal';
import { getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { motorsportDailyLiveCollector } from '../services/motorsportDailyLiveCollector';

interface SeasonDashboardProps {
  category?: MotorsportCategory;
  onSelectCategory?: (category: MotorsportCategory) => void;
}

export const SeasonDashboard: React.FC<SeasonDashboardProps> = ({ 
  category: propCategory, 
  onSelectCategory 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>(propCategory || 'F1');
  const [activeTab, setActiveTab] = useState<'calendar' | 'drivers' | 'constructors'>('calendar');
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [updateTick, setUpdateTick] = useState(0);

  useEffect(() => {
    if (propCategory) {
      setSelectedCategory(propCategory);
    }
  }, [propCategory]);

  const handleCategorySelect = (catId: MotorsportCategory) => {
    setSelectedCategory(catId);
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  // Subscribe to automated daily live sync updates
  useEffect(() => {
    const handleUpdate = () => setUpdateTick((t) => t + 1);
    window.addEventListener('motorsport_data_updated', handleUpdate);
    const unsub = motorsportDailyLiveCollector.subscribe(handleUpdate);
    return () => {
      window.removeEventListener('motorsport_data_updated', handleUpdate);
      unsub();
    };
  }, []);

  // Season data for selected category
  const seasonData = useMemo(() => {
    return getCategoryStandings(selectedCategory, CURRENT_YEAR);
  }, [selectedCategory, updateTick]);

  const activeCategoryInfo = MOTORSPORT_CATEGORIES[selectedCategory];
  const { races, driverStandings, constructorStandings, metrics } = seasonData;

  const nextUpcomingRace = useMemo(() => {
    return races.find((r) => !r.isCompleted) || races[0];
  }, [races]);

  return (
    <div className="space-y-6">
      {/* Top Controls & Banner */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#121215] p-6 shadow-2xl relative">
        <div 
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-10"
          style={{ backgroundColor: activeCategoryInfo?.badgeColor || '#e8002d' }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-widest text-white uppercase"
                style={{ backgroundColor: activeCategoryInfo?.badgeColor || '#e8002d' }}
              >
                {activeCategoryInfo?.governingBody || 'FIA'} {selectedCategory}
              </span>
              <span className="text-xs text-slate-400">
                {activeCategoryInfo?.name || 'World Championship'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              {CURRENT_YEAR} {activeCategoryInfo?.name || selectedCategory} Standings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {activeCategoryInfo?.tagline}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Championship Leader</span>
            </div>
            <div className="text-base font-bold text-white truncate">
              {metrics?.championDriver || driverStandings[0]?.driver.fullName || 'Pending'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {driverStandings[0]?.points ? `${driverStandings[0].points} PTS • ${driverStandings[0].wins} Wins` : 'Active 2026'}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Leading Manufacturer</span>
            </div>
            <div className="text-base font-bold text-white truncate">
              {metrics?.championConstructor || constructorStandings[0]?.constructor.name || 'Pending'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {constructorStandings[0]?.points ? `${constructorStandings[0].points} PTS • ${constructorStandings[0].wins} Wins` : 'Active 2026'}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>2026 Season Progress</span>
            </div>
            <div className="text-base font-bold text-white">
              {races.filter((r) => r.isCompleted).length} / {races.length} Completed
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Next: {races.find((r) => !r.isCompleted)?.raceName || 'Season Completed'}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/10 mt-6 gap-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-[#e8002d] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Race Calendar & Results ({races.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'drivers'
                ? 'border-[#e8002d] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Driver Championship ({driverStandings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('constructors')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'constructors'
                ? 'border-[#e8002d] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Teams & Manufacturers ({constructorStandings.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'calendar' ? (
        <div className="space-y-4">
          <div className="bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#18181b] border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Rnd</th>
                    <th className="py-3.5 px-6">Event / Grand Prix</th>
                    <th className="py-3.5 px-6">Circuit / Venue</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-6">Winner / Classification</th>
                    <th className="py-3.5 px-6">Winning Time</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {races.map((race) => (
                    <tr
                      key={race.round}
                      onClick={() => setSelectedRace(race)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#e8002d]">
                        #{race.round.toString().padStart(2, '0')}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-white group-hover:text-[#ff4d6d] transition-colors">
                        <span>{race.raceName}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-300">
                        <div>{race.circuitName}</div>
                        <div className="text-xs text-slate-500">{race.locality}, {race.country}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        {race.date}
                      </td>
                      <td className="py-3.5 px-6">
                        {race.isCompleted && race.winner ? (
                          <div className="flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <div>
                              <div className="font-semibold text-white">{race.winner.fullName}</div>
                              <div className="text-xs text-slate-400">{race.winner.constructorName}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Upcoming Round
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        {race.winner?.time ? (
                          <div className="text-xs font-mono text-slate-300">
                            {race.winner.time}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">
                            {race.totalLaps ? `${race.totalLaps} Laps Scheduled` : 'Scheduled'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#e8002d] group-hover:underline">
                          Telemetry <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'drivers' ? (
        /* Driver Standings View */
        <div className="bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#18181b] border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pos</th>
                  <th className="py-3.5 px-6">Competitor</th>
                  <th className="py-3.5 px-4">Nationality</th>
                  <th className="py-3.5 px-6">Team / Machine</th>
                  <th className="py-3.5 px-4 text-center">Wins</th>
                  <th className="py-3.5 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {driverStandings.map((ds) => {
                  const isTop3 = ds.position <= 3;
                  const ctor = ds.constructors?.[0];

                  return (
                    <tr
                      key={`${ds.driver.driverId}-${ds.position}`}
                      className="hover:bg-white/[0.04] transition-colors font-medium"
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black font-mono ${
                            ds.position === 1
                              ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                              : ds.position === 2
                              ? 'bg-slate-300 text-black'
                              : ds.position === 3
                              ? 'bg-amber-700 text-white'
                              : 'text-slate-400 bg-white/5'
                          }`}
                        >
                          {ds.position}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-1.5 h-6 rounded-full"
                            style={{ backgroundColor: ds.driver.teamColor || '#ff1744' }}
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{ds.driver.fullName}</span>
                              <span className="text-[11px] font-mono text-slate-400">
                                #{ds.driver.driverNumber || ds.driver.permanentNumber}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              {ds.driver.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                        {ds.driver.nationality}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-medium text-slate-200">
                          {ctor?.name || ds.driver.constructorName}
                        </div>
                        {ctor?.carModel && (
                          <div className="text-xs text-slate-500 font-mono">
                            {ctor.carModel}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                        {ds.wins > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
                            {ds.wins} {ds.wins === 1 ? 'Win' : 'Wins'}
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-base text-white">
                        {ds.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Constructor Standings View */
        <div className="bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#18181b] border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pos</th>
                  <th className="py-3.5 px-6">Team / Manufacturer</th>
                  <th className="py-3.5 px-4">Base / Country</th>
                  <th className="py-3.5 px-6">Power Unit / Chassis</th>
                  <th className="py-3.5 px-4 text-center">Wins</th>
                  <th className="py-3.5 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {constructorStandings.map((cs) => (
                  <tr
                    key={cs.constructor.constructorId}
                    className="hover:bg-white/[0.04] transition-colors font-medium"
                  >
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black font-mono ${
                          cs.position === 1
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                            : cs.position === 2
                            ? 'bg-slate-300 text-black'
                            : cs.position === 3
                            ? 'bg-amber-700 text-white'
                            : 'text-slate-400 bg-white/5'
                        }`}
                      >
                        {cs.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-1.5 h-6 rounded-full"
                          style={{ backgroundColor: cs.constructor.color || '#ff1744' }}
                        />
                        <span className="font-bold text-white">
                          {cs.constructor.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                      {cs.constructor.nationality}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="text-slate-300 text-xs font-mono truncate max-w-xs">
                        {cs.constructor.powerUnit || 'Hybrid Turbo'}
                      </div>
                      {cs.constructor.carModel && (
                        <div className="text-xs text-slate-500 font-mono">
                          {cs.constructor.carModel}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {cs.wins > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
                          {cs.wins} {cs.wins === 1 ? 'Win' : 'Wins'}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-black text-base text-white">
                      {cs.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Race Detail Modal */}
      {selectedRace && (
        <RaceDetailModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
        />
      )}
    </div>
  );
};
