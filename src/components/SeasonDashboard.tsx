import React, { useEffect, useState } from 'react';
import { Trophy, Flag, Calendar, Award, ChevronRight, TrendingUp, Users, Shield, RefreshCw, Radio, Sparkles, CheckCircle2 } from 'lucide-react';
import { Race, DriverStanding, ConstructorStanding, SeasonMetrics } from '../types';
import { JolpicaService } from '../services/jolpica';
import { RaceDetailModal } from './RaceDetailModal';
import { raceEventStore, CustomRaceEvent } from '../services/raceEventStore';
import { autoRaceSync, SyncStatus } from '../services/autoRaceSync';

export const SeasonDashboard: React.FC = () => {
  const years = JolpicaService.getAvailableYears();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'calendar' | 'drivers' | 'constructors'>('calendar');
  const [loading, setLoading] = useState(true);
  const [customEvents, setCustomEvents] = useState<CustomRaceEvent[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(autoRaceSync.getStatus());
  const [isForceSyncing, setIsForceSyncing] = useState(false);

  const [races, setRaces] = useState<Race[]>([]);
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [metrics, setMetrics] = useState<SeasonMetrics | null>(null);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const loadSeasonData = async (year: number) => {
    setLoading(true);
    try {
      const [racesData, driversData, constructorsData, metricsData] = await Promise.all([
        JolpicaService.getRacesForSeason(year),
        JolpicaService.getDriverStandings(year),
        JolpicaService.getConstructorStandings(year),
        JolpicaService.getSeasonMetrics(year),
      ]);

      setRaces(racesData);
      setDriverStandings(driversData);
      setConstructorStandings(constructorsData);
      setMetrics(metricsData);
    } catch (e) {
      console.error('Error loading season:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsForceSyncing(true);
    await autoRaceSync.forceSync();
    await loadSeasonData(selectedYear);
    setIsForceSyncing(false);
  };

  useEffect(() => {
    loadSeasonData(selectedYear);
    setCustomEvents(raceEventStore.getEvents('F1', selectedYear));

    const unsubEvents = raceEventStore.subscribe(() => {
      setCustomEvents(raceEventStore.getEvents('F1', selectedYear));
    });

    const unsubSync = autoRaceSync.subscribe(() => {
      setSyncStatus(autoRaceSync.getStatus());
    });

    return () => {
      unsubEvents();
      unsubSync();
    };
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      {/* Top Controls & Banner */}
      <div className="rounded-2xl border border-white/10 overflow-hidden glass-panel-elevated p-6 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e8002d]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-widest bg-[#e8002d] text-white uppercase">
                FIA Formula One
              </span>
              <span className="text-xs text-slate-400">World Championship</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              {selectedYear} Season Command Center
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-slate-400">
                Official standings, race calendar, and automated telemetry feeds
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-Sync Active ({syncStatus.nextScheduledCheckSeconds}s)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#16213e]/80 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Season:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-base focus:outline-none cursor-pointer pr-2"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[#0d0d1f] text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleManualSync}
              disabled={loading || isForceSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold font-mono cursor-pointer"
              title="Force Query Official Race Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || isForceSyncing ? 'animate-spin text-[#e8002d]' : ''}`} />
              <span>{isForceSyncing ? 'Syncing...' : 'Sync Feed'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Drivers Champion</span>
            </div>
            <div className="text-base font-bold text-white truncate">
              {metrics?.championDriver || 'Pending'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {driverStandings[0]?.points ? `${driverStandings[0].points} Pts` : 'Season active'}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-1">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Constructors Champion</span>
            </div>
            <div className="text-base font-bold text-white truncate">
              {metrics?.championConstructor || 'Pending'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {constructorStandings[0]?.points ? `${constructorStandings[0].points} Pts` : 'Season active'}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grand Prix Rounds</span>
            </div>
            <div className="text-base font-bold text-white">
              {metrics?.completedRaces} / {metrics?.totalRaces}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Scheduled Events</div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Top Race Winner</span>
            </div>
            <div className="text-base font-bold text-white truncate">
              {metrics?.mostWinsDriver?.name || 'TBD'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {metrics?.mostWinsDriver?.count || 0} Victories
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'calendar'
              ? 'bg-[#e8002d] text-white shadow-lg shadow-[#e8002d]/30'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Race Calendar & Results</span>
          <span className="ml-1 text-xs opacity-75">({races.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'drivers'
              ? 'bg-[#e8002d] text-white shadow-lg shadow-[#e8002d]/30'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Driver Standings</span>
          <span className="ml-1 text-xs opacity-75">({driverStandings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('constructors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'constructors'
              ? 'bg-[#e8002d] text-white shadow-lg shadow-[#e8002d]/30'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Constructor Standings</span>
          <span className="ml-1 text-xs opacity-75">({constructorStandings.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-[#0d0d1f]/60 rounded-xl border border-white/5">
          <div className="w-10 h-10 border-3 border-[#e8002d] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">
            Syncing telemetry & race records...
          </p>
        </div>
      ) : activeTab === 'calendar' ? (
        <div className="space-y-6">
          {/* Custom User-Logged Events for this season if any */}
          {customEvents.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-950/40 via-[#0d0d1f] to-teal-950/40 border border-emerald-500/30 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-black text-emerald-300 uppercase tracking-widest">
                    Newly Recorded {selectedYear} Race Events ({customEvents.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Real-time Logged
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customEvents.map((evt) => (
                  <div key={evt.id} className="bg-white/[0.03] border border-emerald-500/20 rounded-lg p-3 hover:border-emerald-400/40 transition-all">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span className="truncate">{evt.raceName}</span>
                      <span className="text-emerald-400 font-mono text-[10px]">{evt.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{evt.circuitName} • {evt.country}</div>
                    {evt.winner && (
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Winner:</span>
                        <span className="text-amber-300 font-bold font-mono">{evt.winner.fullName} ({evt.winner.team})</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar View */}
          <div className="bg-[#0d0d1f] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#16213e]/60 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Rnd</th>
                  <th className="py-3.5 px-6">Grand Prix</th>
                  <th className="py-3.5 px-6">Circuit</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6">Winner</th>
                  <th className="py-3.5 px-6">Fastest Lap</th>
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
                      {race.winner ? (
                        <div className="flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-white">{race.winner.fullName}</div>
                            <div className="text-xs text-slate-400">{race.winner.constructorName}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Upcoming</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      {race.fastestLap ? (
                        <div className="text-xs">
                          <span className="text-purple-300 font-semibold">{race.fastestLap.driverName}</span>
                          <span className="text-slate-500 font-mono ml-1.5">{race.fastestLap.lapTime}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#e8002d] group-hover:underline">
                        Results <ChevronRight className="w-3.5 h-3.5" />
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
        <div className="bg-[#0d0d1f] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#16213e]/60 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pos</th>
                  <th className="py-3.5 px-6">Driver</th>
                  <th className="py-3.5 px-4">Nationality</th>
                  <th className="py-3.5 px-6">Team</th>
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
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs ${
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
                            className="w-1.5 h-7 rounded-full"
                            style={{ backgroundColor: ds.driver.teamColor || ctor?.color || '#888' }}
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {ds.driver.fullName}
                              {ds.driver.driverNumber && (
                                <span className="text-xs font-mono text-slate-400">
                                  #{ds.driver.driverNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-slate-500 uppercase">
                              {ds.driver.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{ds.driver.nationality}</td>
                      <td className="py-3.5 px-6 text-slate-200 font-medium">
                        {ctor?.name || ds.driver.constructorName || 'Privateer'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {ds.wins > 0 ? (
                          <span className="text-amber-400">{ds.wins}</span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-lg text-white">
                        {ds.points} <span className="text-xs font-normal text-slate-500">PTS</span>
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
        <div className="bg-[#0d0d1f] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#16213e]/60 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pos</th>
                  <th className="py-3.5 px-6">Constructor</th>
                  <th className="py-3.5 px-4">Nationality</th>
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
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs ${
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
                            className="w-2.5 h-7 rounded-md"
                            style={{ backgroundColor: cs.constructor.color || '#888' }}
                          />
                          <div className="font-bold text-white text-base">
                            {cs.constructor.name}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{cs.constructor.nationality}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {cs.wins > 0 ? (
                          <span className="text-amber-400">{cs.wins}</span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-lg text-white">
                        {cs.points} <span className="text-xs font-normal text-slate-500">PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Race Classification Modal */}
      {selectedRace && (
        <RaceDetailModal race={selectedRace} onClose={() => setSelectedRace(null)} />
      )}
    </div>
  );
};
