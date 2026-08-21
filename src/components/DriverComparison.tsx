import React, { useState, useEffect } from 'react';
import { Users, Trophy, Award, Zap, Flag, ArrowRightLeft, Sparkles, TrendingUp, Gauge } from 'lucide-react';
import { Driver, DriverStanding } from '../types';
import { JolpicaService } from '../services/jolpica';
import { DRIVERS } from '../data/fallbackF1Data';

const ALL_NOTABLE_DRIVERS: Driver[] = [
  DRIVERS.max_verstappen,
  DRIVERS.leclerc,
  DRIVERS.norris,
  DRIVERS.hamilton,
  DRIVERS.alonso,
  DRIVERS.piastri,
  DRIVERS.russell,
  DRIVERS.sainz,
  DRIVERS.perez,
  {
    driverId: 'michael_schumacher',
    permanentNumber: '7',
    code: 'MSC',
    givenName: 'Michael',
    familyName: 'Schumacher',
    fullName: 'Michael Schumacher',
    dateOfBirth: '1969-01-03',
    nationality: 'German',
    constructorName: 'Scuderia Ferrari / Benetton',
    teamColor: '#E8002D',
    championships: 7,
    podiums: 155,
    biography: '7-time World Drivers Champion with 91 Grand Prix victories. Dominated the late 1990s and 2000s.',
  },
  {
    driverId: 'ayrton_senna',
    permanentNumber: '1',
    code: 'SEN',
    givenName: 'Ayrton',
    familyName: 'Senna',
    fullName: 'Ayrton Senna',
    dateOfBirth: '1960-03-21',
    nationality: 'Brazilian',
    constructorName: 'McLaren / Lotus / Williams',
    teamColor: '#FF8000',
    championships: 3,
    podiums: 80,
    biography: 'Legendary 3-time World Champion renowned for qualifying mastery and wet-weather driving brilliance.',
  },
  {
    driverId: 'alain_prost',
    permanentNumber: '2',
    code: 'PRO',
    givenName: 'Alain',
    familyName: 'Prost',
    fullName: 'Alain Prost',
    dateOfBirth: '1955-02-24',
    nationality: 'French',
    constructorName: 'McLaren / Williams / Ferrari / Renault',
    teamColor: '#0093CC',
    championships: 4,
    podiums: 106,
    biography: '4-time World Champion known as "The Professor" for smooth calculated race management.',
  },
  {
    driverId: 'sebastian_vettel',
    permanentNumber: '5',
    code: 'VET',
    givenName: 'Sebastian',
    familyName: 'Vettel',
    fullName: 'Sebastian Vettel',
    dateOfBirth: '1987-07-03',
    nationality: 'German',
    constructorName: 'Red Bull Racing / Ferrari / Aston Martin',
    teamColor: '#3671C6',
    championships: 4,
    podiums: 122,
    biography: '4 consecutive World Championships (2010–2013) with Red Bull Racing and 53 career race victories.',
  },
];

export const DriverComparison: React.FC = () => {
  const [driverA, setDriverA] = useState<Driver>(DRIVERS.max_verstappen);
  const [driverB, setDriverB] = useState<Driver>(DRIVERS.hamilton);
  const [selectedSeason, setSelectedSeason] = useState<number>(2024);
  const [standings, setStandings] = useState<DriverStanding[]>([]);

  useEffect(() => {
    JolpicaService.getDriverStandings(selectedSeason).then(setStandings);
  }, [selectedSeason]);

  const standingA = standings.find((s) => s.driver.driverId === driverA.driverId);
  const standingB = standings.find((s) => s.driver.driverId === driverB.driverId);

  const statsList = [
    {
      label: 'World Championships',
      valA: driverA.championships || 0,
      valB: driverB.championships || 0,
      format: (v: number) => `${v} Titles`,
      icon: Trophy,
    },
    {
      label: 'Career Podiums',
      valA: driverA.podiums || (standingA?.wins ? standingA.wins * 2 : 0),
      valB: driverB.podiums || (standingB?.wins ? standingB.wins * 2 : 0),
      format: (v: number) => `${v} Podiums`,
      icon: Award,
    },
    {
      label: `${selectedSeason} Season Points`,
      valA: standingA?.points || 0,
      valB: standingB?.points || 0,
      format: (v: number) => `${v} PTS`,
      icon: Zap,
    },
    {
      label: `${selectedSeason} Season Wins`,
      valA: standingA?.wins || 0,
      valB: standingB?.wins || 0,
      format: (v: number) => `${v} Wins`,
      icon: Flag,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#121228] to-[#0d0d1f] border border-white/10 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#e8002d] tracking-widest uppercase">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Telemetry Head-to-Head</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            Driver & Champion Comparison
          </h2>
          <p className="text-sm text-slate-400">
            Compare active and legendary Formula 1 drivers point-to-point
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#16213e] border border-white/10 rounded-lg px-3 py-1.5 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase">Season Context:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
          >
            {JolpicaService.getAvailableYears().map((y) => (
              <option key={y} value={y} className="bg-[#0d0d1f]">
                {y} Season
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver A Selector */}
        <div className="bg-[#0d0d1f] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
          <span className="text-xs font-mono font-bold text-[#e8002d] uppercase">Driver 1:</span>
          <select
            value={driverA.driverId}
            onChange={(e) => {
              const d = ALL_NOTABLE_DRIVERS.find((item) => item.driverId === e.target.value);
              if (d) setDriverA(d);
            }}
            className="flex-1 bg-[#16213e] text-white font-bold text-sm py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#e8002d]"
          >
            {ALL_NOTABLE_DRIVERS.map((d) => (
              <option key={d.driverId} value={d.driverId}>
                {d.fullName} ({d.nationality})
              </option>
            ))}
          </select>
        </div>

        {/* Driver B Selector */}
        <div className="bg-[#0d0d1f] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Driver 2:</span>
          <select
            value={driverB.driverId}
            onChange={(e) => {
              const d = ALL_NOTABLE_DRIVERS.find((item) => item.driverId === e.target.value);
              if (d) setDriverB(d);
            }}
            className="flex-1 bg-[#16213e] text-white font-bold text-sm py-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-400"
          >
            {ALL_NOTABLE_DRIVERS.map((d) => (
              <option key={d.driverId} value={d.driverId}>
                {d.fullName} ({d.nationality})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Face-off Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver A Card */}
        <div className="relative bg-[#0d0d1f] border border-white/10 rounded-xl p-6 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: driverA.teamColor || '#e8002d' }}
          />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {driverA.headshotUrl ? (
                <img
                  src={driverA.headshotUrl}
                  alt={driverA.fullName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xl font-black font-mono text-white">{driverA.code}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/10 text-[#ff4d6d]">
                  #{driverA.driverNumber || driverA.permanentNumber || '—'}
                </span>
                <span className="text-xs text-slate-400">{driverA.nationality}</span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1">{driverA.fullName}</h3>
              <p className="text-xs text-slate-400">{driverA.constructorName}</p>
            </div>
          </div>
        </div>

        {/* Driver B Card */}
        <div className="relative bg-[#0d0d1f] border border-white/10 rounded-xl p-6 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: driverB.teamColor || '#27f4d2' }}
          />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {driverB.headshotUrl ? (
                <img
                  src={driverB.headshotUrl}
                  alt={driverB.fullName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xl font-black font-mono text-white">{driverB.code}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/10 text-cyan-300">
                  #{driverB.driverNumber || driverB.permanentNumber || '—'}
                </span>
                <span className="text-xs text-slate-400">{driverB.nationality}</span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1">{driverB.fullName}</h3>
              <p className="text-xs text-slate-400">{driverB.constructorName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Point-to-Point Comparison Rows */}
      <div className="bg-[#0d0d1f] border border-white/10 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
          Point-to-Point Metrics Comparison
        </h3>

        {statsList.map((stat, i) => {
          const isAWinner = stat.valA > stat.valB;
          const isBWinner = stat.valB > stat.valA;
          const total = (stat.valA || 0) + (stat.valB || 0) || 1;
          const percentA = Math.round((stat.valA / total) * 100);

          return (
            <div key={i} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className={`font-mono font-bold text-sm ${isAWinner ? 'text-[#ff4d6d]' : 'text-slate-300'}`}>
                  {stat.format(stat.valA)}
                  {isAWinner && ' ★'}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase">
                  <stat.icon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{stat.label}</span>
                </div>

                <div className={`font-mono font-bold text-sm ${isBWinner ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {isBWinner && '★ '}
                  {stat.format(stat.valB)}
                </div>
              </div>

              {/* Progress Bar Distribution */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-[#e8002d] to-[#ff4d6d] transition-all duration-300"
                  style={{ width: `${percentA}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-300"
                  style={{ width: `${100 - percentA}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
