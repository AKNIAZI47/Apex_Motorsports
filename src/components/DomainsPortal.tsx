import React from 'react';
import { 
  Trophy, 
  ChevronRight, 
  Compass, 
  Flag
} from 'lucide-react';
import { MotorsportCategory } from '../types';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';

interface DomainsPortalProps {
  onSelectDomain: (category: MotorsportCategory) => void;
  onOpenUniversalNews?: () => void;
}

const DOMAIN_ORDER: MotorsportCategory[] = [
  'F1',
  'GTWORLD',
  'MOTOGP',
  'WEC',
  'WSBK',
  'WRC',
  'INDYCAR',
  'SUPERCARS',
  'DTM'
];

export const DomainsPortal: React.FC<DomainsPortalProps> = ({
  onSelectDomain
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#ff1744]/15 text-[#ff4d6d] border border-[#ff1744]/30 mb-1">
            <Compass className="w-3 h-3" />
            <span>Championship Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Championship Domains
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Select a motorsport series to enter its dedicated live telemetry, standings, drivers, and constructor garage.
          </p>
        </div>
      </div>

      {/* 9 Championship Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOMAIN_ORDER.map((catKey) => {
          const cat = MOTORSPORT_CATEGORIES[catKey];
          if (!cat) return null;

          return (
            <div
              key={catKey}
              onClick={() => onSelectDomain(catKey)}
              className="group relative glass-panel-elevated rounded-2xl border border-white/10 hover:border-white/25 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ff1744]/10 cursor-pointer flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-black/60">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/40 to-transparent" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-mono font-black text-white shadow-lg backdrop-blur-md"
                    style={{ backgroundColor: cat.badgeColor }}
                  >
                    {cat.governingBody} • {cat.shortCode}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-black/70 text-slate-300 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                    2026 Season
                  </span>
                </div>

                {/* Flagship Event Label */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                    <Flag className="w-3 h-3 text-[#ff4d6d]" />
                    <span className="truncate">{cat.flagshipEvent}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-gradient-to-b from-[#0b0c10] to-[#050508]">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-[#ff4d6d] transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2">
                    {cat.tagline}
                  </p>
                </div>

                {/* Leader Preview (Points Leader Only) */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Points Leader</div>
                      <div className="text-xs font-black text-white truncate">{cat.championshipLeader.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{cat.championshipLeader.team}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="text-sm font-black font-mono text-amber-400">
                      {cat.championshipLeader.points}
                    </span>
                    <span className="block text-[9px] font-mono text-slate-500 uppercase">PTS</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDomain(catKey);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/10 text-white hover:bg-[#ff1744] hover:shadow-lg hover:shadow-[#ff1744]/30"
                >
                  <span>Enter {cat.shortCode} Domain</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
