import React, { useEffect, useState } from 'react';
import { Trophy, Award, Calendar, Flag, User, Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';
import { Driver, DriverStanding } from '../types';
import { JolpicaService } from '../services/jolpica';
import { DRIVERS } from '../data/fallbackF1Data';

interface Props {
  initialDriver?: Driver | null;
}

export const DriverProfile: React.FC<Props> = ({ initialDriver }) => {
  const years = JolpicaService.getAvailableYears();
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver>(
    initialDriver || DRIVERS.max_verstappen
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialDriver) {
      setSelectedDriver(initialDriver);
    }
  }, [initialDriver]);

  useEffect(() => {
    setLoading(true);
    JolpicaService.getDriverStandings(selectedYear).then((data) => {
      setStandings(data);
      if (data.length > 0) {
        // If current selected driver is not in the list, choose the championship leader
        const found = data.find((s) => s.driver.driverId === selectedDriver?.driverId);
        if (!found) {
          setSelectedDriver(data[0].driver);
        }
      }
      setLoading(false);
    });
  }, [selectedYear]);

  const currentStanding = standings.find(
    (s) => s.driver.driverId === selectedDriver.driverId
  );
  const teamColor = selectedDriver.teamColor || '#e8002d';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#121228] to-[#0d0d1f] border border-white/10 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#e8002d] tracking-widest uppercase">
            <User className="w-3.5 h-3.5" />
            <span>Driver Dossier & Analytics</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            Driver Performance Profiles
          </h2>
          <p className="text-sm text-slate-400">
            Career statistics, championship standing, telemetry performance, and biography
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#16213e] border border-white/10 rounded-lg px-3 py-1.5 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase">Season:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#0d0d1f]">
                {y} Season
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Split: List on Left, Profile on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Driver List (Left 4 columns) */}
        <div className="md:col-span-4 bg-[#0d0d1f] border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-[720px]">
          <div className="p-3.5 bg-[#16213e]/60 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
            {selectedYear} Driver Lineup ({standings.length})
          </div>

          <div className="overflow-y-auto divide-y divide-white/5 flex-1">
            {standings.map((s) => {
              const isSelected = s.driver.driverId === selectedDriver.driverId;
              const d = s.driver;
              const c = s.constructors?.[0];

              return (
                <button
                  key={d.driverId}
                  onClick={() => setSelectedDriver(d)}
                  className={`w-full text-left p-3.5 flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-white/10 border-l-4 border-[#e8002d]'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-mono text-xs text-slate-400 font-bold">
                      {s.position}
                    </span>
                    <div
                      className="w-1.5 h-6 rounded-full"
                      style={{ backgroundColor: d.teamColor || c?.color || '#888' }}
                    />
                    <div>
                      <div className="font-bold text-sm text-white">{d.fullName}</div>
                      <div className="text-xs text-slate-400">{c?.name || d.constructorName}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-white">{s.points} pts</div>
                    {s.wins > 0 && (
                      <div className="text-[10px] text-amber-400 font-bold">{s.wins} wins</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver Detail Pane (Right 8 columns) */}
        <div className="md:col-span-8 space-y-6">
          {/* Hero Card */}
          <div className="relative bg-[#0d0d1f] border border-white/10 rounded-xl p-6 sm:p-8 overflow-hidden">
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none -mr-20 -mt-20"
              style={{ backgroundColor: teamColor }}
            />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {/* Photo */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-2xl blur-md opacity-30"
                  style={{ backgroundColor: teamColor }}
                />
                {selectedDriver.headshotUrl ? (
                  <img
                    src={selectedDriver.headshotUrl}
                    alt={selectedDriver.fullName}
                    className="w-full h-full object-contain relative z-10 drop-shadow-xl"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-2xl flex items-center justify-center text-3xl font-mono font-black border-2 border-white/10 text-white shadow-2xl"
                    style={{ backgroundColor: `${teamColor}44`, borderColor: teamColor }}
                  >
                    {selectedDriver.code || selectedDriver.familyName?.substring(0, 3)?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Driver Key Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <span
                    className="px-2.5 py-0.5 rounded text-xs font-bold font-mono text-white shadow"
                    style={{ backgroundColor: teamColor }}
                  >
                    #{selectedDriver.driverNumber || selectedDriver.permanentNumber || '—'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-white/10 text-slate-200">
                    {selectedDriver.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-white/5 text-slate-300">
                    {selectedDriver.nationality}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {selectedDriver.fullName}
                </h1>
                <p className="text-base text-slate-300 font-semibold mt-1">
                  {selectedDriver.constructorName}
                </p>

                {selectedDriver.biography && (
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-2xl">
                    {selectedDriver.biography}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0d0d1f] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Championships</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {selectedDriver.championships || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">World Titles</div>
            </div>

            <div className="bg-[#0d0d1f] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase mb-1">
                <Award className="w-3.5 h-3.5 text-rose-400" />
                <span>Career Podiums</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {selectedDriver.podiums || (currentStanding?.wins ? currentStanding.wins * 2 : 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Top 3 Finishes</div>
            </div>

            <div className="bg-[#0d0d1f] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Season Rank</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                P{currentStanding?.position || '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {currentStanding?.points || 0} Championship Pts
              </div>
            </div>

            <div className="bg-[#0d0d1f] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Season Wins</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {currentStanding?.wins || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Grand Prix Victories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
