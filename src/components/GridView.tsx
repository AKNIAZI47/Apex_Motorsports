import React, { useState, useMemo, useEffect } from 'react';
import { Users, Search, Filter } from 'lucide-react';
import { Driver, DriverStanding, MotorsportCategory } from '../types';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';
import { getDriverMedia } from '../data/driverMedia';
import { JolpicaService } from '../services/jolpica';

interface Props {
  onSelectDriver?: (driver: Driver) => void;
  onLaunchTelemetry?: (category: MotorsportCategory, circuitId?: string) => void;
  category?: MotorsportCategory;
  onSelectCategory?: (category: MotorsportCategory) => void;
}

export const GridView: React.FC<Props> = ({ 
  onSelectDriver, 
  onLaunchTelemetry,
  category: propCategory,
  onSelectCategory
}) => {
  const initialCat = propCategory === 'DRIFT' ? 'GTWORLD' : (propCategory || 'F1');
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>(initialCat);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (propCategory === 'DRIFT') {
      setSelectedCategory('GTWORLD');
      onSelectCategory?.('GTWORLD');
    } else if (propCategory) {
      setSelectedCategory(propCategory);
    }
  }, [propCategory, onSelectCategory]);

  const categoryMeta = MOTORSPORT_CATEGORIES[selectedCategory];

  const seasonData = useMemo(() => {
    return getCategoryStandings(selectedCategory, CURRENT_YEAR);
  }, [selectedCategory]);

  const [liveF1Standings, setLiveF1Standings] = useState<DriverStanding[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (selectedCategory !== 'F1') {
      setLiveF1Standings(null);
      return;
    }
    JolpicaService.getCurrentF1Standings().then((snapshot) => {
      if (!cancelled) setLiveF1Standings(snapshot.live ? snapshot.driverStandings : null);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  const standings = liveF1Standings || seasonData.driverStandings || [];

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
      {/* Clean Grid Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#121215] border border-white/10 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] tracking-widest uppercase">
            <Users className="w-3.5 h-3.5" />
            <span>{categoryMeta?.name || selectedCategory} Championship Grid</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            Active Competitors ({standings.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Driver Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, team, #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff1744]"
            />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {filteredStandings.length === 0 ? (
        <div className="p-12 text-center bg-[#121215] rounded-2xl border border-white/5">
          <Filter className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-mono text-slate-400">No competitors found matching &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStandings.map((entry) => {
            const driver = entry.driver;
            const ctor = entry.constructors?.[0];
            const teamColor = driver.teamColor || ctor?.color || '#ff1744';
            const carModel = ctor?.carModel || ctor?.powerUnit;
            const media = getDriverMedia(driver, selectedCategory);

            return (
              <div
                key={driver.driverId}
                onClick={() => onSelectDriver?.(driver)}
                className="group bg-[#121215] hover:bg-[#18181f] border border-white/10 hover:border-white/25 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex flex-col justify-between cursor-pointer overflow-hidden relative"
              >
                {/* Team color accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                  style={{ backgroundColor: teamColor }}
                />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      P{entry.position} • {entry.points} PTS
                    </span>
                    <span className="text-sm font-black font-mono text-white/60 group-hover:text-white transition-colors">
                      #{driver.permanentNumber || driver.driverNumber || entry.position}
                    </span>
                  </div>

                  {/* Driver Headshot & Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {driver.code || driver.familyName?.substring(0, 3)?.toUpperCase()}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white group-hover:text-[#ff1744] transition-colors leading-tight truncate">
                        {driver.fullName}
                      </h3>
                      <p className="text-xs font-semibold truncate mt-0.5" style={{ color: teamColor }}>
                        {driver.constructorName || ctor?.name}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {driver.nationality}
                      </div>
                    </div>
                  </div>

                  {carModel && (
                    <div className="text-[10px] text-slate-400 font-mono truncate bg-black/30 px-2 py-1 rounded border border-white/5">
                      {carModel}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{entry.wins} Wins • {driver.podiums || 0} Podiums</span>
                  <span className="text-[#ff1744] font-bold group-hover:underline">View Profile →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
