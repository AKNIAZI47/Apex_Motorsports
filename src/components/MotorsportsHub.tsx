import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Gauge, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  ExternalLink, 
  Activity, 
  Sliders, 
  Sparkles, 
  ChevronRight,
  Info,
  Calendar,
  Compass,
  Play
} from 'lucide-react';
import { MotorsportCategory } from '../types';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { DISCIPLINE_TELEMETRY } from '../data/disciplineTelemetryData';

interface Props {
  onLaunchTelemetry?: (category: MotorsportCategory, circuitId?: string) => void;
  onViewF1Dashboard?: () => void;
}

export const MotorsportsHub: React.FC<Props> = ({ onLaunchTelemetry, onViewF1Dashboard }) => {
  const [activeCategory, setActiveCategory] = useState<MotorsportCategory>('WEC');

  const categories = Object.keys(MOTORSPORT_CATEGORIES) as MotorsportCategory[];
  const selectedInfo = MOTORSPORT_CATEGORIES[activeCategory];
  const telemetryConfig = DISCIPLINE_TELEMETRY[activeCategory];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Category Selection Bar with High-Impact Badges */}
      <div className="p-6 glass-panel-elevated rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff1744]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] uppercase tracking-widest">
              <Compass className="w-4 h-4" />
              <span>Apex Global Racing Disciplines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              Motorsport Category Matrix
            </h2>
            <p className="text-sm text-slate-300/80 mt-1 max-w-2xl font-mono">
              Explore 9 world championship disciplines with authentic powertrains, live telemetry replays, and real competitor grids.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-black bg-white/10 text-white border border-white/15">
              9 Disciplines Available
            </span>
          </div>
        </div>

        {/* Categories Grid Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {categories.map((catId) => {
            const cat = MOTORSPORT_CATEGORIES[catId];
            const isSelected = activeCategory === catId;

            return (
              <button
                key={catId}
                onClick={() => setActiveCategory(catId)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center relative group ${
                  isSelected
                    ? 'bg-gradient-to-b from-white/15 to-white/5 border-[#ff1744] text-white shadow-lg shadow-[#ff1744]/25 scale-102 ring-1 ring-[#ff1744]/50'
                    : 'glass-card text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mb-1.5 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: cat.badgeColor }}
                />
                <span className="text-xs font-black font-mono tracking-wider text-white">
                  {cat.shortCode}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-full">
                  {catId === 'DRIFT' ? 'PRO DRIFT' : catId === 'WEC' ? '24H / HYPER' : catId}
                </span>

                {isSelected && (
                  <div
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ backgroundColor: cat.badgeColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Deep-Dive Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Showcase & Technical Stats */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visual Card */}
          <div className="glass-panel-elevated rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
            <div className="relative h-72 sm:h-84 w-full overflow-hidden bg-black/80">
              <img
                src={selectedInfo.imageUrl}
                alt={selectedInfo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04040a] via-[#04040a]/60 to-transparent" />

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/70 text-slate-200 backdrop-blur-md border border-white/15">
                  {selectedInfo.flagshipEvent}
                </span>
              </div>

              {/* Title & Tagline Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">
                  {selectedInfo.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 drop-shadow font-mono">
                  {selectedInfo.tagline}
                </p>

                {/* Primary Action Button: Launch Dedicated Telemetry Replay */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      if (onLaunchTelemetry) {
                        onLaunchTelemetry(activeCategory, telemetryConfig?.defaultCircuitId);
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e8002d] to-[#ff1744] text-white font-mono font-bold text-xs shadow-xl shadow-[#ff1744]/30 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch {selectedInfo.shortCode} Telemetry</span>
                  </button>

                  {activeCategory === 'F1' && onViewF1Dashboard && (
                    <button
                      onClick={onViewF1Dashboard}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-slate-200 hover:text-white font-mono font-bold text-xs border border-white/20 hover:scale-105 transition-all cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>View F1 Season Standings</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Spec Matrix Pills */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/10 bg-white/[0.02]">
              <div className="p-3.5 rounded-xl glass-card border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Max Power Output</span>
                </div>
                <div className="text-sm font-black text-white font-mono mt-1">
                  {selectedInfo.powerOutput}
                </div>
              </div>

              <div className="p-3.5 rounded-xl glass-card border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Peak Top Speed</span>
                </div>
                <div className="text-sm font-black text-white font-mono mt-1">
                  {selectedInfo.topSpeed}
                </div>
              </div>

              <div className="p-3.5 rounded-xl glass-card border border-white/5 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <Flame className="w-3.5 h-3.5 text-[#ff1744]" />
                  <span>Machinery Spec</span>
                </div>
                <div className="text-xs font-bold text-white mt-1 line-clamp-2">
                  {selectedInfo.machineryType}
                </div>
              </div>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Info className="w-4 h-4 text-[#ff1744]" />
              <span>Championship Architecture & Profile</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedInfo.description}
            </p>
          </div>
        </div>

        {/* Right Column: Regulations, Championship Leaders & Signature Tracks */}
        <div className="lg:col-span-5 space-y-6">
          {/* Championship Leaders */}
          <div className="glass-panel-elevated p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                  Standings & Title Leader
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                P1 LEADER
              </span>
            </div>

            {/* Leader Card */}
            <div className="p-4 rounded-xl glass-card border border-white/10 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-400 font-mono">Championship Leader</div>
                <div className="text-base font-black text-white mt-0.5">
                  {selectedInfo.championshipLeader.name}
                </div>
                <div className="text-xs text-[#ff4d6d] font-semibold mt-0.5">
                  {selectedInfo.championshipLeader.team}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  🚗 {selectedInfo.championshipLeader.vehicle}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-white font-mono">
                  {selectedInfo.championshipLeader.points}
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">PTS / SCORE</div>
              </div>
            </div>

            {/* Leading Manufacturer */}
            <div className="p-3.5 rounded-xl glass-card border border-white/5 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px]">Leading Manufacturer:</span>
                <span className="text-white font-bold text-sm">{selectedInfo.constructorLeader.name}</span>
              </div>
              <div className="font-bold text-white text-sm">
                {selectedInfo.constructorLeader.points} PTS
              </div>
            </div>
          </div>

          {/* Key Technical Regulations */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Technical & Sporting Regulations</span>
            </h4>

            <div className="space-y-2.5 mt-2">
              {selectedInfo.keyRegulations.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-snug">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff1744] mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Circuits */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Iconic Venues & Circuit Telemetry</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {selectedInfo.signatureCircuits.map((track, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onLaunchTelemetry) {
                      onLaunchTelemetry(activeCategory, telemetryConfig?.defaultCircuitId);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl glass-card border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 hover:border-[#ff1744] hover:text-white transition-all cursor-pointer"
                >
                  <Activity className="w-3 h-3 text-[#ff1744]" />
                  <span>{track}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
