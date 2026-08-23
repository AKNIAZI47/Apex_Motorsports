import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Calendar, 
  Flag, 
  User, 
  Sparkles, 
  Zap, 
  Shield, 
  ChevronRight, 
  Search, 
  Gauge, 
  Compass, 
  Flame,
  Activity
} from 'lucide-react';
import { Driver, MotorsportCategory } from '../types';
import { getAllMotorsportDrivers, getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';

interface Props {
  initialDriver?: Driver | null;
}

const CATEGORY_CHIPS: { id: MotorsportCategory | 'ALL'; label: string; color: string }[] = [
  { id: 'ALL', label: 'All Competitors', color: '#ffffff' },
  { id: 'F1', label: 'Formula 1', color: '#e8002d' },
  { id: 'MOTOGP', label: 'MotoGP', color: '#dc2626' },
  { id: 'WSBK', label: 'WorldSBK', color: '#0284c7' },
  { id: 'WEC', label: 'WEC / 24H', color: '#0072ce' },
  { id: 'WRC', label: 'WRC Rally', color: '#ff9800' },
  { id: 'INDYCAR', label: 'IndyCar', color: '#0284c7' },
  { id: 'SUPERCARS', label: 'Supercars V8', color: '#2563eb' },
  { id: 'DTM', label: 'DTM GT3', color: '#e11d48' },
  { id: 'DRIFT', label: 'Formula Drift', color: '#10b981' },
];

export const DriverProfile: React.FC<Props> = ({ initialDriver }) => {
  const allDrivers = useMemo(() => getAllMotorsportDrivers(), []);
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory | 'ALL'>(
    initialDriver?.category || 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    initialDriver?.driverId || ''
  );

  const filteredDrivers = useMemo(() => {
    return allDrivers.filter((d) => {
      const matchCat = selectedCategory === 'ALL' || d.category === selectedCategory;
      const matchSearch =
        d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.constructorName && d.constructorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [allDrivers, selectedCategory, searchQuery]);

  // Derived selected driver without setting state in useEffect
  const selectedDriver = useMemo(() => {
    if (selectedDriverId) {
      const found = allDrivers.find((d) => d.driverId === selectedDriverId);
      if (found) return found;
    }
    return filteredDrivers[0] || allDrivers[0];
  }, [allDrivers, selectedDriverId, filteredDrivers]);

  // Find standings for the selected driver
  const driverCat = selectedDriver?.category || 'F1';
  const categoryData = getCategoryStandings(driverCat, CURRENT_YEAR);
  const currentStanding = categoryData.driverStandings.find(
    (s) => s.driver.driverId === selectedDriver?.driverId
  );

  const catMeta = MOTORSPORT_CATEGORIES[driverCat];
  const teamColor = selectedDriver?.teamColor || catMeta?.badgeColor || '#e8002d';

  if (!selectedDriver) {
    return (
      <div className="p-12 text-center text-slate-400">
        No motorsport competitor profile loaded.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#121215] border border-white/10 rounded-2xl shadow-xl relative overflow-hidden">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: teamColor }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff1744] tracking-widest uppercase">
            <User className="w-3.5 h-3.5" />
            <span>Universal Driver Dossier & 2026 World Championship Statistics</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mt-1">
            Motorsport Competitor Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Official 2026 racing profiles across F1, MotoGP, WSBK, WEC, WRC, IndyCar, Supercars, DTM & Formula Drift
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 z-10">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver, team, country..."
            className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff1744] transition-colors"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORY_CHIPS.map((chip) => {
          const isSelected = selectedCategory === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setSelectedCategory(chip.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-r from-[#e8002d]/20 to-white/10 border-[#ff1744] text-white shadow-lg shadow-[#ff1744]/10'
                  : 'bg-[#121215] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              {chip.id !== 'ALL' && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: chip.color }}
                />
              )}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Split: List on Left, Profile on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Driver List (Left 4 columns) */}
        <div className="md:col-span-4 bg-[#121215] border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[760px] shadow-xl">
          <div className="p-3.5 bg-[#18181b] border-b border-white/10 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Drivers Roster</span>
            <span className="font-mono text-emerald-400 font-bold">{filteredDrivers.length} Competitors</span>
          </div>

          <div className="overflow-y-auto divide-y divide-white/5 flex-1">
            {filteredDrivers.map((d) => {
              const isSelected = d.driverId === selectedDriver.driverId;
              const catInfo = MOTORSPORT_CATEGORIES[d.category || 'F1'];

              return (
                <button
                  key={d.driverId}
                  onClick={() => setSelectedDriverId(d.driverId)}
                  className={`w-full text-left p-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-l-4 border-[#e8002d]'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: d.teamColor || catInfo?.badgeColor || '#888' }}
                    />
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{d.fullName}</span>
                        {d.permanentNumber && (
                          <span className="font-mono text-[11px] text-slate-500 font-normal">
                            #{d.permanentNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[180px]">
                        {d.constructorName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span 
                      className="inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase"
                      style={{ 
                        backgroundColor: `${catInfo?.badgeColor || '#e8002d'}22`,
                        color: catInfo?.badgeColor || '#ff4d6d'
                      }}
                    >
                      {d.category || 'F1'}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {d.nationality}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver Detail Pane (Right 8 columns) */}
        <div className="md:col-span-8 space-y-6">
          {/* Hero Card */}
          <div className="relative bg-[#121215] border border-white/10 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none -mr-20 -mt-20"
              style={{ backgroundColor: teamColor }}
            />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {/* Photo / Badge */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-2xl blur-md opacity-20"
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
                    className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center font-mono font-black border-2 border-white/10 text-white shadow-2xl relative z-10"
                    style={{ backgroundColor: `${teamColor}33`, borderColor: teamColor }}
                  >
                    <span className="text-3xl">
                      {selectedDriver.code || selectedDriver.familyName?.substring(0, 3)?.toUpperCase() || 'DRV'}
                    </span>
                    <span className="text-[10px] tracking-widest text-slate-400 mt-1 uppercase font-sans">
                      {selectedDriver.category || 'PRO'}
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span 
                    className="px-2.5 py-0.5 rounded text-xs font-black tracking-widest uppercase font-mono"
                    style={{ 
                      backgroundColor: `${catMeta?.badgeColor || '#e8002d'}22`,
                      color: catMeta?.badgeColor || '#ff4d6d'
                    }}
                  >
                    {selectedDriver.category || 'F1'} Championship
                  </span>

                  {selectedDriver.permanentNumber && (
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs font-bold">
                      Car #{selectedDriver.permanentNumber}
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-xs">
                    {selectedDriver.nationality}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                  {selectedDriver.fullName}
                </h2>

                <p className="text-base font-semibold" style={{ color: teamColor }}>
                  {selectedDriver.constructorName}
                </p>

                {selectedDriver.biography && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-2">
                    {selectedDriver.biography}
                  </p>
                )}
              </div>
            </div>

            {/* Quick 4 Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="bg-[#18181b] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>2026 Points</span>
                </div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {currentStanding?.points ?? '0'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Rank P{currentStanding?.position ?? '-'}
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
                <div className="text-[10px] text-slate-500 font-mono">This Season</div>
              </div>

              <div className="bg-[#18181b] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>Career Podiums</span>
                </div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {selectedDriver.podiums ?? '0'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">All-time</div>
              </div>

              <div className="bg-[#18181b] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  <span>World Titles</span>
                </div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {selectedDriver.championships ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Championships</div>
              </div>
            </div>
          </div>

          {/* Technical Specifications & Vehicle Machinery Card */}
          <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-[#ff1744]" />
              <span>2026 Machine & Power Unit Architecture</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-medium">Chassis / Model</div>
                <div className="text-sm font-bold text-white mt-1">
                  {currentStanding?.constructors[0]?.carModel || `${selectedDriver.constructorName} Spec-2026`}
                </div>
              </div>

              <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-medium">Power Unit / Engine</div>
                <div className="text-sm font-bold text-emerald-400 mt-1 font-mono">
                  {currentStanding?.constructors[0]?.powerUnit || 'High Performance Racing Engine'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
