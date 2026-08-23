import React, { useState, useMemo } from 'react';
import { Shield, Trophy, Wrench, Users, Gauge, Cpu, Flame } from 'lucide-react';
import { Constructor, Driver, MotorsportCategory } from '../types';
import { getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';

interface Props {
  onSelectDriver?: (driver: Driver) => void;
}

const CATEGORY_CHIPS: { id: MotorsportCategory; label: string; color: string }[] = [
  { id: 'F1', label: 'Formula 1', color: '#e8002d' },
  { id: 'MOTOGP', label: 'MotoGP', color: '#dc2626' },
  { id: 'WSBK', label: 'WorldSBK', color: '#0284c7' },
  { id: 'WEC', label: 'WEC Hypercar', color: '#0072ce' },
  { id: 'WRC', label: 'WRC Rally', color: '#ff9800' },
  { id: 'INDYCAR', label: 'IndyCar', color: '#0284c7' },
  { id: 'SUPERCARS', label: 'Supercars V8', color: '#2563eb' },
  { id: 'DTM', label: 'DTM GT3', color: '#e11d48' },
  { id: 'DRIFT', label: 'Formula Drift', color: '#10b981' },
];

export const ConstructorProfile: React.FC<Props> = ({ onSelectDriver }) => {
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>('F1');
  const [selectedCtorId, setSelectedCtorId] = useState<string>('');

  const seasonData = useMemo(() => {
    return getCategoryStandings(selectedCategory, CURRENT_YEAR);
  }, [selectedCategory]);

  const standings = seasonData.constructorStandings;
  const drivers = seasonData.driverStandings;

  const selectedCtor = useMemo(() => {
    if (selectedCtorId) {
      const found = standings.find((s) => s.constructor.constructorId === selectedCtorId);
      if (found) return found.constructor;
    }
    return standings[0]?.constructor;
  }, [standings, selectedCtorId]);

  const currentStanding = standings.find(
    (c) => c.constructor.constructorId === selectedCtor?.constructorId
  );

  // Find drivers belonging to this constructor
  const teamDrivers = drivers.filter(
    (d) =>
      d.constructors.some((c) => c.constructorId === selectedCtor?.constructorId) ||
      d.driver.constructorName?.toLowerCase().includes(selectedCtor?.name.toLowerCase().split(' ')[0] || '')
  );

  const catMeta = MOTORSPORT_CATEGORIES[selectedCategory];
  const teamColor = selectedCtor?.color || catMeta?.badgeColor || '#e8002d';

  if (!selectedCtor) {
    return (
      <div className="p-12 text-center text-slate-400">
        No constructor profile loaded.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#121215] border border-white/10 rounded-2xl shadow-xl relative overflow-hidden">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: teamColor }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff1744] tracking-widest uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>2026 World Championship Constructor Technical Bureau</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            Constructor Championship Profiles
          </h2>
          <p className="text-sm text-slate-400">
            Technical specs, powertrain architecture, car models, and driver pairings across all 9 disciplines
          </p>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORY_CHIPS.map((chip) => {
          const isSelected = selectedCategory === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => {
                setSelectedCategory(chip.id);
                setSelectedCtorId('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-r from-[#e8002d]/20 to-white/10 border-[#ff1744] text-white shadow-lg shadow-[#ff1744]/10'
                  : 'bg-[#121215] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: chip.color }}
              />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Split: Constructor List & Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Team Selector */}
        <div className="md:col-span-4 bg-[#121215] border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[720px] shadow-xl">
          <div className="p-3.5 bg-[#18181b] border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>{selectedCategory} Constructors</span>
            <span className="font-mono text-emerald-400">{standings.length} Teams</span>
          </div>

          <div className="overflow-y-auto divide-y divide-white/5 flex-1">
            {standings.map((s) => {
              const isSelected = s.constructor.constructorId === selectedCtor.constructorId;
              const c = s.constructor;

              return (
                <button
                  key={c.constructorId}
                  onClick={() => setSelectedCtorId(c.constructorId)}
                  className={`w-full text-left p-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-l-4 border-[#e8002d]'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-8 rounded-full"
                      style={{ backgroundColor: c.color || '#e8002d' }}
                    />
                    <div>
                      <div className="font-bold text-sm text-white">
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {c.carModel || c.nationality}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-black text-white">
                      {s.points} PTS
                    </div>
                    <div className="text-[11px] text-slate-400">
                      P{s.position} • {s.wins} Wins
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Constructor Detail View */}
        <div className="md:col-span-8 space-y-6">
          {/* Main Hero Card */}
          <div className="relative bg-[#121215] border border-white/10 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none -mr-20 -mt-20"
              style={{ backgroundColor: teamColor }}
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span 
                  className="px-2.5 py-0.5 rounded text-xs font-black tracking-widest uppercase font-mono"
                  style={{ 
                    backgroundColor: `${teamColor}22`,
                    color: teamColor
                  }}
                >
                  {selectedCategory} Factory Team
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                  {selectedCtor.nationality}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                {selectedCtor.name}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                <div className="bg-[#18181b] p-3 rounded-xl border border-white/5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span>2026 Points</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {currentStanding?.points ?? '0'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Championship Rank P{currentStanding?.position ?? '-'}
                  </div>
                </div>

                <div className="bg-[#18181b] p-3 rounded-xl border border-white/5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-red-500" />
                    <span>2026 Wins</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {currentStanding?.wins ?? '0'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Victories</div>
                </div>

                <div className="bg-[#18181b] p-3 rounded-xl border border-white/5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span>Titles</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {selectedCtor.championships ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Championships</div>
                </div>

                <div className="bg-[#18181b] p-3 rounded-xl border border-white/5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>Team Principal</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-2 truncate">
                    {selectedCtor.teamPrincipal || 'Factory Management'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-[#ff1744]" />
              <span>2026 Vehicle & Engine Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-400" />
                  <span>Car / Chassis Model</span>
                </div>
                <div className="text-base font-bold text-white mt-1.5">
                  {selectedCtor.carModel || `${selectedCtor.name} Spec-2026`}
                </div>
              </div>

              <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Power Unit & Powertrain</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-1.5 font-mono">
                  {selectedCtor.powerUnit || 'Competition High Output Power Unit'}
                </div>
              </div>
            </div>
          </div>

          {/* Driver Lineup */}
          <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Users className="w-4 h-4 text-[#ff1744]" />
                <span>2026 Driver Lineup</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamDrivers.map((standing) => {
                const d = standing.driver;
                return (
                  <div
                    key={d.driverId}
                    onClick={() => onSelectDriver && onSelectDriver(d)}
                    className="p-4 bg-[#18181b] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                        <span>#{d.permanentNumber || d.driverNumber}</span>
                        <span>•</span>
                        <span>{d.nationality}</span>
                      </div>
                      <div className="text-base font-bold text-white group-hover:text-[#ff1744] transition-colors mt-0.5">
                        {d.fullName}
                      </div>
                      <div className="text-xs font-mono text-emerald-400 mt-1">
                        {standing.points} PTS • P{standing.position}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
