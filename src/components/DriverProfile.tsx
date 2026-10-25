import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Search, 
  Gauge, 
  Flame, 
  Shield, 
  Car,
  Flag,
  User
} from 'lucide-react';
import { Driver, MotorsportCategory } from '../types';
import { getAllMotorsportDrivers, getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { getDriverMedia } from '../data/driverMedia';

interface Props {
  initialDriver?: Driver | null;
  category?: MotorsportCategory;
  onSelectCategory?: (category: MotorsportCategory) => void;
}

export const DriverProfile: React.FC<Props> = ({ 
  initialDriver,
  category: propCategory,
  onSelectCategory
}) => {
  const allDrivers = useMemo(() => {
    return getAllMotorsportDrivers().filter((d) => d.category !== 'DRIFT');
  }, []);
  
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory | 'ALL'>(
    (propCategory === 'DRIFT' ? 'GTWORLD' : propCategory) || initialDriver?.category || 'F1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    initialDriver?.driverId || ''
  );

  React.useEffect(() => {
    if (propCategory === 'DRIFT') {
      setSelectedCategory('GTWORLD');
      onSelectCategory?.('GTWORLD');
    } else if (propCategory) {
      setSelectedCategory(propCategory);
    }
  }, [propCategory, onSelectCategory]);

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

  // Get media (portrait and ride image)
  const media = useMemo(() => {
    if (!selectedDriver) return null;
    return getDriverMedia(selectedDriver, driverCat);
  }, [selectedDriver, driverCat]);

  if (!selectedDriver) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-sm">
        No driver profile loaded.
      </div>
    );
  }

  const isMotorcycle = driverCat === 'MOTOGP' || driverCat === 'WSBK';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Main 2-Column Split: Driver List on Left, Profile Detail on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Driver List (Left 4 columns) */}
        <div className="md:col-span-4 bg-[#121215] border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[820px] shadow-xl">
          {/* Header with Integrated Search */}
          <div className="p-3.5 bg-[#18181b] border-b border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>{catMeta?.name || 'Championship'} Drivers</span>
              <span className="font-mono text-emerald-400 font-bold">{filteredDrivers.length} Competitors</span>
            </div>

            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver, team, country..."
                className="w-full bg-[#121215] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff1744] transition-colors"
              />
            </div>
          </div>

          {/* Scrollable Drivers List */}
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
                      className="w-2 h-9 rounded-full"
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
                    <div className="text-xs text-slate-300 font-mono font-bold">
                      {d.nationality}
                    </div>
                    {d.code && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        {d.code}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver Detail Pane (Right 8 columns) */}
        <div className="md:col-span-8 space-y-6">
          {/* Driver Overview Card */}
          <div className="relative bg-[#121215] border border-white/10 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none -mr-20 -mt-20"
              style={{ backgroundColor: teamColor }}
            />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {/* Photo */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-2xl blur-md opacity-20"
                  style={{ backgroundColor: teamColor }}
                />
                <div
                  className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center font-mono font-black border-2 border-white/10 text-white shadow-2xl relative z-10"
                  style={{ backgroundColor: `${teamColor}33`, borderColor: teamColor }}
                >
                  <span className="text-3xl">
                    {selectedDriver.code || selectedDriver.familyName?.substring(0, 3)?.toUpperCase() || 'DRV'}
                  </span>
                  <span className="text-[10px] tracking-widest text-slate-400 mt-1 uppercase font-sans">
                    #{selectedDriver.permanentNumber || '00'}
                  </span>
                </div>
              </div>

              {/* Driver Details & Bio */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {selectedDriver.permanentNumber && (
                    <span className="px-2.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs font-bold">
                      Car #{selectedDriver.permanentNumber}
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                    {selectedDriver.nationality}
                  </span>

                  {selectedDriver.dateOfBirth && (
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-xs font-mono">
                      DOB: {selectedDriver.dateOfBirth}
                    </span>
                  )}
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

          {/* Professional Car Details Card (with Vehicle Photo) */}
          <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Car className="w-4 h-4 text-[#ff1744]" />
                <span>{isMotorcycle ? 'Motorcycle Details' : 'Car Details'}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {selectedDriver.constructorName}
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-[10px] font-mono uppercase text-slate-400">Machinery</div>
              <div className="text-lg font-bold text-white mt-1">
                {currentStanding?.constructors[0]?.carModel || 'Model not supplied by the current data source'}
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-medium">Chassis / Model</div>
                <div className="text-sm font-bold text-white mt-1">
                  {currentStanding?.constructors[0]?.carModel || `${selectedDriver.constructorName} Competition Spec`}
                </div>
              </div>

              <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-medium">Engine / Power Unit</div>
                <div className="text-sm font-bold text-emerald-400 mt-1 font-mono">
                  {currentStanding?.constructors[0]?.powerUnit || media?.rideEngine || 'Racing Engine Spec'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
