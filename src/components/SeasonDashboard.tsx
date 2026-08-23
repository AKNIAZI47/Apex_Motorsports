import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Flag, 
  Calendar, 
  Award, 
  ChevronRight, 
  Users, 
  Shield, 
  Sparkles, 
  Clock
} from 'lucide-react';
import { Race, MotorsportCategory } from '../types';
import { RaceDetailModal } from './RaceDetailModal';
import { getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';

const CATEGORIES_LIST: { id: MotorsportCategory; name: string; short: string; color: string }[] = [
  { id: 'F1', name: 'FIA Formula One', short: 'F1', color: '#e8002d' },
  { id: 'MOTOGP', name: 'MotoGP World Championship', short: 'MotoGP', color: '#dc2626' },
  { id: 'WSBK', name: 'FIM Superbike World Championship', short: 'WorldSBK', color: '#0284c7' },
  { id: 'WEC', name: 'FIA World Endurance (Hypercar)', short: 'WEC / 24H', color: '#0072ce' },
  { id: 'WRC', name: 'FIA World Rally Championship', short: 'WRC', color: '#ff9800' },
  { id: 'INDYCAR', name: 'NTT IndyCar Series', short: 'IndyCar', color: '#0284c7' },
  { id: 'SUPERCARS', name: 'Repco Supercars Championship', short: 'Supercars V8', color: '#2563eb' },
  { id: 'DTM', name: 'Deutsche Tourenwagen Masters', short: 'DTM GT3', color: '#e11d48' },
  { id: 'DRIFT', name: 'Formula DRIFT PRO Championship', short: 'Formula Drift', color: '#10b981' },
];

export const SeasonDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>('F1');
  const [activeTab, setActiveTab] = useState<'calendar' | 'drivers' | 'constructors'>('calendar');
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  // Season data for selected category
  const seasonData = useMemo(() => {
    return getCategoryStandings(selectedCategory, CURRENT_YEAR);
  }, [selectedCategory]);

  const activeCategoryInfo = MOTORSPORT_CATEGORIES[selectedCategory];
  const { races, driverStandings, constructorStandings, metrics } = seasonData;

  const nextUpcomingRace = useMemo(() => {
    return races.find((r) => !r.isCompleted) || races[0];
  }, [races]);

  return (
    <div className="space-y-6">
      {/* Category Discipline Selector Bar */}
      <div className="bg-[#121215] border border-white/10 rounded-2xl p-2.5 shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#e8002d]/20 to-white/10 border-[#ff1744] text-white shadow-lg shadow-[#ff1744]/10'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.short}</span>
              </button>
            );
          })}
        </div>
      </div>

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
              Live official timekeeping
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
                        {race.raceName}
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
                          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                            <Clock className="w-3 h-3 animate-pulse" />
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
                          <span className="text-xs text-slate-600 font-mono">
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
                      key={ds.driver.driverId}
                      className={`hover:bg-white/[0.04] transition-colors ${
                        isTop3 ? 'bg-white/[0.01]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${
                            ds.position === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : ds.position === 2
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                              : ds.position === 3
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                              : 'text-slate-400'
                          }`}
                        >
                          {ds.position}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1.5 h-8 rounded-full"
                            style={{
                              backgroundColor:
                                ds.driver.teamColor || ctor?.color || '#888',
                            }}
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{ds.driver.fullName}</span>
                              {ds.driver.permanentNumber && (
                                <span className="font-mono text-xs text-slate-500 font-normal">
                                  #{ds.driver.permanentNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              {ctor?.name || ds.driver.constructorName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs font-mono">
                        {ds.driver.nationality}
                      </td>
                      <td className="py-3.5 px-6 text-slate-200 font-semibold text-xs">
                        <div>{ctor?.name || ds.driver.constructorName}</div>
                        {ctor?.carModel && (
                          <div className="text-[10px] text-slate-500 font-mono font-normal">
                            {ctor.carModel}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                        {ds.wins}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-white text-base">
                        {ds.points} PTS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Constructors Standings View */
        <div className="bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#18181b] border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pos</th>
                  <th className="py-3.5 px-6">Team / Manufacturer</th>
                  <th className="py-3.5 px-4">Engine / Powertrain</th>
                  <th className="py-3.5 px-6">Principal / Base</th>
                  <th className="py-3.5 px-4 text-center">Wins</th>
                  <th className="py-3.5 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {constructorStandings.map((cs) => {
                  const isTop3 = cs.position <= 3;

                  return (
                    <tr
                      key={cs.constructor.constructorId}
                      className={`hover:bg-white/[0.04] transition-colors ${
                        isTop3 ? 'bg-white/[0.01]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${
                            cs.position === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : cs.position === 2
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                              : cs.position === 3
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                              : 'text-slate-400'
                          }`}
                        >
                          {cs.position}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-8 rounded"
                            style={{ backgroundColor: cs.constructor.color || '#888' }}
                          />
                          <div>
                            <div className="font-bold text-white text-base">
                              {cs.constructor.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {cs.constructor.nationality}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs font-mono">
                        <div>{cs.constructor.powerUnit || 'Competition Powertrain'}</div>
                        {cs.constructor.carModel && (
                          <div className="text-slate-500">{cs.constructor.carModel}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-slate-300 text-xs">
                        {cs.constructor.teamPrincipal || cs.constructor.nationality}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                        {cs.wins}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-white text-base">
                        {cs.points} PTS
                      </td>
                    </tr>
                  );
                })}
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
