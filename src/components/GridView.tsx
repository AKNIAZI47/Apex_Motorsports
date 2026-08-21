import React, { useEffect, useState } from 'react';
import { Trophy, Award, Flag, User, Sparkles, Zap, Layers, Play, Compass } from 'lucide-react';
import { Driver, DriverStanding, MotorsportCategory } from '../types';
import { JolpicaService } from '../services/jolpica';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { DISCIPLINE_TELEMETRY } from '../data/disciplineTelemetryData';

interface Props {
  onSelectDriver?: (driver: Driver) => void;
  onLaunchTelemetry?: (category: MotorsportCategory) => void;
}

export const GridView: React.FC<Props> = ({ onSelectDriver, onLaunchTelemetry }) => {
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>('F1');
  const years = JolpicaService.getAvailableYears();
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = Object.keys(MOTORSPORT_CATEGORIES) as MotorsportCategory[];
  const categoryConfig = DISCIPLINE_TELEMETRY[selectedCategory];
  const categoryMeta = MOTORSPORT_CATEGORIES[selectedCategory];

  useEffect(() => {
    if (selectedCategory === 'F1') {
      setLoading(true);
      JolpicaService.getDriverStandings(selectedYear).then((data) => {
        setStandings(data);
        setLoading(false);
      });
    }
  }, [selectedCategory, selectedYear]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 9 Category Discipline Bar */}
      <div className="p-4 glass-panel-elevated rounded-2xl border border-white/10 shadow-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Select Series Grid & Driver Roster</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Official Competitor Machinery & Lineups
          </span>
        </div>

        {/* 9 Category Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {categories.map((catKey) => {
            const config = DISCIPLINE_TELEMETRY[catKey];
            const isSelected = selectedCategory === catKey;
            const meta = MOTORSPORT_CATEGORIES[catKey];

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`py-2 px-2 rounded-xl text-center font-mono font-bold text-xs transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#ff1744]/25 to-white/10 border-[#ff1744] text-white shadow-lg shadow-[#ff1744]/30 scale-102 ring-1 ring-[#ff1744]'
                    : 'glass-card text-slate-400 hover:text-white hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta?.badgeColor || '#ff1744' }}
                  />
                  <span className="truncate">{config.shortCode}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel-elevated border border-white/10 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{categoryMeta?.name || 'Motorsport'} Official Competitor Grid</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            {selectedCategory === 'F1' ? `${selectedYear} Formula 1 Official Grid` : `${categoryConfig.shortCode} Competitors & Machinery`}
          </h2>
          <p className="text-sm text-slate-400 font-mono mt-0.5">
            {categoryMeta?.tagline || 'Official driver lineup, constructors, numbers, and powertrain specs'}
          </p>
        </div>

        {selectedCategory === 'F1' ? (
          <div className="flex items-center gap-2 bg-[#090a14] border border-white/15 rounded-xl px-3.5 py-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Season:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer font-mono"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[#0d0d1f]">
                  {y} Season
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-mono font-bold">
            {categoryConfig.drivers.length} Official Competitors
          </div>
        )}
      </div>

      {/* Grid Content */}
      {selectedCategory === 'F1' ? (
        loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 glass-panel rounded-2xl border border-white/5">
            <div className="w-10 h-10 border-3 border-[#ff1744] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-mono font-semibold text-slate-400">Loading Grid Lineup...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {standings.map((entry) => {
              const driver = entry.driver;
              const ctor = entry.constructors?.[0];
              const teamColor = driver.teamColor || ctor?.color || '#ff1744';

              return (
                <div
                  key={driver.driverId}
                  onClick={() => onSelectDriver?.(driver)}
                  className="group relative glass-panel-elevated hover:bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ff1744]/15 flex flex-col justify-between cursor-pointer overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                    style={{ backgroundColor: teamColor }}
                  />

                  <div className="absolute right-3 top-4 text-6xl font-black font-mono text-white/[0.04] group-hover:text-white/[0.08] select-none pointer-events-none transition-colors">
                    {driver.driverNumber || entry.position}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/5 border border-white/10 text-slate-300">
                        P{entry.position}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                        {driver.nationality}
                      </span>
                    </div>

                    <div className="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"
                        style={{ backgroundColor: teamColor }}
                      />
                      {driver.headshotUrl ? (
                        <img
                          src={driver.headshotUrl}
                          alt={driver.fullName}
                          className="w-full h-full object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/10 text-white font-black text-2xl font-mono shadow-inner"
                          style={{ backgroundColor: `${teamColor}33`, borderColor: teamColor }}
                        >
                          {driver.code || driver.familyName?.substring(0, 3)?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="text-center mt-2">
                      <div className="text-xs font-mono font-bold tracking-widest text-[#ff1744]">
                        {driver.code} • #{driver.driverNumber || driver.permanentNumber || entry.position}
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-rose-300 transition-colors">
                        {driver.fullName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                        {ctor?.name || driver.constructorName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="bg-white/[0.02] rounded py-1.5">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Points</span>
                      <span className="font-mono font-black text-white text-sm">{entry.points}</span>
                    </div>
                    <div className="bg-white/[0.02] rounded py-1.5">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Wins</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{entry.wins}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Non-F1 Official Category Competitor Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {categoryConfig.drivers.map((driver, idx) => {
            const teamColor = driver.color || '#ff1744';

            return (
              <div
                key={driver.driverId || driver.code}
                className="group relative glass-panel-elevated hover:bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ff1744]/15 flex flex-col justify-between overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                  style={{ backgroundColor: teamColor }}
                />

                <div className="absolute right-3 top-4 text-6xl font-black font-mono text-white/[0.04] group-hover:text-white/[0.08] select-none pointer-events-none transition-colors">
                  {driver.number}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/5 border border-white/10 text-slate-300">
                      P{idx + 1}
                    </span>
                    <span
                      className="text-xs font-mono font-black px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: `${teamColor}44`, border: `1px solid ${teamColor}` }}
                    >
                      #{driver.number}
                    </span>
                  </div>

                  <div className="relative w-20 h-20 mx-auto my-3 flex items-center justify-center">
                    <div
                      className="w-18 h-18 rounded-2xl flex items-center justify-center border-2 text-white font-black text-2xl font-mono shadow-xl"
                      style={{ backgroundColor: `${teamColor}22`, borderColor: teamColor }}
                    >
                      {driver.code}
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <div className="text-xs font-mono font-bold tracking-widest text-[#ff1744]">
                      {categoryConfig.shortCode} • #{driver.number}
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-rose-300 transition-colors">
                      {driver.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono mt-0.5 font-bold">
                      {driver.team}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1 bg-white/5 p-1.5 rounded-lg border border-white/5">
                      🏎️ {driver.vehicle}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg">
                    <span className="text-slate-400 text-[11px]">Powertrain:</span>
                    <span className="font-bold text-white text-[11px]">{driver.powerOutput || 'Full Competition Spec'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg">
                    <span className="text-slate-400 text-[11px]">Specialty:</span>
                    <span className="font-bold text-amber-300 text-[11px]">{driver.specialtyMetric || 'P1 Leader'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
