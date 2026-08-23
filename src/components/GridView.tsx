import React, { useState, useMemo } from 'react';
import { Sparkles, Layers, Search, Filter, Zap } from 'lucide-react';
import { Driver, MotorsportCategory } from '../types';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { DISCIPLINE_TELEMETRY } from '../data/disciplineTelemetryData';
import { getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';

interface Props {
  onSelectDriver?: (driver: Driver) => void;
  onLaunchTelemetry?: (category: MotorsportCategory) => void;
}

export const GridView: React.FC<Props> = ({ onSelectDriver, onLaunchTelemetry }) => {
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>('F1');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Object.keys(MOTORSPORT_CATEGORIES) as MotorsportCategory[];
  const categoryConfig = DISCIPLINE_TELEMETRY[selectedCategory];
  const categoryMeta = MOTORSPORT_CATEGORIES[selectedCategory];

  const seasonData = useMemo(() => {
    return getCategoryStandings(selectedCategory, CURRENT_YEAR);
  }, [selectedCategory]);

  const standings = seasonData.driverStandings || [];

  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return standings;
    const query = searchQuery.toLowerCase();
    return standings.filter(
      (entry) =>
        entry.driver.fullName.toLowerCase().includes(query) ||
        entry.driver.constructorName?.toLowerCase().includes(query) ||
        entry.constructors?.[0]?.name?.toLowerCase().includes(query) ||
        entry.driver.nationality.toLowerCase().includes(query) ||
        String(entry.driver.driverNumber || '').includes(query) ||
        (entry.driver.code && entry.driver.code.toLowerCase().includes(query))
    );
  }, [standings, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 9 Category Discipline Bar */}
      <div className="p-3 glass-panel-elevated rounded-2xl border border-white/10 shadow-xl flex flex-col gap-2">
        {/* 9 Category Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {categories.map((catKey) => {
            const config = DISCIPLINE_TELEMETRY[catKey];
            const isSelected = selectedCategory === catKey;
            const meta = MOTORSPORT_CATEGORIES[catKey];

            return (
              <button
                key={catKey}
                onClick={() => {
                  setSelectedCategory(catKey);
                  setSearchQuery('');
                }}
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
                  <span className="truncate">{config?.shortCode || catKey}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header with Search and Series Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel-elevated border border-white/10 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{categoryMeta?.name || 'Motorsport'}</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            {categoryMeta?.name || selectedCategory} Grid
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Driver Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, team, #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff1744]"
            />
          </div>

          {onLaunchTelemetry && (
            <button
              onClick={() => onLaunchTelemetry(selectedCategory)}
              className="px-3.5 py-2 rounded-xl bg-[#ff1744]/20 border border-[#ff1744]/50 hover:bg-[#ff1744]/30 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff1744]/20"
            >
              <Zap className="w-3.5 h-3.5 text-[#ff1744]" />
              <span>Simulate Track</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {filteredStandings.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-white/5">
          <Filter className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-mono text-slate-400">No competitors found matching &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredStandings.map((entry) => {
            const driver = entry.driver;
            const ctor = entry.constructors?.[0];
            const teamColor = driver.teamColor || ctor?.color || '#ff1744';
            const carModel = ctor?.carModel || ctor?.powerUnit;

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

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      P{entry.position} • {entry.points} PTS
                    </span>
                    <span className="text-lg font-black font-mono text-white/50 group-hover:text-white transition-colors">
                      #{driver.permanentNumber || driver.driverNumber}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-[#ff1744] transition-colors leading-tight">
                    {driver.fullName}
                  </h3>

                  <p className="text-xs font-semibold mt-1" style={{ color: teamColor }}>
                    {driver.constructorName || ctor?.name}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {driver.nationality}
                  </div>

                  {carModel && (
                    <div className="text-[10px] text-slate-500 font-mono mt-2 truncate bg-black/30 px-2 py-1 rounded">
                      {carModel}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{entry.wins} Wins • {driver.podiums || 0} Podiums</span>
                  <span className="text-[#ff1744] font-bold group-hover:underline">View Dossier →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
