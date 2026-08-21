import React, { useEffect, useState } from 'react';
import { Shield, Trophy, Wrench, Users, MapPin, Gauge, Cpu } from 'lucide-react';
import { Constructor, ConstructorStanding, Driver } from '../types';
import { JolpicaService } from '../services/jolpica';
import { CONSTRUCTORS, DRIVERS } from '../data/fallbackF1Data';

interface Props {
  onSelectDriver?: (driver: Driver) => void;
}

export const ConstructorProfile: React.FC<Props> = ({ onSelectDriver }) => {
  const years = JolpicaService.getAvailableYears();
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [standings, setStandings] = useState<ConstructorStanding[]>([]);
  const [selectedCtor, setSelectedCtor] = useState<Constructor>(CONSTRUCTORS.mclaren);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      JolpicaService.getConstructorStandings(selectedYear),
      JolpicaService.getDriversForSeason(selectedYear),
    ]).then(([ctorData, driverData]) => {
      setStandings(ctorData);
      setDrivers(driverData);
      if (ctorData.length > 0) {
        const found = ctorData.find((c) => c.constructor.constructorId === selectedCtor.constructorId);
        if (!found) {
          setSelectedCtor(ctorData[0].constructor);
        }
      }
      setLoading(false);
    });
  }, [selectedYear]);

  const currentStanding = standings.find(
    (c) => c.constructor.constructorId === selectedCtor.constructorId
  );

  // Find drivers that belong to this constructor
  const teamDrivers = drivers.filter(
    (d) =>
      d.constructorId === selectedCtor.constructorId ||
      d.constructorName?.toLowerCase().includes(selectedCtor.name.toLowerCase().split(' ')[0])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#121228] to-[#0d0d1f] border border-white/10 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#e8002d] tracking-widest uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Constructor Technical Bureau</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            Constructor Championship Profiles
          </h2>
          <p className="text-sm text-slate-400">
            Technical specs, powertrain architecture, car models, and driver pairings
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

      {/* 2-Column Split: Constructor List & Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Team Selector */}
        <div className="md:col-span-4 bg-[#0d0d1f] border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-[720px]">
          <div className="p-3.5 bg-[#16213e]/60 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
            {selectedYear} Constructors ({standings.length})
          </div>

          <div className="overflow-y-auto divide-y divide-white/5 flex-1">
            {standings.map((s) => {
              const isSelected = s.constructor.constructorId === selectedCtor.constructorId;
              const c = s.constructor;

              return (
                <button
                  key={c.constructorId}
                  onClick={() => setSelectedCtor(c)}
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
                      className="w-2.5 h-6 rounded-md"
                      style={{ backgroundColor: c.color || '#888' }}
                    />
                    <div>
                      <div className="font-bold text-sm text-white">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.nationality}</div>
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

        {/* Right Detail Pane */}
        <div className="md:col-span-8 space-y-6">
          {/* Hero Banner with Team Color Glow */}
          <div className="relative bg-[#0d0d1f] border border-white/10 rounded-xl p-6 sm:p-8 overflow-hidden">
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none -mr-20 -mt-20"
              style={{ backgroundColor: selectedCtor.color || '#e8002d' }}
            />

            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-8 rounded-md"
                    style={{ backgroundColor: selectedCtor.color || '#e8002d' }}
                  />
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-white/10 text-slate-300">
                    {selectedCtor.nationality}
                  </span>
                  {selectedCtor.carModel && (
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#e8002d]/20 text-[#ff4d6d] border border-[#e8002d]/30">
                      Chassis: {selectedCtor.carModel}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {selectedCtor.name}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Formula One World Constructors Championship Contender
                </p>
              </div>

              {/* Standings Badge */}
              <div className="text-right shrink-0 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-400 uppercase">Season Standing</div>
                <div className="text-3xl font-black font-mono text-white mt-0.5">
                  P{currentStanding?.position || '—'}
                </div>
                <div className="text-xs font-mono font-bold text-[#e8002d]">
                  {currentStanding?.points || 0} PTS
                </div>
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase">Power Unit</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedCtor.powerUnit || '1.6L V6 Turbo Hybrid'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase">Team Principal</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedCtor.teamPrincipal || 'Team Leadership'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase">Headquarters</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedCtor.headquarters || 'Europe'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Lineup Cards */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#e8002d]" />
              <span>Official Driver Lineup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamDrivers.length > 0 ? (
                teamDrivers.map((driver) => (
                  <div
                    key={driver.driverId}
                    onClick={() => onSelectDriver?.(driver)}
                    className="bg-[#0d0d1f] hover:bg-[#121228] border border-white/10 hover:border-white/20 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                        {driver.headshotUrl ? (
                          <img
                            src={driver.headshotUrl}
                            alt={driver.fullName}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="font-mono font-bold text-sm text-white">
                            {driver.code}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-[#e8002d]">
                          #{driver.driverNumber || driver.permanentNumber} • {driver.code}
                        </div>
                        <div className="font-bold text-white text-base">{driver.fullName}</div>
                        <div className="text-xs text-slate-400">{driver.nationality}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-500 bg-[#0d0d1f] border border-white/10 rounded-xl">
                  Lineup data syncing for this constructor.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
